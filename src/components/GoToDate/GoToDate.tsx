import { useState, useRef, useEffect } from 'react'
import { HDate } from '@hebcal/core'
import { getMonthName, getYearMonthOrder } from '../../utils/hebrewCalendar'
import './GoToDate.css'

interface Props {
  onGoToDate: (date: Date) => void
}

const GREG_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function daysInGregMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export default function GoToDate({ onGoToDate }: Props) {
  const [open, setOpen] = useState(false)
  const [useGregorian, setUseGregorian] = useState(false)

  const today = new HDate()
  const todayGreg = today.greg()

  const [hYear, setHYear] = useState(today.getFullYear())
  const [hMonth, setHMonth] = useState(today.getMonth())
  const [hDay, setHDay] = useState(today.getDate())

  const [gYear, setGYear] = useState(todayGreg.getFullYear())
  const [gMonth, setGMonth] = useState(todayGreg.getMonth())
  const [gDay, setGDay] = useState(todayGreg.getDate())

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const hMonths = getYearMonthOrder(hYear).map(m => ({ value: m, label: getMonthName(m, hYear) }))
  const hDaysInMonth = HDate.daysInMonth(hMonth, hYear)
  const gDaysInMonth = daysInGregMonth(gMonth, gYear)

  function handleGo() {
    if (useGregorian) {
      if (!gYear || gYear < 1) return
      const safeDay = Math.min(gDay, gDaysInMonth)
      onGoToDate(new Date(gYear, gMonth, safeDay))
    } else {
      if (!hYear || hYear < 1) return
      const validMonths = getYearMonthOrder(hYear)
      const safeMonth = validMonths.includes(hMonth) ? hMonth : validMonths[0]
      const safeDay = Math.min(hDay, HDate.daysInMonth(safeMonth, hYear))
      onGoToDate(new HDate(safeDay, safeMonth, hYear).greg())
    }
    setOpen(false)
  }

  function handleToday() {
    onGoToDate(todayGreg)
    setOpen(false)
  }

  return (
    <div className="goto-wrapper" ref={ref}>
      <button className="goto-btn" onClick={() => setOpen(o => !o)}>
        Go to Date
      </button>
      {open && (
        <div className="goto-panel">
          <label className="goto-checkbox">
            <input
              type="checkbox"
              checked={useGregorian}
              onChange={e => setUseGregorian(e.target.checked)}
            />
            Use Gregorian date
          </label>

          {useGregorian ? (
            <div className="goto-date-row">
              <select value={gMonth} onChange={e => setGMonth(Number(e.target.value))}>
                {GREG_MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i}>{name}</option>
                ))}
              </select>
              <select value={gDay} onChange={e => setGDay(Number(e.target.value))}>
                {Array.from({ length: gDaysInMonth }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <input
                className="goto-year"
                type="number"
                value={gYear}
                min={1}
                onChange={e => setGYear(Number(e.target.value))}
              />
            </div>
          ) : (
            <div className="goto-date-row">
              <select value={hMonth} onChange={e => setHMonth(Number(e.target.value))}>
                {hMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select value={hDay} onChange={e => setHDay(Number(e.target.value))}>
                {Array.from({ length: hDaysInMonth }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <input
                className="goto-year"
                type="number"
                value={hYear}
                min={1}
                onChange={e => setHYear(Number(e.target.value))}
              />
            </div>
          )}

          <div className="goto-actions">
            <button type="button" className="goto-today-btn" onClick={handleToday}>Today</button>
            <button type="button" className="goto-go-btn" onClick={handleGo}>Go</button>
          </div>
        </div>
      )}
    </div>
  )
}
