import { User } from "@/lib/generated/prisma";
import { db } from "@/lib/prisma";

type DocRespType = {
  doctors?: User[];
  error?: string;
};

export async function getDoctorsBySpeciality(
  speciality: string,
): Promise<DocRespType> {

  try {
    const doctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
        speciality: speciality,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { doctors };
  } catch (error) {
    console.error(error);

    return {error: "failed to fetch doctors"}
  }
}
