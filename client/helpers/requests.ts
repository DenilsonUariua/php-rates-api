import { APIData } from "@/types/APIData";
import { BookingData } from "@/types/BookingData";
import { format } from 'date-fns';

export function convertToAPIRequest(data: BookingData): APIData {
  return {
    'Unit Name': data.room, // Matches backend's 'Unit Name'
    Arrival: format(new Date(data.arrival), 'dd/MM/yyyy'), // Convert Y-m-d to d/m/Y
    Departure: format(new Date(data.departure), 'dd/MM/yyyy'), // Convert Y-m-d to d/m/Y
    Occupants: data.occupants,
    Ages: data.ages,
  };
}

 export const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };