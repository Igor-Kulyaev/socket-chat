import {format} from "date-fns";

export const formatFullDateTime = (date) => {
  return format(new Date(date), 'MMM-dd-yyyy HH:mm');
};
