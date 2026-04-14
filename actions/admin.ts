"use server";

import { VerificationStatus } from "@/lib/generated/prisma";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// create the following server actions
// 1. verifyAdmin
// 2. Get Pending Doctors
// 3. Get Verified Doctors
// 4. Update doctor status
// 5. Suspend Doctor

export const verifyAdmin = async () => {
  const { userId } = await auth();

  if (!userId) return false;

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    return user?.role === "ADMIN";
  } catch (error) {
    console.error(error);

    throw new Error(
      error instanceof Error
        ? `Verification Failed: ${error.message}`
        : "Verification Failed",
    );
  }
};

export const getPendingDoctors = async () => {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) throw new Error("UnAuthorized");

  try {
    const pendingDoctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        verificationStatus: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { doctors: pendingDoctors };
  } catch (error) {
    console.error(error);

    throw new Error(
      error instanceof Error
        ? `failed to return pending doctors: ${error.message}`
        : "failed to return pending doctors",
    );
  }
};

export const getVerifiedDoctors = async () => {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) throw new Error("UnAuthorized");

  try {
    const verifiedDoctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return { doctors: verifiedDoctors };
  } catch (error) {
    console.error(error);

    throw new Error(
      error instanceof Error
        ? `failed to return verified doctors: ${error.message}`
        : "failed to return verified doctors",
    );
  }
};

function toProperStatus(value: string): VerificationStatus | undefined {
  if (Object.values(VerificationStatus).includes(value as VerificationStatus)) {
    return value as VerificationStatus;
  }
  return undefined;
}

export const updateDoctorStatus = async (formData: FormData) => {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) throw new Error("UnAuthorized");

  try {
    const doctorId = formData.get("doctorId")?.toString();

    const status = toProperStatus(formData.get("status") as string);

    if (!doctorId && !["PENDING", "VERIFIED"].includes(status as string)) {
      throw new Error("Invalid Status");
    }

    await db.user.update({
      where: {
        id: doctorId,
      },
      data: {
        verificationStatus: status,
      },
    });

    revalidatePath("/doctor");

    return { success: true };
  } catch (error) {
    console.error(error);

    throw new Error(
      error instanceof Error
        ? `failed to update doctor status: ${error.message}`
        : "failed to update doctor status",
    );
  }
};

export const suspendDoctor = async (formdata: FormData) => {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) throw new Error("UnAuthorized");

  try {
    const doctorId = formdata.get("doctorId")?.toString();
    const suspend = Boolean(formdata.get("suspend"));

    if (!doctorId) {
      throw new Error("Doctor ID is required");
    }

    const status = suspend ? "PENDING" : "VERIFIED";

    await db.user.update({
      where: {
        id: doctorId,
      },
      data: {
        verificationStatus: status,
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(error);

    throw new Error(
      error instanceof Error
        ? `doctor supension failed: ${error.message}`
        : "doctor supension failed",
    );
  }
};
