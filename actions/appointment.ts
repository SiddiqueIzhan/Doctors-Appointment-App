"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { addDays, addMinutes, endOfDay, format, isBefore } from "date-fns";
import { deductCreditsFromPatients } from "./credits";
import { revalidatePath } from "next/cache";
import { Vonage } from "@vonage/server-sdk";
import { Auth } from "@vonage/auth";
import { MediaMode } from "@vonage/video";

export type TimeSlot = {
  startTime: string;
  endTime: string;
  formatted: string;
  day: string;
};

export type resultType = {
  date: string;
  displayDate: string;
  slots: TimeSlot[];
};

export type AvailableSlotsPerDay = Record<string, TimeSlot[]>;

// Initialize Vonage Video API client
const credentials = new Auth({
  applicationId: process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID,
  privateKey: process.env.VONAGE_PRIVATE_KEY,
});
const options = {};
const vonage = new Vonage(credentials, options);

// get doctor by ID
export async function getDoctorById(doctorId: string) {
  try {
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    return { doctor };
  } catch (error) {
    console.error(error);

    throw new Error(
      error instanceof Error
        ? `user role update failed: ${error.message}`
        : "user role update failed",
    );
  }
}

// get appointments slots next 4 days
export async function getAvailableTimeSlots(doctorId: string) {
  try {
    // Validate if the doctor exist
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!doctor) {
      throw new Error("Doctor ID is Required");
    }

    // find first availability by doctorID
    const availability = await db.availability.findFirst({
      where: {
        doctorId: doctor.id,
        status: "AVAILABLE",
      },
    });

    if (!availability) {
      throw new Error("Availibility not found");
      // return { days: [] };
    }

    // get the next four days
    const now = new Date();
    const days = [
      addDays(now, 1),
      addDays(now, 2),
      addDays(now, 3),
      addDays(now, 4),
    ];

    // fetch all existing appointment for the next 4 days
    const lastDay = endOfDay(days[3]);
    const existingAppointments = await db.appointment.findMany({
      where: {
        id: doctor.id,
        status: "SCHEDULED",
        startTime: {
          lte: lastDay,
        },
      },
    });

    const availableSlotsPerDay: AvailableSlotsPerDay = {};

    for (const day of days) {
      const dayString = format(day, "yyyy-MM-dd");

      availableSlotsPerDay[dayString] = [];

      // create a copy of startTime and endTime when the doctor has updated the availability
      const startTime = new Date(availability.startTime);
      const endTime = new Date(availability.endTime);

      // set the date to the current date we are processing
      startTime.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
      endTime.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());

      let current = new Date(startTime);
      let end = new Date(endTime);

      while (
        isBefore(addMinutes(current, 30), end) ||
        +addMinutes(current, 30) === +end
      ) {
        const next = addMinutes(current, 30);

        if (isBefore(current, now)) {
          current = next;
          continue;
        }

        const overlap = existingAppointments.some((appointments) => {
          const aStart = new Date(appointments.startTime);
          const aEnd = new Date(appointments.endTime);

          return (
            (current >= aStart && current < aEnd) ||
            (end > aStart && end <= aEnd) ||
            (current < aStart && end > aEnd)
          );
        });

        if (!overlap) {
          availableSlotsPerDay[dayString].push({
            startTime: current.toISOString(),
            endTime: end.toISOString(),
            formatted: `${format(current, "h:mm a")} - ${format(
              next,
              "h:mm a",
            )}`,
            day: format(current, "EEEE, MMMM d"),
          });
        }

        current = next;
      }
    }

    // Convert to array of slots grouped by day for easier consumption by the UI
    const result = Object.entries(availableSlotsPerDay).map(
      ([date, slots]) => ({
        date,
        displayDate:
          slots.length > 0
            ? slots[0].day
            : format(new Date(date), "EEEE, MMMM d"),
        slots,
      }),
    );

    return { days: result };
  } catch (error) {
    console.error(error);

    throw new Error(
      error instanceof Error
        ? `cannot get slots: ${error.message}`
        : "cannot get slots",
    );
  }
}

export async function bookAppointment(formdata: FormData) {
  const { userId } = await auth();

  if (!userId) throw new Error("UnAuthorized");

  try {
    const patient = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!patient) {
      throw new Error("Patient Not Found");
    }

    const doctorId = formdata.get("doctorId")?.toString();
    const startTime = formdata.get("startTime")?.toString();
    const endTime = formdata.get("endTime")?.toString();
    const description = formdata.get("description")?.toString() || null;

    if (!doctorId || !startTime || !endTime) {
      throw new Error("Doctor ID, Start TIme and End Time are required");
    }

    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!doctor) {
      throw new Error("Doctor Not Found");
    }

    if (patient.credits < 2) {
      throw new Error("insufficient balance to book appointments");
    }

    const overlappingAppointments = await db.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        status: "SCHEDULED",
        OR: [
          // New appointment starts during an existing appointment
          {
            startTime: { lte: startTime },
            endTime: { gt: endTime },
          },
          {
            startTime: { lte: startTime },
            endTime: { gt: endTime },
          },
          {
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
        ],
      },
    });

    if (overlappingAppointments) {
      throw new Error("This time slot is already booked");
    }

    const sessionID = await createVideoSession();

    const { success, error } = await deductCreditsFromPatients(
      patient.id,
      doctor.id,
    );

    if (!success) {
      throw new Error(`failed to deduct credits: ${error}`);
    }

    const appointment = await db.appointment.create({
      data: {
        doctorId: doctor.id,
        patientId: patient.id,
        startTime: startTime,
        endTime: endTime,
        patientDescription: description,
        videoSessionId: sessionID,
        status: "SCHEDULED",
      },
    });

    revalidatePath("/appointments");
    return { success: true, appointment: appointment };
  } catch (error) {
    console.error(error);

    throw new Error(
      error instanceof Error
        ? `failed to book appointment: ${error.message}`
        : "failed to book appointment",
    );
  }
}

export async function createVideoSession() {
  try {
    const session = await vonage.video.createSession({
      mediaMode: MediaMode.ROUTED,
    });
    return session.sessionId;
  } catch (error) {
    console.log(error);
    throw new Error(
      error instanceof Error
        ? `Failed to create video session:  ${error.message}`
        : "Failed to create video session: ",
    );
  }
}

export async function getDoctorAppointments() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorised");
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
      throw new Error("Doctor Not Found");
    }

    const appointments = await db.appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: "SCHEDULED",
      },
      include: {
        patient: true,
      },
    });

    if (!appointments) {
      throw new Error("No Appointments found for this doctor");
    }

    revalidatePath("/doctor");
    return { success: true, appointments };
  } catch (error) {
    console.log(error);
  }
}

export async function cancelAppointment(formdata: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorised");
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("User Not Found");
    }

    const appointmentId = formdata.get("appointmentId")?.toString();

    const appointment = await db.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!appointment) {
      throw new Error("Appointment Not Found");
    }

    if (user.id !== appointment.doctorId || user.id !== appointment.patientId) {
      throw new Error("User Not Authorized to cancel this Appointment");
    }

    if (appointment.status !== "SCHEDULED") {
      throw new Error("Only Scheduled Appointments can be cancelled");
    }

    await db.$transaction(async (tx) => {
      await tx.appointment.update({
        where: {
          id: appointmentId,
        },
        data: {
          status: "CANCELLED",
        },
      });

      await tx.creditTransaction.create({
        data: {
          userId: appointment.doctorId,
          amount: -2,
          type: "APPOINTMENT_DEDUCTION",
        },
      });

      //create transaction entry for doctor
      await tx.creditTransaction.create({
        data: {
          userId: appointment.patientId,
          amount: 2,
          type: "APPOINTMENT_DEDUCTION",
        },
      });

      // get updated user details
      await tx.user.update({
        where: { id: appointment.doctorId },
        data: {
          credits: {
            decrement: 2,
          },
        },
      });

      //update doctor details
      await tx.user.update({
        where: { id: appointment.patientId },
        data: {
          credits: {
            increment: 2,
          },
        },
      });
    });

    if (user.role === "DOCTOR") {
      revalidatePath("/doctor");
    } else if (user.role === "PATIENT") {
      revalidatePath("/appointments");
    }

    return { success: true };
  } catch (error) {
    console.log(error);
  }
}

export async function addDoctorNotesForPatitent(formdata: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorised");
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
      throw new Error("Doctor Not Found");
    }

    const appointmentId = formdata.get("appointmentId")?.toString();
    const notes = formdata.get("notes")?.toString();

    if (!appointmentId) {
      throw new Error("appointment ID is required");
    }

    const appointment = await db.appointment.findUnique({
      where: {
        id: appointmentId,
      },
    });

    if (!appointment) {
      throw new Error("No Appointment found");
    }

    await db.appointment.update({
      where: {
        id: appointment.id,
      },
      data: {
        notes: notes,
      },
    });

    revalidatePath("/doctor");
    return { success: true };
  } catch (error) {
    console.log(error);
  }
}

export async function markAsCompleted(formdata: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorised");
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
      throw new Error("Doctor Not Found");
    }

    const appointmentId = formdata.get("appointmentId")?.toString();

    if (!appointmentId) {
      throw new Error("appointment ID is required");
    }

    const appointment = await db.appointment.findUnique({
      where: {
        id: appointmentId,
      },
    });

    if (!appointment) {
      throw new Error("No Appointment found");
    }

    if (appointment.status !== "SCHEDULED") {
      throw new Error("Only Scheduled appointments can be marked as completed");
    }

    const now = new Date();
    if (now < appointment.endTime) {
      throw new Error("Cannot Mark As Completed before End Time");
    }

    await db.appointment.update({
      where: {
        id: appointment.id,
      },
      data: {
        status: "COMPLETED",
      },
    });

    revalidatePath("/doctor");
    return { success: true };
  } catch (error) {
    console.log(error);
  }
}

export async function generateVideoSessionToken(formdata: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("UnAuthorized");
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("User Not Found");
    }

    const appointmentId = formdata.get("appointmentId")?.toString();

    const appointment = await db.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      // include: {
      //   doctor: true,
      //   patient: true
      // }
    });

    if (!appointment) {
      throw new Error("Appointment Not Found");
    }

    if (user.id !== appointment.patientId || user.id !== appointment.doctorId) {
      throw new Error("You are not authorized to join this call");
    }

    if (appointment.status !== "SCHEDULED") {
      throw new Error("You can only join scheduled appointments");
    }

    const now = new Date().getTime();
    const startTime = new Date(appointment.startTime).getTime();

    const timeDiff = ((now - startTime) / 1000) * 60;

    if (now < startTime && timeDiff > 30) {
      throw new Error("Call is available 30 minutes before the scheduled time");
    }

    const appointmentEndTime = new Date(appointment.endTime).getTime();

    const expirationTime = Math.floor(appointmentEndTime / 1000) + 60 * 60; // 1 hr after the end time

    // use user name and role as connection data
    const connectionData = JSON.stringify({
      name: user.name,
      userId: user.id,
      role: user.role,
    });

    if (appointment.videoSessionId) {
      const token = vonage.video.generateClientToken(
        appointment.videoSessionId,
        {
          data: connectionData,
          expireTime: expirationTime,
          role: "publisher",
        },
      );

      await db.appointment.update({
        where: { id: appointment.id },
        data: { videoSessionToken: token },
      });

      return {
        success: true,
        videoSessionId: appointment.videoSessionId,
        token: token,
      };
    }

    return { success: false };
  } catch (error) {
    console.log(error);
  }
}
