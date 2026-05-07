import { HDate } from '@hebcal/core'
import { WEEK_DAYS, getMonthName, isSameHDate } from '../utils/hebrewCalendar'

interface Props {
  weekStart: Date
  today: HDate
}

export default function WeekView({ weekStart, today }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  return (
    <div className="week-grid">
      {days.map((gregDate, i) => {
        const hdate = new HDate(gregDate)
        const isToday = isSameHDate(today, hdate.getDate(), hdate.getMonth(), hdate.getFullYear())
        return (
          <div key={i} className={`week-cell${isToday ? ' week-cell--today' : ''}`}>
            <span className="week-dayname">{WEEK_DAYS[i]}</span>
            <span className="week-hday">{hdate.getDate()}</span>
            <span className="week-hmonth">{getMonthName(hdate.getMonth(), hdate.getFullYear())}</span>
            <span className="week-greg">{gregDate.getMonth() + 1}/{gregDate.getDate()}</span>
          </div>
        )
      })}
    </div>
  )
}
