import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export function DatePickerWithRange() {
  return (
    <Button variant="outline" className="w-full justify-start text-left font-normal">
      <Calendar className="mr-2 h-4 w-4" />
      <span>Pick a date range</span>
    </Button>
  );
}