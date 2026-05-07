import { HDate } from '@hebcal/core'
import { WEEK_DAYS_MINI, getMonthName, getYearMonthOrder, buildMonthCells, isSameHDate } from '../utils/hebrewCalendar'

interface MiniMonthProps {
  month: number
  year: number
  today: HDate
  onMonthSelect: (month: number) => void
}

function MiniMonth({ month, year, today, onMonthSelect }: MiniMonthProps) {
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
          return (
            <div key={i} className={`mini-cell${isToday ? ' mini-cell--today' : ''}`}>
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
  onMonthSelect: (month: number) => void
}

export default function YearView({ year, today, onMonthSelect }: Props) {
  return (
    <div className="year-grid">
      {getYearMonthOrder(year).map(month => (
        <MiniMonth key={month} month={month} year={year} today={today} onMonthSelect={onMonthSelect} />
      ))}
    </div>
  )
}
