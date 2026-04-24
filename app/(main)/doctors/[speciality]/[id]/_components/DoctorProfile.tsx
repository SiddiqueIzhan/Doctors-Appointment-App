"use client";

import {
  AvailableSlotsPerDay,
  resultType,
  TimeSlot,
} from "@/actions/appointment";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User as UserType } from "@/lib/generated/prisma";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Medal,
  User,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import AppointmentForm from "./AppointmentForm";
import SlotPicker from "./SlotPicker";
import { useRouter } from "next/navigation";

interface DoctorProfilePropType {
  doctor: UserType;
  availableDays: resultType[];
}

const DoctorProfile = ({ doctor, availableDays }: DoctorProfilePropType) => {
  const [showSlots, setShowSlots] = useState<Boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const totalSlots = availableDays.reduce(
    (total, days) => total + days.slots.length,
    0,
  );
  const router = useRouter();

  const handleShowSlot = () => {
    setShowSlots(!showSlots);
    if (!showSlots) {
      setTimeout(() => {
        document.getElementById("booking-card")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleBookingComplete = () => {
    router.push("/appointments");
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card className="w-full p-6 border-emerald-400/30 md:sticky md:top-24">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-emerald-900/20 flex items-center justify-center relative">
              {doctor.imageUrl ? (
                <Image
                  src={doctor.imageUrl}
                  alt="doc-img"
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="w-16 h-16" />
              )}
            </div>
            <h1 className="text-xl font-bold whitespace-nowrap">
              {doctor.name}
            </h1>
            <Badge
              variant="outline"
              className="bg-emerald-900/20 border-emerald-700 text-emerald-400"
            >
              {doctor.speciality}
            </Badge>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Medal className="w-4 h-4 text-emerald-400" />
              {doctor.experience} years of experience
            </div>

            <Button
              className="w-full bg-emerald-500 flex items-center"
              onClick={handleShowSlot}
            >
              {showSlots ? (
                <>
                  Hide Booking
                  <ChevronUp className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Book Appointment
                  <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2 space-y-6">
        <Card className="w-full border-emerald-400/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              About {doctor.name}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Professional background and expertise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2 items-center">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h1 className="text-lg font-medium">Description</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                {doctor.description}
              </p>
            </div>
            <Separator className="my-6" />
            <div className="space-y-4">
              <div className="flex gap-2 items-center">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h1 className="text-lg font-medium">Availability</h1>
              </div>
              {totalSlots ? (
                <p className="text-muted-foreground text-sm flex items-center gap-4">
                  <Calendar className="w-5 h-5" />
                  {totalSlots} time slots available for booking over the next 4
                  days
                </p>
              ) : (
                <Alert className="bg-emerald-900/20 border-emerald-500/70">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-emerald-400">
                    No available slots for the next 4 days. Please check back
                    later.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {showSlots && (
          <>
            <Card id="booking-card">
              <CardHeader>
                <CardTitle>Book an Appointment</CardTitle>
                <CardDescription>
                  Select a time slot and provide details for your consultation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedSlot ? (
                  <SlotPicker
                    availableDays={availableDays}
                    onSelectSlot={handleSelectSlot}
                  />
                ) : (
                  <AppointmentForm
                    doctorId={doctor.id}
                    slot={selectedSlot}
                    onBack={() => setSelectedSlot(null)}
                    onComplete={handleBookingComplete}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
