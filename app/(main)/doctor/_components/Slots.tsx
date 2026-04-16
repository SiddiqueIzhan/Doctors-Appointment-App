"use client";

import { setAvailabilitySlots } from "@/actions/availability";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFetch } from "@/hooks/use-fetch";
import { Availability } from "@/lib/generated/prisma";
import { format } from "date-fns";
import { AlertCircle, Calendar, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type timeDataType = {
  startTime: string;
  endTime: string;
};

interface SlotsPropsType {
  slots: Availability[];
}

const Slots = ({ slots }: SlotsPropsType) => {
  const [showForm, setShowFrom] = useState<Boolean>(false);
  const { data, loading, fn: submitTimeSlot } = useFetch(setAvailabilitySlots);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      startTime: "",
      endTime: "",
    },
  });

  function createLocalDateFromTime(timeStr: string) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const now = new Date();
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
    );
    return date;
  }

  const onSubmitAvailability = async (data: timeDataType) => {
    if (loading) return;

    const startTime = createLocalDateFromTime(data.startTime);
    const endTime = createLocalDateFromTime(data.endTime);

    if (startTime >= endTime) {
      toast.error("Start Time must be less than endTime");
      return;
    }
    const formData = new FormData();

    formData.append("startTime", startTime.toISOString());
    formData.append("endTime", endTime.toISOString());

    await submitTimeSlot(formData);
  };

  const formatTimeString = (time: Date) => {
    try {
      return format(new Date(time), "hh:mm a");
    } catch (e) {
      return "Invalid Time";
    }
  };

  useEffect(() => {
    if (data && data.success) {
      setShowFrom(false);
      toast.success("Time Slot Added Successfully");
    }
  }, [data]);

  return (
    <>
      <Card className="bg-muted/50 border-emerald-600/20 -mt-5">
        <CardHeader className="w-full">
          <CardTitle className="text-xl flex gap-2 items-center">
            <Clock className="w-5 h-5 text-emerald-400" />
            My Availabilty Slots
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Set your daily availibility slots for your patient appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showForm ? (
            <div className="w-full border border-muted rounded-lg p-4 bg-background">
              <h1 className="text-xl mb-4">Set Daily Availabilty</h1>
              <form
                className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"
                onSubmit={handleSubmit(onSubmitAvailability)}
              >
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    type="time"
                    id="startTime"
                    {...register("startTime", {
                      required: "Start Time is required",
                    })}
                    className="bg-background border-emerald-900/20"
                  />
                  {errors.startTime && (
                    <p className="text-sm font-medium text-red-500">
                      {errors.startTime.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    type="time"
                    id="endTime"
                    {...register("endTime", {
                      required: "End Time is required",
                    })}
                    className="bg-background border-emerald-900/20"
                  />
                  {errors.endTime && (
                    <p className="text-sm font-medium text-red-500">
                      {errors.endTime.message}
                    </p>
                  )}
                </div>
                <div className="flex gap-4 justify-end md:col-span-2">
                  <Button
                    className="border border-emerald-400/30 bg-muted/50 hover:bg-muted/40 text-white cursor-pointer"
                    disabled={loading}
                    onClick={() => setShowFrom(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-500 cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Availability"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {slots.length === 0 ? (
                <p className="w-full font-medium text-muted-foreground text-center">
                  No Slots Added. Add your availability to start accepting
                  appointments.
                </p>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot) => {
                    return (
                      <div
                        key={slot.id}
                        className="flex items-center p-3 rounded-md border border-emerald-900/20 gap-4 bg-background"
                      >
                        <div className="bg-emerald-950/30 rounded-full p-2">
                          <Clock className="w-4 h-4 text-emerald-400" />
                        </div>

                        <div className="font-bold">
                          {formatTimeString(slot.startTime)} -{" "}
                          {formatTimeString(slot.endTime)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Button
                className="w-full bg-emerald-400 mt-6 cursor-pointer"
                onClick={() => setShowFrom(true)}
              >
                <Calendar className="w-4 h-4" />
                Add Availabilty Slot
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      <div className="mt-6 p-4 bg-muted/50 border border-emerald-900/10 rounded-md">
        <h4 className="font-medium text-white mb-2 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-emerald-400" />
          How Availability Works
        </h4>
        <p className="text-muted-foreground text-sm">
          Setting your daily availability allows patients to book appointments
          during those hours. The same availability applies to all days. You can
          update your availability at any time, but existing booked appointments
          will not be affected.
        </p>
      </div>
    </>
  );
};

export default Slots;
