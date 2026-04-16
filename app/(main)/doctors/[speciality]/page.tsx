import { getDoctorsBySpeciality } from "@/actions/doctor-listing";
import { DoctorCard } from "@/components/DoctorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Calendar, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface SpecialityPagePropType {
  params: Promise<{
    speciality: string;
  }>;
}

const SpecialityPage = async ({ params }: SpecialityPagePropType) => {
  const { speciality } = await params;
  const specialityModified = speciality.replaceAll("%20", " ");
  const { doctors, error } = await getDoctorsBySpeciality(specialityModified);

  if (error) {
    console.log(error);
  }

  return (
    <div>
      <PageHeader
        title={specialityModified}
        backLabel="All specialities"
        backLink="/doctors"
      />
      <div className="w-full">
        {doctors?.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-white mb-2">
              No doctors available
            </h3>
            <p className="text-muted-foreground">
              There are currently no verified doctors in this specialty. Please
              check back later or choose another specialty.
            </p>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctors?.map((doctor) => {
              return <DoctorCard key={doctor.id} doctor={doctor} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialityPage;
