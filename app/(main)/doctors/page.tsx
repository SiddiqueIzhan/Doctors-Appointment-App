"use client"
import { Card, CardContent } from "@/components/ui/card";
import { SPECIALTIES } from "@/lib/speciality";
import { redirect } from "next/navigation";

const DoctorListingPage = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="w-full text-center">
        <h1 className="gradient-title text-3xl font-bold mb-2">
          Find Your Doctor
        </h1>
        <p className="text-muted-foreground text-xl">
          Browse by speciality or view all available healthcare providers
        </p>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
          {SPECIALTIES.map(({ name, icon }) => {
            const Icon = icon;
            return (
              <Card className="w-full h-50 bg-muted/50 transition-all border-emerald-700/30 cursor-pointer hover:border-emerald-600/70 flex items-center justify-center" key={name} onClick={() => redirect(`/doctors/${name}`)} >
                <CardContent className="flex flex-col items-center gap-4">
                  <Icon className="w-16 h-16 text-emerald-500" />
                  <p className="text-xl font-bold">{name}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DoctorListingPage;
