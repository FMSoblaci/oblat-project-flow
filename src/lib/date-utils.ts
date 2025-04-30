
import { format, formatRelative, formatDistance } from 'date-fns';
import { pl } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

// Helper for formatting dates with Polish locale
export const formatDatePl = (date: Date, formatStr: string = 'PPP') => {
  return format(date, formatStr, { locale: pl });
};

// Helper for formatting dates in specific timezone
export const formatDateInTimezone = (date: Date, timeZone: string, formatStr: string = 'PPP') => {
  return formatInTimeZone(date, timeZone, formatStr);
};

// Helper for relative dates with Polish locale
export const formatRelativeDatePl = (date: Date, baseDate: Date = new Date()) => {
  return formatRelative(date, baseDate, { locale: pl });
};

// Helper for distance between dates with Polish locale
export const formatDistancePl = (date: Date, baseDate: Date = new Date()) => {
  return formatDistance(date, baseDate, { locale: pl, addSuffix: true });
};
