import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HDate } from '@hebcal/core'
import WeekView from './WeekView'
import { WEEK_DAYS } from '../../utils/hebrewCalendar'

// weekStart: Sunday January 7, 2024
const weekStart = new Date(2024, 0, 7)
// today: Tuesday January 9, 2024 (column index 2)
const todayGreg = new Date(2024, 0, 9)
const today = new HDate(todayGreg)
// selected: Thursday January 11, 2024 (column index 4)
const selectedDay = new Date(2024, 0, 11)

const defaultProps = {
  weekStart,
  today,
  selectedDay: null as Date | null,
  onDaySelect: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('WeekView – column headers', () => {
  it('renders 7 column headers', () => {
    const { container } = render(<WeekView {...defaultProps} />)
    const headers = container.querySelectorAll('.week-col-header')
    expect(headers).toHaveLength(7)
  })

  it('renders all week day names', () => {
    render(<WeekView {...defaultProps} />)
    for (const day of WEEK_DAYS) {
      expect(screen.getByText(day)).toBeTruthy()
    }
  })

  it('shows both Hebrew and Gregorian date info in each header', () => {
    render(<WeekView {...defaultProps} />)
    // Jan 7 is Sunday — Gregorian "1/7" should appear
    expect(screen.getByText('1/7')).toBeTruthy()
    expect(screen.getByText('1/13')).toBeTruthy()
  })

  it('applies today class to today\'s column header', () => {
    const { container } = render(<WeekView {...defaultProps} today={today} />)
    const headers = container.querySelectorAll('.week-col-header')
    // today is Tuesday (index 2)
    expect(headers[2].className).toContain('week-col-header--today')
  })

  it('does not apply today class to other columns', () => {
    const { container } = render(<WeekView {...defaultProps} today={today} />)
    const headers = container.querySelectorAll('.week-col-header')
    expect(headers[0].className).not.toContain('week-col-header--today')
    expect(headers[4].className).not.toContain('week-col-header--today')
  })

  it('applies selected class to the selected day\'s column header', () => {
    const { container } = render(<WeekView {...defaultProps} selectedDay={selectedDay} />)
    const headers = container.querySelectorAll('.week-col-header')
    // selected is Thursday (index 4)
    expect(headers[4].className).toContain('week-col-header--selected')
    expect(headers[0].className).not.toContain('week-col-header--selected')
  })

  it('applies no today/selected class when today is outside this week', () => {
    const outsideToday = new HDate(new Date(2024, 1, 1)) // February 1
    const { container } = render(<WeekView {...defaultProps} today={outsideToday} />)
    expect(container.querySelector('.week-col-header--today')).toBeNull()
  })
})

describe('WeekView – hour rows', () => {
  it('renders exactly 24 hour rows', () => {
    const { container } = render(<WeekView {...defaultProps} />)
    const rows = container.querySelectorAll('.week-hour-row')
    expect(rows).toHaveLength(24)
  })

  it('renders time labels from 00:00 to 23:00', () => {
    render(<WeekView {...defaultProps} />)
    expect(screen.getByText('00:00')).toBeTruthy()
    expect(screen.getByText('12:00')).toBeTruthy()
    expect(screen.getByText('23:00')).toBeTruthy()
  })

  it('each hour row contains 7 hour cells', () => {
    const { container } = render(<WeekView {...defaultProps} />)
    const firstRow = container.querySelector('.week-hour-row')
    const cells = firstRow?.querySelectorAll('.week-hour-cell')
    expect(cells).toHaveLength(7)
  })

  it('applies today class to today\'s hour cells', () => {
    const { container } = render(<WeekView {...defaultProps} today={today} />)
    const firstRow = container.querySelector('.week-hour-row')
    const cells = firstRow?.querySelectorAll('.week-hour-cell')
    // today is Tuesday (index 2)
    expect(cells?.[2].className).toContain('week-hour-cell--today')
    expect(cells?.[0].className).not.toContain('week-hour-cell--today')
  })

  it('applies selected class to selected day\'s hour cells', () => {
    const { container } = render(<WeekView {...defaultProps} selectedDay={selectedDay} />)
    const firstRow = container.querySelector('.week-hour-row')
    const cells = firstRow?.querySelectorAll('.week-hour-cell')
    // selected is Thursday (index 4)
    expect(cells?.[4].className).toContain('week-hour-cell--selected')
    expect(cells?.[0].className).not.toContain('week-hour-cell--selected')
  })
})

describe('WeekView – click interactions', () => {
  it('calls onDaySelect when a column header is clicked', () => {
    const { container } = render(<WeekView {...defaultProps} />)
    const headers = container.querySelectorAll('.week-col-header')
    fireEvent.click(headers[0]) // Sunday Jan 7
    expect(defaultProps.onDaySelect).toHaveBeenCalledTimes(1)
  })

  it('passes the correct Gregorian date when a column header is clicked', () => {
    const { container } = render(<WeekView {...defaultProps} />)
    const headers = container.querySelectorAll('.week-col-header')
    fireEvent.click(headers[0]) // Sunday Jan 7
    const called = (defaultProps.onDaySelect as ReturnType<typeof vi.fn>).mock.calls[0][0] as Date
    expect(called.getDate()).toBe(7)
    expect(called.getMonth()).toBe(0)
    expect(called.getFullYear()).toBe(2024)
  })

  it('passes the correct date for a mid-week column', () => {
    const { container } = render(<WeekView {...defaultProps} />)
    const headers = container.querySelectorAll('.week-col-header')
    fireEvent.click(headers[3]) // Wednesday Jan 10
    const called = (defaultProps.onDaySelect as ReturnType<typeof vi.fn>).mock.calls[0][0] as Date
    expect(called.getDate()).toBe(10)
  })

  it('calls onDaySelect when an hour cell is clicked', () => {
    const { container } = render(<WeekView {...defaultProps} />)
    const firstHourRow = container.querySelector('.week-hour-row')
    const cells = firstHourRow?.querySelectorAll('.week-hour-cell')
    fireEvent.click(cells![0])
    expect(defaultProps.onDaySelect).toHaveBeenCalledTimes(1)
  })

  it('passes the correct date when an hour cell is clicked', () => {
    const { container } = render(<WeekView {...defaultProps} />)
    const rows = container.querySelectorAll('.week-hour-row')
    const cells = rows[0].querySelectorAll('.week-hour-cell')
    fireEvent.click(cells[2]) // Tuesday column
    const called = (defaultProps.onDaySelect as ReturnType<typeof vi.fn>).mock.calls[0][0] as Date
    expect(called.getDate()).toBe(9) // Jan 9
  })
})
