import { HDate } from '@hebcal/core'
import { WEEK_DAYS_MINI, getMonthName, getYearMonthOrder, buildMonthCells, isSameHDate, isSameDayGreg } from '../../utils/hebrewCalendar'
import './YearView.css'

interface MiniMonthProps {
  month: number
  year: number
  today: HDate
  selectedDay: Date | null
  onMonthSelect: (month: number) => void
  onDaySelect: (d: Date, rect: DOMRect) => void
  hasEventsForDay?: (date: Date) => boolean
  holidayLevelForDay?: (date: Date) => 'major' | 'minor' | null
}

function MiniMonth({ month, year, today, selectedDay, onMonthSelect, onDaySelect, hasEventsForDay, holidayLevelForDay }: MiniMonthProps) {
  const cells = buildMonthCells(month, year)

  return (
    <div className="mini-month">
      <div className="mini-month-name mini-month-name--link" onClick={() => onMonthSelect(month)}>
        {getMonthName(month, year)}
      </div>
      <div className="mini-grid">
        {WEEK_DAYS_MINI.map((d, i) => <div key={i} className="mini-weekday">{d}</div>)}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="mini-cell mini-cell--empty" />
          const isToday = isSameHDate(today, day, month, year)
          const gregDate = new HDate(day, month, year).greg()
          const isSelected = selectedDay !== null && isSameDayGreg(selectedDay, gregDate)
          const hasEvents = hasEventsForDay?.(gregDate) ?? false
          const holidayLevel = holidayLevelForDay?.(gregDate) ?? null
          return (
            <div
              key={i}
              className={`mini-cell${isToday ? ' mini-cell--today' : ''}${isSelected ? ' mini-cell--selected' : ''}`}
              onClick={e => onDaySelect(gregDate, (e.currentTarget as HTMLElement).getBoundingClientRect())}
            >
              {(holidayLevel || hasEvents) && (
                <div className="cell-dots">
                  {holidayLevel && (
                    <span className={`holiday-dot${holidayLevel === 'minor' ? ' holiday-dot--minor' : ''}`} />
                  )}
                  {hasEvents && <span className="event-dot" />}
                </div>
              )}
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface Props {
  year: number
  today: HDate
  selectedDay: Date | null
  onMonthSelect: (month: number) => void
  onDaySelect: (d: Date, rect: DOMRect) => void
  hasEventsForDay?: (date: Date) => boolean
  holidayLevelForDay?: (date: Date) => 'major' | 'minor' | null
}

export default function YearView({ year, today, selectedDay, onMonthSelect, onDaySelect, hasEventsForDay, holidayLevelForDay }: Props) {
  return (
    <div className="year-grid">
      {getYearMonthOrder(year).map(month => (
        <MiniMonth
          key={month}
          month={month}
          year={year}
          today={today}
          selectedDay={selectedDay}
          onMonthSelect={onMonthSelect}
          onDaySelect={onDaySelect}
          hasEventsForDay={hasEventsForDay}
          holidayLevelForDay={holidayLevelForDay}
        />
      ))}
    </div>
  )
}
