"use server";

import { Prisma, User } from "@/lib/generated/prisma/client";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

//define credit allocation per plan
const PLAN_CREDITS = {
  free_user: 0, // basic plan 2 credits
  standard: 10, // Standard plan: 10 credits per month
  premium: 24, // premium plan: 254 credits per month
};

const APPOINTMENT_CREDIT_COST = 2;

export type UserWithTransactions = Prisma.UserGetPayload<{
  include: {
    transactions: true;
  };
}>;

export async function checkAndAllocateCredits(user: UserWithTransactions) {
  try {
    if (!user) return null; // user is not present

    if (user.role !== "PATIENT") return user; // allocate credit only for patients

    const { has } = await auth(); // check the current subscription

    const hasBasic = has({ plan: "free_user" });
    const hasStandard = has({ plan: "standard" });
    const hasPremium = has({ plan: "premium" });

    let currentPlan = null;
    let creditsToAllocate = 0;

    if (hasPremium) {
      currentPlan = "premium"; // store details in temporary variable
      creditsToAllocate = PLAN_CREDITS.premium;
    } else if (hasStandard) {
      currentPlan = "standard";
      creditsToAllocate = PLAN_CREDITS.standard;
    } else if (hasBasic) {
      currentPlan = "free_user";
      creditsToAllocate = PLAN_CREDITS.free_user;
    }

    if (!currentPlan) return user; // if not plans then return user

    const currentMonth = format(new Date(), "yyyy-MM"); // change date format

    if (user.transactions.length > 0) {
      const latestTransaction = user.transactions[0]; // get the latest transaction
      const transactionMonth = format(
        new Date(latestTransaction.createdAt), // get the latest month where transaction was done
        "yyyy-MM",
      );
      const transactionPlan = latestTransaction.packageID;

      //If we already allocated credits for this month and the plan is the same, just return
      if (
        transactionMonth === currentMonth &&
        transactionPlan === currentPlan
      ) {
        return user;
      }
    }

    const updatedUser = await db.$transaction(async (tx) => {
      // $transaction is used to achieve concurrency if one Api call fails the entire operation fails, if every api call is successfull then every transaction is successfull

      // create transaction data for a user
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: creditsToAllocate,
          type: "CREDIT_PURCHASE",
          packageID: currentPlan,
        },
      });

      // update users credit balance
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { credits: { increment: creditsToAllocate } },
      });

      return updatedUser;
    });

    revalidatePath("/doctors");
    revalidatePath("/appointments");

    return updatedUser;
  } catch (error) {
    console.error(`failed to allocate credits: ${error}`);
  }
}

export async function deductCreditsFromPatients(
  userId: string,
  doctorId: string,
) {
  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    const doctor = await db.user.findUnique({ where: { id: doctorId } });

    if (!user) {
      throw new Error("user is required");
    }

    if (user.credits < APPOINTMENT_CREDIT_COST) {
      throw new Error("Insufficient Balance");
    }

    if (!doctor) {
      throw new Error("Doctor Not found");
    }

    const result = await db.$transaction(async (tx) => {
      // create transaction entry for user(patient)
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -APPOINTMENT_CREDIT_COST,
          type: "APPOINTMENT_DEDUCTION",
        },
      });

      //create transaction entry for doctor
      await tx.creditTransaction.create({
        data: {
          userId: doctor.id,
          amount: APPOINTMENT_CREDIT_COST,
          type: "APPOINTMENT_DEDUCTION",
        },
      });

      // get updated user details
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          credits: {
            decrement: APPOINTMENT_CREDIT_COST,
          },
        },
      });

      //update doctor details
      await tx.user.update({
        where: { id: doctor.id },
        data: {
          credits: {
            increment: APPOINTMENT_CREDIT_COST,
          },
        },
      });

      return updatedUser;
    });

    return { success: true, user: result };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    } else {
      return { success: false };
    }
  }
}
