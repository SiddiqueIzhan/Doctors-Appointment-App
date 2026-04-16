import {
  getAllAppointments,
  getAvailabilitySlots,
  setAvailabilitySlots,
} from "@/actions/availability";
import { getCurrentUser } from "@/actions/onboarding";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import Appointments from "./_components/Appointment";
import Slots from "./_components/Slots";

const DoctorDashboard = async () => {
  const user = await getCurrentUser();

  const [slots, appointments] = await Promise.all([
    getAvailabilitySlots(),
    getAllAppointments(),
  ]);

  // Redirect if not a doctor
  if (user?.role !== "DOCTOR") {
    redirect("/onboarding");
  }

  // If already verified, redirect to dashboard
  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/doctor/verification");
  }

  return (
    <div>
      <Tabs
        defaultValue="appointments"
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16"
      >
        <TabsList className="md:col-span-1 flex flex-row md:flex-col w-full p-2 rounded-md gap-2 bg-transparent">
          <TabsTrigger value="appointments" className="w-full px-4 py-4 hover:bg-muted/40 cursor-pointer">
            <Calendar className="w-4 h-4" />
            My Appointments
          </TabsTrigger>

          <TabsTrigger value="slots" className="w-full px-4 py-4 hover:bg-muted/40 cursor-pointer">
            <Clock className="w-4 h-4" />
            My Slots
          </TabsTrigger>
        </TabsList>
        <div className="col-span-3">
          <TabsContent value="appointments">
            {/* <PendingDoctors doctors={pendingDoctors.doctors || []} /> */}
            <Appointments />
          </TabsContent>
          <TabsContent value="slots">
            {/* <VerifiedDoctors doctors={verifiedDoctors.doctors || []} /> */}
            <Slots slots={slots.availableSlots} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;
