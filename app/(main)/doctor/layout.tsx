import { PageHeader } from "@/components/ui/page-header";
import { Stethoscope } from "lucide-react";

export const metadata = {
  title: "Doctor Dashboard - MediMeet",
  description: "Manage your appointments and availability",
};

interface DoctorDashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DoctorDashboardLayout({
  children,
}: DoctorDashboardLayoutProps) {
  return (
    <div className="container mx-auto px-4">
      <PageHeader icon={Stethoscope} title="Doctor Dashboard" />

      {children}
    </div>
  );
}
