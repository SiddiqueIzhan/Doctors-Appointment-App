"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const CREDIT_VALUE = 10; // $10
const PLATFORM_FEE_PER_CREDIT = 2; // $2
const DOCTOR_EARNINGS_PER_CREDIT = 8; // $8

export async function requestPayout(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("not authorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const payoutEmail = formData.get("payoutemail")?.toString();

    if (!payoutEmail) {
      throw new Error("Payout Email Not Found");
    }

    const pendingPayout = await db.payout.findFirst({
      where: {
        doctorId: doctor.id,
        status: "PROCESSING",
      },
    });

    if (pendingPayout) {
      throw new Error("You have a pending payout, Please wait until processed");
    }

    const credits = doctor.credits;

    if (credits === 0) {
      throw new Error("No credits available for payout");
    }

    if (credits < 1) {
      throw new Error("At least one credit required for payout");
    }

    const totalAmount = credits * CREDIT_VALUE;
    const platformFee = credits * PLATFORM_FEE_PER_CREDIT;
    const netAmount = credits * DOCTOR_EARNINGS_PER_CREDIT;

    const payout = await db.payout.create({
      data: {
        doctorId: doctor.id,
        amount: totalAmount,
        credits,
        netAmount,
        platformFee,
        paypalEmail: payoutEmail,
      },
    });

    revalidatePath("/doctor");

    return { success: true, payout };
  } catch (error) {
    console.log(error);
  }
}

export async function getDoctorPayouts() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("not authorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!doctor) {
      throw new Error("Doctor Not Found");
    }

    const payout = await db.payout.findMany({
      where: {
        doctorId: doctor.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return payout;
  } catch (error) {
    console.log(error);
  }
}

export async function getDoctorEarnings() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("not authorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const completeAppointments = await db.appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: "COMPLETED",
      },
    });

    // get the current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const thisMonthAppointments = completeAppointments.filter(
      (appointment) => new Date(appointment.createdAt) > currentMonth,
    );

    const totalEarnings = doctor.credits * DOCTOR_EARNINGS_PER_CREDIT;

    const currentMonthEarnings =
      thisMonthAppointments.length * 2 * DOCTOR_EARNINGS_PER_CREDIT;

    const averageEarningsPerMonth =
      totalEarnings > 0
        ? totalEarnings / Math.max(1, new Date().getMonth() + 1)
        : 0;

    // Get current credit balance for payout calculations
    const availableCredits = doctor.credits;
    const availablePayout = availableCredits * DOCTOR_EARNINGS_PER_CREDIT;

    return {
      earnings: {
        totalEarnings,
        currentMonthEarnings,
        completedAppointments: completeAppointments.length,
        averageEarningsPerMonth,
        availableCredits,
        availablePayout,
      },
    };
  } catch (error) {
    console.log(error);
  }
}
