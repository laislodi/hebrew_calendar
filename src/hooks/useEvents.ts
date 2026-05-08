import { useState } from 'react'
import type { CalendarEvent } from '../types/event'

const STORAGE_KEY = 'hebrew-calendar-events'

function localDatePrefix(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function load(): CalendarEvent[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>(load)

  function save(updated: CalendarEvent[]) {
    setEvents(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  function addEvent(event: Omit<CalendarEvent, 'id'>) {
    save([...events, { ...event, id: crypto.randomUUID() }])
  }

  function updateEvent(id: string, updates: Partial<Omit<CalendarEvent, 'id'>>) {
    save(events.map(e => e.id === id ? { ...e, ...updates } : e))
  }

  function deleteEvent(id: string) {
    save(events.filter(e => e.id !== id))
  }

  function getEventsForDay(date: Date): CalendarEvent[] {
    const prefix = localDatePrefix(date)
    return events
      .filter(e => e.startTime.startsWith(prefix))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  return { events, addEvent, updateEvent, deleteEvent, getEventsForDay }
}
