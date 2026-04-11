//steps
//1. get the user Id from clerk using auth intance
//2. find the user in the User database by compaing the clerk id
// Note: throw errors if user is not found or unauthorised]
//3. if user.role is not equal to "PATIENT" or "DOCTOR" throe error that invalid user role
// 4. if user is a patient then change user role to patient and redirect to appointments page
// 5. if user is a doctor then validate formData for all required doctor details and then change user role to doctor and redirect to "/"

"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export type userRoleRespType = {
  success: boolean;
  redirect: string;
};

export async function setUserRole(
  formData: FormData,
): Promise<userRoleRespType | undefined> {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("user not found");

    const role = formData.get("role")?.toString();

    if (!role || !["PATIENT", "DOCTOR"].includes(role)) {
      throw new Error("Invalid user role");
    }

    if (role === "PATIENT") {
      await db.user.update({
        where: {
          clerkUserId: userId,
        },
        data: {
          role: "PATIENT",
        },
      });

      revalidatePath("/");
      return { success: true, redirect: "/doctors" };
    }

    if (role === "DOCTOR") {
      const speciality = String(formData.get("speciality"));
      const experience = Number(formData.get("experience"));
      const description = String(formData.get("description"));
      const credentialURL = String(formData.get("credentialURL"));

      await db.user.update({
        where: {
          clerkUserId: userId,
        },
        data: {
          role: "DOCTOR",
          speciality,
          experience,
          description,
          credentialURL,
          verificationStatus: "PENDING",
        },
      });

      revalidatePath("/");
      return { success: true, redirect: "/doctor/verification" };
    }
  } catch (error) {
    console.error(error);

    throw new Error(
      error instanceof Error
        ? `user role update failed: ${error.message}`
        : "user role update failed",
    );
  }
}

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("user not found");

    return user;
  } catch (error) {
    console.error(error);

    throw new Error(
      error instanceof Error
        ? `failed to get user info ${error.message}`
        : `failed to get user info`,
    );
  }
}
