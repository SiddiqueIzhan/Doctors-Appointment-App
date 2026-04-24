"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const setAvailabilitySlots = async (formData: FormData) => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  try {
    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
      include: {
        doctorAppointments: true,
      },
    });

    if (!doctor) {
      throw new Error("Doctor Not Found");
    }

    const doctorAppointments = doctor.doctorAppointments.map((appointment) => {
      return { startTime: appointment.startTime, endTime: appointment.endTime };
    });

    // get start time and endd time from formdata
    const startTime = formData.get("startTime")?.toString();
    const endTime = formData.get("endTime")?.toString();

    if (!startTime || !endTime) {
      throw new Error("Start Time and End Time is required");
    }

    if (startTime >= endTime) {
      throw new Error("StartTime must be before end time");
    }

    // find existing time slots for the logged in doctor
    const existingSlots = await db.availability.findMany({
      where: {
        doctorId: doctor.id,
      },
    });

    if (existingSlots.length > 0) {
      const slotsWithNoAppointments = existingSlots.filter(
        (slot) =>
          !doctorAppointments.some(
            (appointment) =>
              appointment.startTime.getTime() === slot.startTime.getTime() &&
              appointment.endTime.getTime() === slot.endTime.getTime(),
          ),
      );

      if (slotsWithNoAppointments.length > 0) {
        await db.availability.deleteMany({
          where: {
            id: {
              in: slotsWithNoAppointments.map((slot) => slot.id),
            },
          },
        });
      }
    }

    const newSlot = await db.availability.create({
      data: {
        doctorId: doctor.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "AVAILABLE",
      },
    });

    revalidatePath("/doctor");
    return { success: true, slot: newSlot };
  } catch (error) {
    console.error(error);

    throw new Error(
      error instanceof Error
        ? `Failed to set availiability: ${error.message}`
        : "Failed to set availiability",
    );
  }
};

export const getAvailabilitySlots = async () => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  try {
    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
      include: {
        doctorAppointments: true,
      },
    });

    if (!doctor) {
      throw new Error("Doctor Not Found");
    }

    const slots = await db.availability.findMany({
      where: {
        doctorId: doctor.id,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return { availableSlots: slots };
  } catch (error) {
    console.error(error);

    throw new Error(
      error instanceof Error
        ? `Failed to get availiability slots: ${error.message}`
        : "Failed to get availiability slots",
    );
  }
};

// export const getAllAppointments = async () => {
//   return [];
// };
