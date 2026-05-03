import { format } from "date-fns";

// Format date and time
export const formatDateTime = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");
  } catch (e) {
    return "Invalid date";
  }
};

// Format time only
export const formatTime = (dateString: string) => {
  try {
    return format(new Date(dateString), "h:mm a");
  } catch (e) {
    return "Invalid time";
  }
};
