import { getCurrentUser } from '@/actions/onboarding';
import { redirect } from 'next/navigation';

const DoctorDashboard = async() => {
    const user = await getCurrentUser();

  //   // Redirect if not a doctor
  if (user?.role !== "DOCTOR") {
    redirect("/onboarding");
  }

  // If already verified, redirect to dashboard
  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/doctor/verification");
  }
  return (
    <div>DoctorPage</div>
  )
}

export default DoctorDashboard;