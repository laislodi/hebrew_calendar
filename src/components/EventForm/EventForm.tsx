import { useState } from 'react'
import { HDate } from '@hebcal/core'
import type { CalendarEvent } from '../../types/event'
import { getMonthName, getYearMonthOrder } from '../../utils/hebrewCalendar'
import './EventForm.css'

interface Props {
  initialDate: Date
  event?: CalendarEvent
  onSave: (e: Omit<CalendarEvent, 'id'>) => void
  onDelete?: () => void
  onClose: () => void
}

function localDatePrefix(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Parses "YYYY-MM-DDTHH:MM" → HDate parts + time string
function isoToHebrew(iso: string): { year: number; month: number; day: number; time: string } {
  const [datePart, time] = iso.split('T')
  const greg = new Date(`${datePart}T12:00:00`)
  const hdate = new HDate(greg)
  return { year: hdate.getFullYear(), month: hdate.getMonth(), day: hdate.getDate(), time: time ?? '09:00' }
}

// Converts HDate parts + time string → "YYYY-MM-DDTHH:MM"
function hebrewToISO(year: number, month: number, day: number, time: string): string {
  const validMonths = getYearMonthOrder(year)
  const safeMonth = validMonths.includes(month) ? month : validMonths[0]
  const maxDay = HDate.daysInMonth(safeMonth, year)
  const safeDay = Math.min(day, maxDay)
  const greg = new HDate(safeDay, safeMonth, year).greg()
  const y = greg.getFullYear()
  const m = String(greg.getMonth() + 1).padStart(2, '0')
  const d = String(greg.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}T${time}`
}

// ---- Gregorian date picker ----

const GREG_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function daysInGregMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function isoToGregorian(iso: string): { year: number; month: number; day: number; time: string } {
  const [datePart, time] = iso.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  return { year: y, month: m - 1, day: d, time: time ?? '09:00' }
}

function gregorianToISO(year: number, month: number, day: number, time: string): string {
  const safeDay = Math.min(day, daysInGregMonth(month, year))
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}T${time}`
}

function GregorianDatePicker({ label, value, onChange }: HebrewPickerProps) {
  const { year, month, day, time } = isoToGregorian(value)
  const totalDays = daysInGregMonth(month, year)

  function update(y: number, mo: number, d: number, t: string) {
    if (!y || y < 1) return
    onChange(gregorianToISO(y, mo, d, t))
  }

  return (
    <div className="form-field">
      <label>{label}</label>
      <div className="heb-picker">
        <div className="heb-picker-date">
          <select value={month} onChange={e => update(year, Number(e.target.value), day, time)}>
            {GREG_MONTH_NAMES.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>
          <select value={day} onChange={e => update(year, month, Number(e.target.value), time)}>
            {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input
            className="heb-picker-year"
            type="number"
            value={year}
            min={1}
            onChange={e => update(Number(e.target.value), month, day, time)}
          />
        </div>
        <input
          className="heb-picker-time"
          type="time"
          value={time}
          onChange={e => update(year, month, day, e.target.value)}
        />
      </div>
    </div>
  )
}

// ---- Hebrew date picker ----

interface HebrewPickerProps {
  label: string
  value: string // ISO "YYYY-MM-DDTHH:MM"
  onChange: (iso: string) => void
}

function HebrewDatePicker({ label, value, onChange }: HebrewPickerProps) {
  const { year, month, day, time } = isoToHebrew(value)
  const months = getYearMonthOrder(year).map(m => ({ value: m, label: getMonthName(m, year) }))
  const daysInMonth = HDate.daysInMonth(month, year)

  function update(y: number, mo: number, d: number, t: string) {
    if (!y || y < 1) return
    onChange(hebrewToISO(y, mo, d, t))
  }

  return (
    <div className="form-field">
      <label>{label}</label>
      <div className="heb-picker">
        <div className='heb-picker-date'>
          <select value={month} onChange={e => update(year, Number(e.target.value), day, time)}>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={day} onChange={e => update(year, month, Number(e.target.value), time)}>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input
            className="heb-picker-year"
            type="number"
            value={year}
            min={1}
            onChange={e => update(Number(e.target.value), month, day, time)}
          />
        </div>
        <input
          className="heb-picker-time"
          type="time"
          value={time}
          onChange={e => update(year, month, day, e.target.value)}
        />
      </div>
    </div>
  )
}

// ---- Main form ----

export default function EventForm({ initialDate, event, onSave, onDelete, onClose }: Props) {
  const datePrefix = localDatePrefix(initialDate)

  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [startTime, setStartTime] = useState(event?.startTime ?? `${datePrefix}T09:00`);
  const [endTime, setEndTime] = useState(event?.endTime ?? `${datePrefix}T10:00`);
  const [useHebrew, setUseHebrew] = useState(event?.useHebrewDate ?? false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return
    onSave({ title: title.trim(), description: description.trim(), useHebrewDate: useHebrew, startTime, endTime })
    onClose()
  }

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-box" onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <h3>{event ? 'Edit Event' : 'New Event'}</h3>
          <button className="form-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Event title"
              required
              autoFocus
            />
          </div>

          <div className="form-field">
            <label>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={useHebrew}
              onChange={e => setUseHebrew(e.target.checked)}
            />
            Use Hebrew dates
          </label>

          {useHebrew ? (
            <>
              <HebrewDatePicker label="From" value={startTime} onChange={setStartTime} />
              <HebrewDatePicker label="To" value={endTime} onChange={setEndTime} />
            </>
          ) : (
            <>
              <GregorianDatePicker label="From" value={startTime} onChange={setStartTime} />
              <GregorianDatePicker label="To" value={endTime} onChange={setEndTime} />
            </>
          )}

          <div className="form-actions">
            {onDelete && (
              <button type="button" className="form-btn form-btn--delete" onClick={() => { onDelete(); onClose() }}>
                Delete
              </button>
            )}
            <div className="form-actions-right">
              <button type="button" className="form-btn form-btn--cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="form-btn form-btn--save">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
