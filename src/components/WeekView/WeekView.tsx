import { HDate } from '@hebcal/core'
import { WEEK_DAYS, isSameHDate } from '../../utils/hebrewCalendar'
import './WeekView.css'

interface Props {
  weekStart: Date
  today: HDate
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function WeekView({ weekStart, today }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const gregDate = new Date(weekStart)
    gregDate.setDate(gregDate.getDate() + i)
    const hdate = new HDate(gregDate)
    const isToday = isSameHDate(today, hdate.getDate(), hdate.getMonth(), hdate.getFullYear())
    return { gregDate, hdate, isToday }
  })

  return (
    <div className="week-container">
      <div className="week-header">
        <div className="week-gutter" />
        {days.map(({ gregDate, hdate, isToday }, i) => (
          <div key={i} className={`week-col-header${isToday ? ' week-col-header--today' : ''}`}>
            <span className="week-dayname">{WEEK_DAYS[i]}</span>
            <span className="week-hday">{hdate.getDate()}</span>
            <span className="week-greg">{gregDate.getMonth() + 1}/{gregDate.getDate()}</span>
          </div>
        ))}
      </div>

      <div className="week-body">
        {HOURS.map(hour => (
          <div key={hour} className="week-hour-row">
            <div className="week-time-label">{String(hour).padStart(2, '0')}:00</div>
            {days.map(({ isToday }, i) => (
              <div key={i} className={`week-hour-cell${isToday ? ' week-hour-cell--today' : ''}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
