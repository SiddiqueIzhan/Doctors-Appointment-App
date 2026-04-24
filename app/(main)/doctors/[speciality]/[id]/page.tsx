import { getAvailableTimeSlots, getDoctorById } from "@/actions/appointment";
import { DoctorIDType } from "./layout";
import { redirect } from "next/navigation";
import DoctorProfile from "./_components/DoctorProfile";
import { User } from "@/lib/generated/prisma";

const DoctorProfilePage = async ({ params }: DoctorIDType) => {
  const { id } = await params;

  const [{ doctor }, { days }] = await Promise.all([
    getDoctorById(id),
    getAvailableTimeSlots(id),
  ]);

  // console.log("hello", doctor);
  console.log("hello1", days);

  try {
    return <DoctorProfile doctor={doctor as User} availableDays={days} />;
  } catch (error) {
    console.log(error);
    redirect("/doctors");
  }
};

export default DoctorProfilePage;
