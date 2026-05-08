import { HDate } from '@hebcal/core'
import { WEEK_DAYS, buildMonthCells, isSameHDate, isSameDayGreg } from '../../utils/hebrewCalendar'
import './MonthView.css'

interface Props {
  month: number
  year: number
  today: HDate
  selectedDay: Date | null
  onDaySelect: (d: Date) => void
  hasEventsForDay?: (date: Date) => boolean
  hasHolidayForDay?: (date: Date) => boolean
}

export default function MonthView({ month, year, today, selectedDay, onDaySelect, hasEventsForDay, hasHolidayForDay }: Props) {
  const cells = buildMonthCells(month, year)

  return (
    <div className="cal-grid">
      {WEEK_DAYS.map(d => <div key={d} className="cal-weekday">{d}</div>)}
      {cells.map((day, i) => {
        if (day === null) return <div key={i} className="cal-cell cal-cell--empty" />
        const greg = new HDate(day, month, year).greg()
        const isToday = isSameHDate(today, day, month, year)
        const isSelected = selectedDay !== null && isSameDayGreg(selectedDay, greg)
        const hasEvents = hasEventsForDay?.(greg) ?? false
        const hasHoliday = hasHolidayForDay?.(greg) ?? false
        return (
          <div
            key={i}
            className={`cal-cell${isToday ? ' cal-cell--today' : ''}${isSelected ? ' cal-cell--selected' : ''}`}
            onClick={() => onDaySelect(greg)}
          >
            {(hasHoliday || hasEvents) && (
              <div className="cell-dots">
                {hasHoliday && <span className="holiday-dot" />}
                {hasEvents && <span className="event-dot" />}
              </div>
            )}
            <span className="cal-hday">{day}</span>
            <span className="cal-gday">{greg.getMonth() + 1}/{greg.getDate()}</span>
          </div>
        )
      })}
    </div>
  )
}
