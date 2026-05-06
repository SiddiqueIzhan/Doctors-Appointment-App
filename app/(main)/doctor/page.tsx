import {
  getAvailabilitySlots,
  setAvailabilitySlots,
} from "@/actions/availability";
import { getCurrentUser } from "@/actions/onboarding";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, DollarSign } from "lucide-react";
import { redirect } from "next/navigation";
import Appointments from "./_components/Appointment";
import Slots from "./_components/Slots";
import { getDoctorAppointments } from "@/actions/appointment";
import DoctorAppointmentsList from "./_components/Appointment";
import { getDoctorEarnings, getDoctorPayouts } from "@/actions/payout";
import Earnings from "./_components/Earnings";

const DoctorDashboard = async () => {
  const user = await getCurrentUser();

  const [slots, appointments, earningsData, payoutData] = await Promise.all([
    getAvailabilitySlots(),
    getDoctorAppointments(),
    getDoctorEarnings(),
    getDoctorPayouts(),
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
        defaultValue="earnings"
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8"
      >
        <TabsList className="md:col-span-1 flex flex-row md:flex-col w-full p-2 rounded-md gap-2 bg-transparent justify-start">
          <TabsTrigger
            value="earnings"
            className="w-full px-4 py-4 hover:bg-muted/40 cursor-pointer"
          >
            <DollarSign className="w-4 h-4" />
            My Earnings
          </TabsTrigger>

          <TabsTrigger
            value="appointments"
            className="w-full px-4 py-4 hover:bg-muted/40 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            My Appointments
          </TabsTrigger>

          <TabsTrigger
            value="slots"
            className="w-full px-4 py-4 hover:bg-muted/40 cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            My Slots
          </TabsTrigger>
        </TabsList>
        <div className="col-span-3">
          <TabsContent value="earnings" className="mt-20">
            <Earnings
              earningsData={earningsData?.earnings || null}
              payouts={payoutData || []}
            />
          </TabsContent>
          <TabsContent value="appointments">
            <DoctorAppointmentsList
              appointments={appointments?.appointments || []}
            />
          </TabsContent>
          <TabsContent value="slots">
            <Slots slots={slots.availableSlots} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;
