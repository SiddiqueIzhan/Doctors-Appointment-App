import AppointmentCard from "@/components/AppointmentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoctorAppointmentsProps } from "@/utils/types";
import { Calendar } from "lucide-react";

const DoctorAppointmentsList = ({
  appointments,
}: DoctorAppointmentsProps) => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h1 className="font-bold text-lg">Upcoming Appointments</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="DOCTOR"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-xl font-medium text-white mb-2">
                No upcoming appointments
              </h3>
              <p className="text-muted-foreground">
                You don&apos;t have any scheduled appointments yet. Make sure
                you&apos;ve set your availability to allow patients to book.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorAppointmentsList;
