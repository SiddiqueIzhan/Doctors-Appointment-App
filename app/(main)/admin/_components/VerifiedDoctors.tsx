"use client";
import { suspendDoctor, updateDoctorStatus } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFetch } from "@/hooks/use-fetch";
import { User as UserType } from "@/lib/generated/prisma";
import { Ban, Loader2, Search, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface verifiedDoctorProps {
  doctors: UserType[];
}

const VerifiedDoctors = ({ doctors }: verifiedDoctorProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [targetDoctor, setTargetDoctor] = useState<UserType | null>(null);

  const {
    data,
    loading,
    fn: submitStatusUpdate,
  } = useFetch(suspendDoctor);

  const filteredDoctors = () =>
    doctors.filter((doc) => {
      const query = searchTerm.toLowerCase();
      return (
        doc.name.toLowerCase().includes(query) ||
        doc.speciality?.toLowerCase().includes(query) ||
        doc.email.toLowerCase().includes(query)
      );
    });

  const handleSuspend = async (doctor: UserType) => {
    const confirmed = window.confirm(`Are you sure you want to suspend ${doctor.name} `)
    if (!confirmed || loading) return;

    const formData = new FormData();
    formData.append("doctorId", doctor.id);
    formData.append("suspend", "true");

    setTargetDoctor(doctor)
    await submitStatusUpdate(formData);
  };

  useEffect(() => {
    if(data && data?.success && targetDoctor){
      toast.success(`${targetDoctor.name} suspended successfully`);
      setTargetDoctor(null);
    }
  }, [data])

  useEffect(() => {
    filteredDoctors();
  }, [searchTerm]);

  return (
    <Card className="bg-muted/50 border-emerald-600/20 -mt-5">
      <CardHeader className="w-full flex justify-between">
        <div>
          <CardTitle className="text-lg">Manage Doctors</CardTitle>
          <CardDescription className="text-muted-foreground">
            View and Manage All Verified Doctors
          </CardDescription>
        </div>
        <div className="w-100 p-4 flex items-center gap-2 relative ">
          <Search className="w-4 h-4 absolute left-7" />
          <Input
            type="text"
            placeholder="Search Doctors..."
            className="bg-transparent border-0 pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-x-2">
        {filteredDoctors().length === 0 ? (
          <p className="w-full font-medium text-muted-foreground text-center">
            No Verified Doctors Found
          </p>
        ) : (
          filteredDoctors().map((doc: UserType) => {
            const { id, name, experience, speciality, imageUrl } = doc;
            return (
              <div
                className="w-full rounded-md bg-black border border-emerald-700/20 flex justify-between items-center p-4"
                key={id}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full relative overflow-hidden bg-emerald-950/30">
                    {imageUrl ? (
                      <Image src={imageUrl} alt="profile-pic" fill />
                    ) : (
                      <User className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>

                  <div className="space-x-2">
                    <h1 className="text-lg font-bold">{name}</h1>
                    <p className="text-sm text-muted-foreground">
                      {speciality} | {experience} years of experience
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="py-2 px-4 bg-emerald-700/20 border-emerald-300/20 text-emerald-300 font-bold"
                  >
                    ACTIVE
                  </Badge>
                  <Button
                    variant="outline"
                    className="p-4 bg-red-500/20 text-red-400 border-red-400 rounded-sm"
                    onClick={() => handleSuspend(doc)}
                  >
                    {loading && targetDoctor?.id === doc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Ban className="w-4 h-4" />
                    )}
                    Suspend
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default VerifiedDoctors;
