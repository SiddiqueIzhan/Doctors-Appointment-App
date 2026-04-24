import { resultType, TimeSlot } from "@/actions/appointment";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ChevronRight, Clock } from "lucide-react";
import React, { useState } from "react";

interface SlotBookingSectionPropsType {
  onSelectSlot: (slot: TimeSlot) => void;
  availableDays: resultType[];
}

const SlotPicker = ({
  onSelectSlot,
  availableDays,
}: SlotBookingSectionPropsType) => {
  // Find first day with slots as default tab
  const firstDayWithSlots =
    availableDays.find((day) => day.slots.length > 0)?.date ||
    availableDays[0]?.date;
  const [activeTab, setActiveTab] = useState(firstDayWithSlots);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const confirmSelection = () => {
    if (selectedSlot) {
      onSelectSlot(selectedSlot);
    }
  };

  return (
    <div>
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          {availableDays.map((day) => {
            return (
              <TabsTrigger
                value={day.date}
                key={day.date}
                disabled={day.slots.length === 0}
                className={
                  day.slots.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                }
              >
                <span>{format(new Date(day.date), "MMM d")}</span>(
                <span>{format(new Date(day.date), "EEE")}</span>)
                <span className="bg-emerald-900 text-emerald-400 px-2 py-1 rounded-sm">
                  {day.slots.length}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {availableDays.map((day) => {
          return (
            <TabsContent key={day.date} value={day.date}>
              <h3 className="text-lg font-bold text-white my-3 ">
                {day.displayDate}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {day.slots.map((slot, index) => {
                  return (
                    <div
                      className={`flex items-center gap-2 p-4 border rounded-lg justify-center font-bold ${selectedSlot?.startTime === slot.startTime && "bg-emerald-900/20 text-emerald-400 border-emerald-400"}`}
                      key={index}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(slot.startTime), "h:mm a")}</span>
                    </div>
                  );
                })}
              </div>
              <div className="w-full flex justify-end mt-6">
                <Button
                  className={
                    selectedSlot?.startTime.length === 0
                      ? "bg-emerald-600"
                      : "bg-emerald-400"
                  }
                  disabled={!selectedSlot}
                  onClick={confirmSelection}
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default SlotPicker;
