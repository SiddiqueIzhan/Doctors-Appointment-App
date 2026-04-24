"use client";

import { updateDoctorStatus } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useFetch } from "@/hooks/use-fetch";
import { User as UserType } from "@/lib/generated/prisma";
import { strict } from "assert";
import { format } from "date-fns";
import {
  Cross,
  File,
  Medal,
  SkipBack,
  User,
  VerifiedIcon,
  View,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";

interface PendingDoctorProps {
  doctors: UserType[];
}

const PendingDoctors = ({ doctors }: PendingDoctorProps) => {
  const [selectedDoctor, setSelectedDoctor] = useState<UserType | null>(null);

  const {
    data,
    loading,
    fn: submitStatusUpdate,
  } = useFetch(updateDoctorStatus);

  const handleClose = () => {
    setSelectedDoctor(null);
  };

  const handleUpdateStatus = async (doctorId: string, status: string) => {
    if (loading) return;

    const formData = new FormData();
    formData.append("doctorId", doctorId);
    formData.append("status", status);

    await submitStatusUpdate(formData);
  };

  useEffect(() => {
    if (data && data.success) {
      handleClose();
      toast.success("Doctor Status is Successfully Updated")
    }
  }, [data]);

  return (
    <Card className="-mt-5">
      <CardHeader>
        <CardTitle className="text-lg">Pending Doctor Verifications</CardTitle>
        <CardDescription className="text-muted-foreground">
          review and approve doctor applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {doctors.length === 0 ? (
          <p className="w-full font-medium text-muted-foreground text-center">
            No Pending Request Currently
          </p>
        ) : (
          doctors.map((doc: UserType) => {
            const {
              id,
              name,
              experience,
              speciality,
              imageUrl,
            } = doc;
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
                    className="py-2 px-4 bg-amber-700/20 border-amber-300/20 text-amber-300 font-bold"
                  >
                    PENDING
                  </Badge>
                  <Button
                    variant="outline"
                    className="rounded-full p-2 cursor-pointer"
                    onClick={() => setSelectedDoctor(doc)}
                  >
                    <View className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
      {selectedDoctor && (
        <Dialog open={!!selectedDoctor} onOpenChange={handleClose}>
          <DialogContent className="max-w-5xl w-full">
            <DialogHeader className="space-x-6">
              <DialogTitle>Doctor Verification Details</DialogTitle>
              <DialogDescription>
                Review the doctor's information carefully before making a
                decision
              </DialogDescription>
              {/* Top Section */}
              <div className="w-full flex items-center gap-4 justify-between flex-wrap">
                <div>
                  <h1 className="text-muted-foreground font-medium text-sm">
                    Name
                  </h1>
                  <p className="font-bold">{selectedDoctor.name}</p>
                </div>

                <div>
                  <h1 className="text-muted-foreground font-medium text-sm">
                    Email
                  </h1>
                  <p className="font-bold">{selectedDoctor.email}</p>
                </div>

                <div>
                  <h1 className="text-muted-foreground font-medium text-sm">
                    Application Date
                  </h1>
                  <p className="font-bold">
                    {format(selectedDoctor.updatedAt, "PPP")}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <Separator className="bg-emerald-400/30" />

            {/* Middle Section */}
            <h3 className="flex items-center gap-2 font-bold">
              <Medal className="w-4 h-4 text-emerald-400" /> Professional
              Information
            </h3>
            <div className="flex items-center gap-10 flex-wrap justify-between">
              <div>
                <h1 className="text-muted-foreground font-medium text-sm">
                  Speciality
                </h1>
                <p className="font-bold">{selectedDoctor.speciality}</p>
              </div>

              <div>
                <h1 className="text-muted-foreground font-medium text-sm">
                  Experience
                </h1>
                <p className="font-bold">{selectedDoctor.experience}</p>
              </div>

              <div>
                <h1 className="text-muted-foreground font-medium text-sm">
                  Credential URL
                </h1>

                {selectedDoctor.credentialURL && (
                  <a
                    href={selectedDoctor.credentialURL}
                    target="_blank"
                    className="text-emerald-500 break-all underline"
                  >
                    View Credential
                  </a>
                )}
              </div>
            </div>

            <Separator className="bg-emerald-400/30" />

            {/* Description */}
            <div>
              <h3 className="flex items-center gap-2 font-bold mb-4">
                <File className="w-4 h-4 text-emerald-400" />
                Service Description
              </h3>

              <p className="text-muted-foreground text-sm">
                {selectedDoctor.description}
              </p>
            </div>

            {loading && <BarLoader width={"100%"} color="#36d7b7" />}

            <DialogFooter className="w-full flex justify-between">
              <Button
                className="w-fit flex items-center gap-2 font-bold bg-red-500 hover:bg-red-400 text-white cursor-pointer"
                disabled={loading}
                onClick={() =>
                  handleUpdateStatus(selectedDoctor.id, "REJECTED")
                }
              >
                <X className="w-4 h-4" />
                Reject
              </Button>
              <Button
                className="w-fit flex items-center gap-2 bg-green-500 hover:bg-green-400 font-bold text-white cursor-pointer"
                disabled={loading}
                onClick={() =>
                  handleUpdateStatus(selectedDoctor.id, "VERIFIED")
                }
              >
                <VerifiedIcon className="w-4 h-4" />
                Accept
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default PendingDoctors;
