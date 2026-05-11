import { useState, useEffect } from 'react'
import { HDate, HebrewCalendar, flags } from '@hebcal/core'
import type { CalendarEvent } from '../../types/event'
import { getMonthName } from '../../utils/hebrewCalendar'
import EventForm from '../EventForm/EventForm'
import './EventPanel.css'

const MAJOR_MASK = flags.CHAG | flags.MAJOR_FAST

type HolidayInfo = {
  name: string
  level: 'major' | 'minor'
  emoji: string | null
  categories: string[]
  memo?: string
  url?: string
}

function getHolidaysForDay(date: Date): HolidayInfo[] {
  const hdate = new HDate(date)
  const events = HebrewCalendar.getHolidaysOnDate(hdate, false) ?? []
  return events.map(e => ({
    name: e.getDesc(),
    level: (e.getFlags() & MAJOR_MASK) !== 0 ? 'major' : 'minor',
    emoji: e.getEmoji(),
    categories: e.getCategories(),
    memo: e.memo,
    url: e.url(),
  }))
}

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
  const [expandedHoliday, setExpandedHoliday] = useState<number | null>(null)

  useEffect(() => { setExpandedHoliday(null) }, [selectedDay])

  const hdate = new HDate(selectedDay)
  const hebrewDate = `${getMonthName(hdate.getMonth(), hdate.getFullYear())} ${hdate.getDate()}, ${hdate.getFullYear()}`
  const holidays = getHolidaysForDay(selectedDay)

  function toggleHoliday(i: number) {
    setExpandedHoliday(prev => prev === i ? null : i)
  }

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

      {holidays.length > 0 && (
        <div className="holiday-list">
          {holidays.map((holiday, i) => (
            <div key={i} className={`holiday-item${expandedHoliday === i ? ' holiday-item--open' : ''}`}>
              <button className="holiday-header" onClick={() => toggleHoliday(i)}>
                <div className="holiday-header-content">
                  <span className="holiday-level">{holiday.level === 'major' ? 'Major Holiday' : 'Minor Holiday'}</span>
                  <div className="holiday-name">
                    {holiday.emoji && <span className="holiday-icon">{holiday.emoji}</span>}
                    <span>{holiday.name}</span>
                  </div>
                </div>
                <span className="holiday-chevron">▼</span>
              </button>
              {expandedHoliday === i && (
                <div className="holiday-details">
                  {holiday.memo && <p className="holiday-memo">{holiday.memo}</p>}
                  {holiday.categories.length > 0 && (
                    <div className="holiday-categories">
                      {holiday.categories.map(c => <span key={c} className="holiday-tag">{c}</span>)}
                    </div>
                  )}
                  {holiday.url && (
                    <a href={holiday.url} target="_blank" rel="noopener noreferrer" className="holiday-link">
                      Learn more ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
