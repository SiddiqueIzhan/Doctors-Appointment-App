import { Availability, Payout, User } from "@/lib/generated/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { LucideIcon } from "lucide-react";
import { SetStateAction } from "react";

export interface LayoutProps {
  children: React.ReactNode;
}

export interface DoctorProps {
  doctors: User[];
}

export interface PendingPayoutsProps {
  payouts: PayoutWithUser[];
}

export interface DoctorAppointmentsProps {
  appointments: appointmentsWithPatients[];
}

export type earningsDataType = {
  totalEarnings: number;
  currentMonthEarnings: number;
  completedAppointments: number;
  averageEarningsPerMonth: number;
  availableCredits: number;
  availablePayout: number;
};

export interface EarningsProps {
  earningsData: earningsDataType | null;
  payouts: Payout[];
}

export type timeDataType = {
  startTime: string;
  endTime: string;
};

export interface SlotsProps {
  slots: Availability[];
}

export interface SpecialityPageProps {
  params: Promise<{
    speciality: string;
  }>;
}

export interface DoctorIDType {
  params: Promise<{
    id: string;
  }>;
  children?: React.ReactNode;
}

export interface AppointmentFormProps {
  doctorId: string;
  slot: TimeSlot;
  onBack: () => void;
  onComplete: () => void;
}

export interface DoctorProfileProps {
  doctor: User;
  availableDays: resultType[];
}

export interface SlotBookingSectionProps {
  onSelectSlot: (slot: TimeSlot) => void;
  availableDays: resultType[];
}

export interface VideoCallProps {
  sessionId: string;
  token: string;
}

export interface VideoCallPageProps {
  searchParams: Promise<VideoCallProps>;
}

export interface AppointmentCardProps {
  appointment: appointmentsWithPatients | appointmentsWithDoctors;
  userRole: "DOCTOR" | "PATIENT";
}

export interface DoctorCardProps {
  doctor: User;
}

export interface DoctorDialogBoxType extends AppointmentCardProps {
  open: boolean;
  setOpen: (value: SetStateAction<boolean>) => void;
}

export interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  backLink?: string;
  backLabel?: string;
}

export type PayoutWithUser = Prisma.PayoutGetPayload<{
  include: {
    doctor: {
      select: {
        id: true;
        name: true;
        email: true;
        credits: true;
        speciality: true;
      };
    };
  };
}>;

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

export type appointmentsWithPatients = Prisma.AppointmentGetPayload<{
  include: {
    patient: true;
  };
}>;

export type appointmentsWithDoctors = Prisma.AppointmentGetPayload<{
  include: {
    doctor: true;
  };
}>;

export type AvailableSlotsPerDay = Record<string, TimeSlot[]>;

export type UserWithTransactions = Prisma.UserGetPayload<{
  include: {
    transactions: true;
  };
}>;

export type DocRespType = {
  doctors?: User[];
  error?: string;
};

export type userRoleRespType = {
  success: boolean;
  redirect: string;
};

export type DoctorFormType = {
  speciality: string;
  experience: number;
  credentialURL: string;
  description: string;
};

export type SpecialitiesType = {
  name: string;
  icon: LucideIcon;
};

export type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export type ActionType = "video" | "cancel" | "notes" | "completed";
