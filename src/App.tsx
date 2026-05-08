import { useState, useRef, useEffect } from 'react'
import { HDate, HebrewCalendar } from '@hebcal/core'
import { type View, getMonthName, navigateMonth, getWeekStart } from './utils/hebrewCalendar'
import { useEvents } from './hooks/useEvents'
import MonthView from './components/MonthView/MonthView'
import YearView from './components/YearView/YearView'
import WeekView from './components/WeekView/WeekView'
import EventPanel from './components/EventPanel/EventPanel'
import './App.css'

function App() {
  const today = new HDate()

  const [view, setView] = useState<View>('month')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [current, setCurrent] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  })
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today.greg()))
  const [selectedDay, setSelectedDay] = useState<Date>(today.greg())
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [popupAnchor, setPopupAnchor] = useState<DOMRect | null>(null)

  const { addEvent, updateEvent, deleteEvent, getEventsForDay } = useEvents()

  function hasHolidayOnDay(date: Date): boolean {
    const hdate = new HDate(date)
    return (HebrewCalendar.getHolidaysOnDate(hdate, false) ?? []).length > 0
  }

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function yearLink(y: number) {
    return (
      <span className="cal-year-link" onClick={() => { setCurrent(c => ({ ...c, year: y })); setView('year') }}>
        {y}
      </span>
    )
  }

  function getTitle() {
    if (view === 'year') return <>{current.year}</>
    if (view === 'week') {
      const end = new Date(weekStart)
      end.setDate(end.getDate() + 6)
      const startH = new HDate(weekStart)
      const endH = new HDate(end)
      if (startH.getMonth() === endH.getMonth() && startH.getFullYear() === endH.getFullYear()) {
        return <>{getMonthName(startH.getMonth(), startH.getFullYear())} {startH.getDate()} – {endH.getDate()}, {yearLink(startH.getFullYear())}</>
      }
      return <>{getMonthName(startH.getMonth(), startH.getFullYear())} {startH.getDate()} – {getMonthName(endH.getMonth(), endH.getFullYear())} {endH.getDate()}, {yearLink(endH.getFullYear())}</>
    }
    return <>{getMonthName(current.month, current.year)} {yearLink(current.year)}</>
  }

  function handlePrev() {
    if (view === 'month') setCurrent(c => navigateMonth(c.month, c.year, -1))
    else if (view === 'year') setCurrent(c => ({ ...c, year: c.year - 1 }))
    else setWeekStart(d => { const nd = new Date(d); nd.setDate(nd.getDate() - 7); return nd })
  }

  function handleNext() {
    if (view === 'month') setCurrent(c => navigateMonth(c.month, c.year, 1))
    else if (view === 'year') setCurrent(c => ({ ...c, year: c.year + 1 }))
    else setWeekStart(d => { const nd = new Date(d); nd.setDate(nd.getDate() + 7); return nd })
  }

  function getPopupStyle(anchor: DOMRect): React.CSSProperties {
    const POPUP_WIDTH = 320
    const POPUP_HEIGHT_EST = 300
    const GAP = 8
    const top = anchor.bottom + GAP + window.scrollY
    const adjustedTop = anchor.bottom + POPUP_HEIGHT_EST + GAP > window.innerHeight
      ? anchor.top - POPUP_HEIGHT_EST - GAP + window.scrollY
      : top
    const left = anchor.left + POPUP_WIDTH > window.innerWidth
      ? anchor.right - POPUP_WIDTH
      : anchor.left
    return { top: adjustedTop, left, width: POPUP_WIDTH }
  }

  const eventPanel = (variant: 'below' | 'sidebar') => (
    <EventPanel
      selectedDay={selectedDay}
      events={getEventsForDay(selectedDay)}
      onAddEvent={addEvent}
      onUpdateEvent={updateEvent}
      onDeleteEvent={deleteEvent}
      className={`event-panel--${variant}`}
    />
  )

  return (
    <div className="cal-wrapper">
      <div className="cal-topbar">
        <h1 className="cal-heading">Hebrew Calendar</h1>
        <div className="cal-view-selector" ref={dropdownRef}>
          <button className="cal-view-btn" onClick={() => setDropdownOpen(o => !o)}>
            {view.charAt(0).toUpperCase() + view.slice(1)}
            <span className="cal-caret">▾</span>
          </button>
          {dropdownOpen && (
            <div className="cal-dropdown">
              {(['year', 'month', 'week'] as View[]).map(v => (
                <button
                  key={v}
                  className={`cal-dropdown-item${view === v ? ' active' : ''}`}
                  onClick={() => { setView(v); setDropdownOpen(false) }}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="cal-nav">
        <button onClick={handlePrev}>&#8592;</button>
        <span className="cal-month-label">{getTitle()}</span>
        <button onClick={handleNext}>&#8594;</button>
      </div>

      {view === 'month' && (
        <>
          <MonthView
            month={current.month}
            year={current.year}
            today={today}
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
            hasEventsForDay={d => getEventsForDay(d).length > 0}
            hasHolidayForDay={hasHolidayOnDay}
          />
          {eventPanel('below')}
        </>
      )}

      {view === 'year' && (
        <>
          <YearView
            year={current.year}
            today={today}
            selectedDay={selectedDay}
            onMonthSelect={month => { setCurrent(c => ({ ...c, month })); setView('month') }}
            onDaySelect={(d, rect) => { setSelectedDay(d); setPopupAnchor(rect); setSidebarVisible(true) }}
            hasEventsForDay={d => getEventsForDay(d).length > 0}
            hasHolidayForDay={hasHolidayOnDay}
          />
          {sidebarVisible && popupAnchor && (
            <>
              <div className="panel-backdrop" onClick={() => setSidebarVisible(false)} />
              <div className="panel-popup" style={getPopupStyle(popupAnchor)} onClick={e => e.stopPropagation()}>
                <EventPanel
                  selectedDay={selectedDay}
                  events={getEventsForDay(selectedDay)}
                  onAddEvent={addEvent}
                  onUpdateEvent={updateEvent}
                  onDeleteEvent={deleteEvent}
                  onClose={() => setSidebarVisible(false)}
                />
              </div>
            </>
          )}
        </>
      )}

      {view === 'week' && (
        <>
          <WeekView
            weekStart={weekStart}
            today={today}
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
          />
          {eventPanel('below')}
        </>
      )}
    </div>
  )
}

export default App;
