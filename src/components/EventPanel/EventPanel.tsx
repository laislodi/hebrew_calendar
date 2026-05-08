import { useState } from 'react'
import { HDate } from '@hebcal/core'
import type { CalendarEvent } from '../../types/event'
import { getMonthName } from '../../utils/hebrewCalendar'
import EventForm from '../EventForm/EventForm'
import './EventPanel.css'

interface Props {
  selectedDay: Date
  events: CalendarEvent[]
  onAddEvent: (e: Omit<CalendarEvent, 'id'>) => void
  onUpdateEvent: (id: string, updates: Partial<Omit<CalendarEvent, 'id'>>) => void
  onDeleteEvent: (id: string) => void
  className?: string
  onClose?: () => void
}

const WEEK_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const GREG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function formatGregDay(date: Date): string {
  return `${WEEK_DAY_NAMES[date.getDay()]}, ${GREG_MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function formatTime(iso: string): string {
  const time = iso.split('T')[1] ?? '00:00'
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function EventPanel({ selectedDay, events, onAddEvent, onUpdateEvent, onDeleteEvent, className, onClose }: Props) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)

  const hdate = new HDate(selectedDay)
  const hebrewDate = `${getMonthName(hdate.getMonth(), hdate.getFullYear())} ${hdate.getDate()}, ${hdate.getFullYear()}`

  function openAdd() {
    setEditingEvent(null)
    setFormOpen(true)
  }

  function openEdit(event: CalendarEvent) {
    setEditingEvent(event)
    setFormOpen(true)
  }

  function handleSave(data: Omit<CalendarEvent, 'id'>) {
    if (editingEvent) {
      onUpdateEvent(editingEvent.id, data)
    } else {
      onAddEvent(data)
    }
  }

  return (
    <div className={`event-panel${className ? ` ${className}` : ''}`}>
      <div className="event-panel-header">
        <div>
          <div className="event-panel-hdate">{hebrewDate}</div>
          <div className="event-panel-greg">{formatGregDay(selectedDay)}</div>
        </div>
        {onClose && (
          <button className="event-panel-close" onClick={onClose}>✕</button>
        )}
      </div>

      <div className="event-panel-list">
        {events.length === 0 ? (
          <p className="event-panel-empty">No events for this day</p>
        ) : (
          events.map(event => (
            <div key={event.id} className="event-item" onClick={() => openEdit(event)}>
              <div className="event-item-time">
                {formatTime(event.startTime)} – {formatTime(event.endTime)}
              </div>
              <div className="event-item-title">{event.title}</div>
              {event.description && (
                <div className="event-item-desc">{event.description}</div>
              )}
            </div>
          ))
        )}
      </div>

      <button className="event-panel-add" onClick={openAdd}>+ Add Event</button>

      {formOpen && (
        <EventForm
          initialDate={selectedDay}
          event={editingEvent ?? undefined}
          onSave={handleSave}
          onDelete={editingEvent ? () => onDeleteEvent(editingEvent.id) : undefined}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  )
}
