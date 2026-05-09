import { getDoctorById } from "@/actions/appointment";
import { PageHeader } from "@/components/ui/page-header";
import { DoctorIDType } from "@/utils/types";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }: DoctorIDType) {
  const { id } = await params;
  const { doctor } = await getDoctorById(id);

  return {
    title: `Dr. ${doctor?.name} - MediMeet`,
    description: `Book an appointment with ${doctor?.name} with speciality ${doctor?.speciality} and years of experience ${doctor?.experience}`,
  };
}

const DoctorProfileLayout = async ({ children, params }: DoctorIDType) => {
  const { id } = await params;
  const { doctor } = await getDoctorById(id);

  if (!doctor) redirect("/doctors");

  return (
    <div className="container mx-auto">
      <PageHeader
        title={"Dr. " + doctor?.name}
        backLink={`/doctors/${doctor?.speciality}`}
        backLabel={`Back to ${doctor?.speciality}`}
      />
      {children}
    </div>
  );
};

export default DoctorProfileLayout;
