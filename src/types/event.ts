export interface CalendarEvent {
  id: string
  title: string
  description: string
  useHebrewDate: boolean
  startTime: string // "YYYY-MM-DDTHH:MM" local time
  endTime: string   // "YYYY-MM-DDTHH:MM" local time
}
