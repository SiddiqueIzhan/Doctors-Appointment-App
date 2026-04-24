import { bookAppointment, TimeSlot } from "@/actions/appointment";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFetch } from "@/hooks/use-fetch";
import { ArrowLeft, Calendar, Clock, CreditCard, Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface AppointmentFormPropsType {
  doctorId: string;
  slot: TimeSlot;
  onBack: () => void;
  onComplete: () => void;
}

const AppointmentForm = ({
  doctorId,
  slot,
  onBack,
  onComplete,
}: AppointmentFormPropsType) => {
  const [description, setDescription] = useState("");

  const { data, loading, fn: submitBooking } = useFetch(bookAppointment);

  const handleSubmit = async () => {
    if (loading) return;

    const formdata = new FormData();
    formdata.append("doctorId", doctorId);
    formdata.append("startTime", slot.startTime);
    formdata.append("endTime", slot.endTime);
    formdata.append("description", description);

    await submitBooking(formdata);
  };

  useEffect(() => {
    if (data && data.success) {
      toast.success("Appointment Booked Successfully");
      redirect("/appointments")
    }
  }, [data]);

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="p-4 bg-muted/70 border border-emerald-900/20 rounded-md space-y-3">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="font-bold">{slot.day}</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span className="font-bold">{slot.formatted}</span>
        </div>
        <div className="flex items-center gap-3">
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span className="text-white font-bold">2 credits</span>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">
          Describe your medical concern (optional)
        </Label>
        <Textarea
          id="description"
          placeholder="Please provide any details about your medical concern or what you'd like to discuss in the appointment..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-background border-emerald-900/20 h-32"
        />
        <p className="text-sm text-muted-foreground">
          This information will be shared with the doctor before your
          appointment.
        </p>
      </div>
      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="border-emerald-900/30"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Change Time Slot
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            "Confirm Booking"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AppointmentForm;
