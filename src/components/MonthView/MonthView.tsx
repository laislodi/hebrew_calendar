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
  holidayLevelForDay?: (date: Date) => 'major' | 'minor' | null
}

export default function MonthView({ month, year, today, selectedDay, onDaySelect, hasEventsForDay, holidayLevelForDay }: Props) {
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
        const holidayLevel = holidayLevelForDay?.(greg) ?? null
        return (
          <div
            key={i}
            className={`cal-cell${isToday ? ' cal-cell--today' : ''}${isSelected ? ' cal-cell--selected' : ''}`}
            onClick={() => onDaySelect(greg)}
          >
            {(holidayLevel || hasEvents) && (
              <div className="cell-dots">
                {holidayLevel && (
                  <span className={`holiday-dot${holidayLevel === 'minor' ? ' holiday-dot--minor' : ''}`} />
                )}
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
