import { LayoutRoutes } from "@/.next/dev/types/routes";
import { verifyAdmin } from "@/actions/admin";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ShieldCheck, User, Users } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

export const metadata = {
  title: "Admin Settings - MediMeet",
  description: "Manage doctors, patients, and platform settings",
};

const AdminLayout = async ({ children }: LayoutProps<LayoutRoutes>) => {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    redirect("/onboarding");
  }

  return (
    <div className="container mx-auto px-4">
      <PageHeader icon={ShieldCheck} title="Admin Dashboard" />

      <Tabs
        defaultValue="pending"
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8"
      >
        <TabsList className="md:col-span-1 flex flex-row md:flex-col w-full p-2 rounded-md gap-2 bg-transparent justify-start -mt-2.5">
          <TabsTrigger
            value="pending"
            className="w-full px-4 py-4 hover:bg-muted/40 cursor-pointer"
          >
            <AlertCircle className="w-4 h-4" />
            Pending Verifications
          </TabsTrigger>

          <TabsTrigger
            value="doctors"
            className="w-full px-4 py-4 hover:bg-muted/40 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            Doctors
          </TabsTrigger>

          <TabsTrigger
            value="payouts"
            className="w-full px-4 py-4 hover:bg-muted/40 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            Pending Payouts
          </TabsTrigger>
        </TabsList>

        {children}
      </Tabs>
    </div>
  );
};

export default AdminLayout;
