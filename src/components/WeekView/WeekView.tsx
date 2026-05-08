import { HDate } from '@hebcal/core'
import { WEEK_DAYS, isSameHDate, isSameDayGreg } from '../../utils/hebrewCalendar'
import './WeekView.css'

interface Props {
  weekStart: Date
  today: HDate
  selectedDay: Date | null
  onDaySelect: (d: Date) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function WeekView({ weekStart, today, selectedDay, onDaySelect }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const gregDate = new Date(weekStart)
    gregDate.setDate(gregDate.getDate() + i)
    const hdate = new HDate(gregDate)
    const isToday = isSameHDate(today, hdate.getDate(), hdate.getMonth(), hdate.getFullYear())
    const isSelected = selectedDay !== null && isSameDayGreg(selectedDay, gregDate)
    return { gregDate, hdate, isToday, isSelected }
  })

  return (
    <div className="week-container">
      <div className="week-header">
        <div className="week-gutter" />
        {days.map(({ gregDate, hdate, isToday, isSelected }, i) => (
          <div
            key={i}
            className={`week-col-header${isToday ? ' week-col-header--today' : ''}${isSelected ? ' week-col-header--selected' : ''}`}
            onClick={() => onDaySelect(gregDate)}
          >
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
            {days.map(({ gregDate, isToday, isSelected }, i) => (
              <div
                key={i}
                className={`week-hour-cell${isToday ? ' week-hour-cell--today' : ''}${isSelected ? ' week-hour-cell--selected' : ''}`}
                onClick={() => onDaySelect(gregDate)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
