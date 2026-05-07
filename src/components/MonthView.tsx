import { HDate } from '@hebcal/core'
import { WEEK_DAYS, buildMonthCells, isSameHDate } from '../utils/hebrewCalendar'

interface Props {
  month: number
  year: number
  today: HDate
}

export default function MonthView({ month, year, today }: Props) {
  const cells = buildMonthCells(month, year)

  return (
    <div className="cal-grid">
      {WEEK_DAYS.map(d => <div key={d} className="cal-weekday">{d}</div>)}
      {cells.map((day, i) => {
        if (day === null) return <div key={i} className="cal-cell cal-cell--empty" />
        const greg = new HDate(day, month, year).greg()
        const isToday = isSameHDate(today, day, month, year)
        return (
          <div key={i} className={`cal-cell${isToday ? ' cal-cell--today' : ''}`}>
            <span className="cal-hday">{day}</span>
            <span className="cal-gday">{greg.getMonth() + 1}/{greg.getDate()}</span>
          </div>
        )
      })}
    </div>
  )
}
