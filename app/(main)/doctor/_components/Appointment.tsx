import { Appointment } from "@/lib/generated/prisma";
import React from "react";

interface DoctorAppointmentsPropType {
  appointments: Appointment;
}

const DoctorAppointmentsList = ({
  appointments,
}: DoctorAppointmentsPropType) => {
  return <div>Appointments</div>;
};

export default DoctorAppointmentsList;
