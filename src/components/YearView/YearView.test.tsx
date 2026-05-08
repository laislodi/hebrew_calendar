import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HDate, months } from '@hebcal/core'
import YearView from './YearView'
import { getMonthName, getYearMonthOrder } from '../../utils/hebrewCalendar'

const NON_LEAP_YEAR = 5785
const LEAP_YEAR = 5784
// October 15, 2024 = 13 Tishrei 5785 (Rosh Hashana 5785 was Oct 2 2024)
const today = new HDate(new Date(2024, 9, 15))

const defaultProps = {
  year: NON_LEAP_YEAR,
  today,
  selectedDay: null as Date | null,
  onMonthSelect: vi.fn(),
  onDaySelect: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('YearView – month grid', () => {
  it('renders 12 mini months for a non-leap year', () => {
    const { container } = render(<YearView {...defaultProps} />)
    expect(container.querySelectorAll('.mini-month')).toHaveLength(12)
  })

  it('renders 13 mini months for a leap year', () => {
    const { container } = render(<YearView {...defaultProps} year={LEAP_YEAR} />)
    expect(container.querySelectorAll('.mini-month')).toHaveLength(13)
  })

  it('displays all month names for the year', () => {
    render(<YearView {...defaultProps} />)
    for (const month of getYearMonthOrder(NON_LEAP_YEAR)) {
      expect(screen.getByText(getMonthName(month, NON_LEAP_YEAR))).toBeTruthy()
    }
  })

  it('shows "Adar I" and "Adar II" in a leap year', () => {
    render(<YearView {...defaultProps} year={LEAP_YEAR} />)
    expect(screen.getByText('Adar I')).toBeTruthy()
    expect(screen.getByText('Adar II')).toBeTruthy()
  })

  it('shows "Adar" (not "Adar I") in a non-leap year', () => {
    render(<YearView {...defaultProps} />)
    expect(screen.getByText('Adar')).toBeTruthy()
    expect(screen.queryByText('Adar I')).toBeNull()
  })
})

describe('YearView – day highlights', () => {
  it('marks today in the correct mini month', () => {
    const { container } = render(<YearView {...defaultProps} today={today} />)
    expect(container.querySelector('.mini-cell--today')).not.toBeNull()
  })

  it('does not mark any cell as today when today is in a different year', () => {
    const differentYear = new HDate(new Date(2022, 0, 1)) // well outside 5785
    const { container } = render(<YearView {...defaultProps} today={differentYear} />)
    expect(container.querySelector('.mini-cell--today')).toBeNull()
  })

  it('marks selected day in the correct mini month', () => {
    const selectedDay = new HDate(15, months.TISHREI, NON_LEAP_YEAR).greg()
    const { container } = render(<YearView {...defaultProps} selectedDay={selectedDay} />)
    expect(container.querySelector('.mini-cell--selected')).not.toBeNull()
  })

  it('does not mark any cell as selected when selectedDay is null', () => {
    const { container } = render(<YearView {...defaultProps} selectedDay={null} />)
    expect(container.querySelector('.mini-cell--selected')).toBeNull()
  })
})

describe('YearView – month name click', () => {
  it('calls onMonthSelect with TISHREI when "Tishrei" is clicked', () => {
    render(<YearView {...defaultProps} />)
    fireEvent.click(screen.getByText('Tishrei'))
    expect(defaultProps.onMonthSelect).toHaveBeenCalledWith(months.TISHREI)
  })

  it('calls onMonthSelect with NISAN when "Nisan" is clicked', () => {
    render(<YearView {...defaultProps} />)
    fireEvent.click(screen.getByText('Nisan'))
    expect(defaultProps.onMonthSelect).toHaveBeenCalledWith(months.NISAN)
  })

  it('calls onMonthSelect with ELUL when "Elul" is clicked', () => {
    render(<YearView {...defaultProps} />)
    fireEvent.click(screen.getByText('Elul'))
    expect(defaultProps.onMonthSelect).toHaveBeenCalledWith(months.ELUL)
  })

  it('calls onMonthSelect with ADAR_I when "Adar II" is clicked in a leap year', () => {
    render(<YearView {...defaultProps} year={LEAP_YEAR} />)
    fireEvent.click(screen.getByText('Adar II'))
    expect(defaultProps.onMonthSelect).toHaveBeenCalledWith(months.ADAR_II)
  })
})

describe('YearView – day cell click', () => {
  it('calls onDaySelect when a day cell is clicked', () => {
    const { container } = render(<YearView {...defaultProps} />)
    const cells = container.querySelectorAll('.mini-cell:not(.mini-cell--empty)')
    fireEvent.click(cells[0])
    expect(defaultProps.onDaySelect).toHaveBeenCalledTimes(1)
  })

  it('passes a Date as the first argument', () => {
    const { container } = render(<YearView {...defaultProps} />)
    const cells = container.querySelectorAll('.mini-cell:not(.mini-cell--empty)')
    fireEvent.click(cells[0])
    const [date] = (defaultProps.onDaySelect as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(date).toBeInstanceOf(Date)
  })

  it('passes the correct Gregorian date for day 1 of Tishrei', () => {
    const { container } = render(<YearView {...defaultProps} />)
    const cells = container.querySelectorAll('.mini-cell:not(.mini-cell--empty)')
    fireEvent.click(cells[0]) // first day in the grid = 1 Tishrei 5785
    const expected = new HDate(1, months.TISHREI, NON_LEAP_YEAR).greg()
    const called = (defaultProps.onDaySelect as ReturnType<typeof vi.fn>).mock.calls[0][0] as Date
    expect(called.getDate()).toBe(expected.getDate())
    expect(called.getMonth()).toBe(expected.getMonth())
    expect(called.getFullYear()).toBe(expected.getFullYear())
  })

  it('passes a DOMRect as the second argument', () => {
    const { container } = render(<YearView {...defaultProps} />)
    const cells = container.querySelectorAll('.mini-cell:not(.mini-cell--empty)')
    fireEvent.click(cells[0])
    const [, rect] = (defaultProps.onDaySelect as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(rect).toBeInstanceOf(Object)
    expect(typeof rect.top).toBe('number')
    expect(typeof rect.left).toBe('number')
  })
})
