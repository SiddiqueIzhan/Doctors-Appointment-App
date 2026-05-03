import {
  appointmentsWithDoctors,
  appointmentsWithPatients,
} from "@/actions/appointment";
import AppointmentCard from "@/components/AppointmentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Appointment } from "@/lib/generated/prisma";
import { Calendar } from "lucide-react";
import React from "react";

interface DoctorAppointmentsPropType {
  appointments: appointmentsWithPatients[];
}

const DoctorAppointmentsList = ({
  appointments,
}: DoctorAppointmentsPropType) => {
  return (
    <div className="-mt-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h1 className="font-bold text-lg">Upcoming Appointments</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment as appointmentsWithPatients}
              userRole="DOCTOR"
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorAppointmentsList;
