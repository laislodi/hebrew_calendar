import { useState, useRef, useEffect } from 'react'
import { HDate } from '@hebcal/core'
import { type View, getMonthName, navigateMonth, getWeekStart } from './utils/hebrewCalendar'
import MonthView from './components/MonthView'
import YearView from './components/YearView'
import WeekView from './components/WeekView'
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

      {view === 'month' && <MonthView month={current.month} year={current.year} today={today} />}
      {view === 'year' && (
        <YearView
          year={current.year}
          today={today}
          onMonthSelect={month => { setCurrent(c => ({ ...c, month })); setView('month') }}
        />
      )}
      {view === 'week' && <WeekView weekStart={weekStart} today={today} />}
    </div>
  )
}

export default App;
