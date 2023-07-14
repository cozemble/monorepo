import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

dayjs.extend(utc)
dayjs.extend(timezone)

function dayThisMonth(day: number) {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), day)
}

function toIso8601DateOnlyString(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = `${d.getMonth() + 1}`.padStart(2, '0')
  const dd = `${d.getDate()}`.padStart(2, '0')
  return [yyyy, mm, dd].join('-')
}

function toIso8601DateTimeString(d: Date): string {
  return dayjs(d).utc().toISOString()
}

function isIso8601String(s: string): boolean {
  return dayjs(s, 'YYYY-MM-DD', true).isValid()
}

function fromIso8601String(s: string): Date {
  if (s === null || s === undefined || s.trim() === '') {
    throw new Error(`Attempting to make a date from an ISO string, but the string is empty`)
  }
  return dayjs(s).toDate()
}

function startOfDay(d: Date): Date {
  return dayjs(d).startOf('day').toDate()
}

function looksLikeADateObject(value: any): boolean {
  return (
    value !== undefined &&
    value !== null &&
    value.getTime !== undefined &&
    value.getFullYear !== undefined
  )
}

function format(date: Date, format: string): string {
  return dayjs(date).format(format)
}

function formatInTimezone(date: Date, format: string, timezone: string): string {
  return dayjs.tz(date, timezone).format(format)
}

function addDays(date: Date, days: number): Date {
  return dayjs(date).add(days, 'day').toDate()
}

export const dates = {
  dayThisMonth,
  toIso8601DateOnlyString,
  toIso8601DateTimeString,
  fromIso8601String,
  startOfDay,
  looksLikeADateObject,
  format,
  isIso8601String,
  formatInTimezone,
  addDays,
}
