import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const metadata = {
    title: "Onboarding - Medimeet",
    description: "Complete your profile to get started with MediMeet"
}

const OnboardingLayout = async ({ children }: LayoutProps) => {
  const user = await getCurrentUser();

  if (user) { // onboarding page is only required for "UNASSIGNED" users
    if (user?.role === "PATIENT") redirect("/doctors");
    else if (user?.role === "DOCTOR") {
      if (user?.verificationStatus === "VERIFIED") redirect("/doctor");
      else redirect("/doctor/verification");
    } else if (user?.role === "ADMIN") redirect("/admin");
  }
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="gradient-title md:text-4xl text-3xl mb-2">
          Welcome to Medimeet
        </h1>
        <p className="text-lg text-muted-foreground">
          Tell me how you want to use this platform
        </p>
      </div>
      {children}
    </div>
  );
};

export default OnboardingLayout;
