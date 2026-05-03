"use client";

import {
  appointmentsWithDoctors,
  appointmentsWithPatients,
  markAsCompleted,
} from "@/actions/appointment";
import {
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Stethoscope,
  User,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useFetch } from "@/hooks/use-fetch";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDateTime, formatTime } from "@/utils/helper";
import AppointmentDetailsDialog from "./DoctorDialogBox";

export interface AppointmentCardPropsType {
  appointment: appointmentsWithPatients | appointmentsWithDoctors;
  userRole: "DOCTOR" | "PATIENT";
}

const AppointmentCard = ({
  appointment,
  userRole,
}: AppointmentCardPropsType) => {
  const [open, setOpen] = useState<boolean>(false);

  const {
    loading: completeLoading,
    fn: submitMarkCompleted,
    data: completeData,
  } = useFetch(markAsCompleted);
  // Determine other party information based on user role
  const otherParty =
    userRole === "DOCTOR"
      ? (appointment as appointmentsWithPatients).patient
      : (appointment as appointmentsWithDoctors).doctor;

  const otherPartyLabel = userRole === "DOCTOR" ? "Patient" : "Doctor";
  const otherPartyIcon = userRole === "DOCTOR" ? <User /> : <Stethoscope />;

  const canMarkCompleted = () => {
    if (userRole !== "DOCTOR" || appointment.status !== "SCHEDULED") {
      return false;
    }
    const now = new Date();
    const appointmentEndTime = new Date(appointment.endTime);
    return now >= appointmentEndTime;
  };

  // Handle mark as completed
  const handleMarkCompleted = async () => {
    if (completeLoading) return;

    // Check if appointment end time has passed
    const now = new Date();
    const appointmentEndTime = new Date(appointment.endTime);

    if (now < appointmentEndTime) {
      alert(
        "Cannot mark appointment as completed before the scheduled end time.",
      );
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to mark this appointment as completed? This action cannot be undone.",
      )
    ) {
      const formData = new FormData();
      formData.append("appointmentId", appointment.id);
      await submitMarkCompleted(formData);
    }
  };

  useEffect(() => {
    if (completeData?.success) {
      toast.success("Appointment marked as completed");
      setOpen(false);
    }
  }, [completeData]);

  return (
    <>
      <Card className="bg-black border-emerald-900/20 hover:border-emerald-700/30 transition-all">
        <CardContent className="px-4 py-0">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-muted/20 rounded-full p-2 mt-1">
                {otherPartyIcon}
              </div>
              <div>
                <h3 className="font-medium text-white">
                  {userRole === "DOCTOR"
                    ? otherParty.name
                    : `Dr. ${otherParty.name}`}
                </h3>
                {userRole === "DOCTOR" && (
                  <p className="text-sm text-muted-foreground">
                    {otherParty.email}
                  </p>
                )}
                {userRole === "PATIENT" && (
                  <p className="text-sm text-muted-foreground">
                    {otherParty.speciality}
                  </p>
                )}
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {formatDateTime(appointment.startTime.toString())}
                  </span>
                </div>
                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {formatTime(appointment.startTime.toString())} -{" "}
                    {formatTime(appointment.endTime.toString())}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 self-end md:self-start">
              <Badge
                variant="outline"
                className={
                  appointment.status === "COMPLETED"
                    ? "bg-emerald-900/20 border-emerald-900/30 text-emerald-400"
                    : appointment.status === "CANCELLED"
                      ? "bg-red-900/20 border-red-900/30 text-red-400"
                      : "bg-amber-900/20 border-amber-900/30 text-amber-400"
                }
              >
                {appointment.status}
              </Badge>
              <div className="flex gap-2 mt-2 flex-wrap">
                {canMarkCompleted() && (
                  <Button
                    size="sm"
                    onClick={handleMarkCompleted}
                    disabled={completeLoading}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {completeLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </>
                    )}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-900/30"
                  onClick={() => setOpen(true)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Appointment Details Dialog */}
      <AppointmentDetailsDialog
        appointment={appointment}
        userRole={userRole}
        open={open}
        setOpen={setOpen}
      />
    </>
  );
};

export default AppointmentCard;
