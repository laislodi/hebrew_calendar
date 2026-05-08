import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HDate, months } from '@hebcal/core'
import MonthView from './MonthView'
import { WEEK_DAYS } from '../../utils/hebrewCalendar'

const year = 5785
const month = months.TISHREI // Tishrei always has 30 days
const today = new HDate(1, month, year)
const day5Greg = new HDate(5, month, year).greg()

const defaultProps = {
  month,
  year,
  today,
  selectedDay: null as Date | null,
  onDaySelect: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MonthView – weekday headers', () => {
  it('renders all 7 weekday headers', () => {
    render(<MonthView {...defaultProps} />)
    for (const day of WEEK_DAYS) {
      expect(screen.getByText(day)).toBeTruthy()
    }
  })
})

describe('MonthView – day cells', () => {
  it('renders 30 day cells for Tishrei (which always has 30 days)', () => {
    const { container } = render(<MonthView {...defaultProps} />)
    const cells = container.querySelectorAll('.cal-cell:not(.cal-cell--empty)')
    expect(cells).toHaveLength(30)
  })

  it('total cell count (including empty) is a multiple of 7', () => {
    const { container } = render(<MonthView {...defaultProps} />)
    const allCells = container.querySelectorAll('.cal-cell')
    expect(allCells.length % 7).toBe(0)
  })

  it('shows Hebrew day numbers starting at 1', () => {
    render(<MonthView {...defaultProps} />)
    expect(screen.getByText('1')).toBeTruthy()
    expect(screen.getByText('30')).toBeTruthy()
  })
})

describe('MonthView – today highlight', () => {
  it('applies cal-cell--today to today\'s cell', () => {
    const { container } = render(<MonthView {...defaultProps} />)
    const todayCell = container.querySelector('.cal-cell--today')
    expect(todayCell).not.toBeNull()
  })

  it('does not mark today when today is in a different month', () => {
    const differentToday = new HDate(1, months.NISAN, year)
    const { container } = render(<MonthView {...defaultProps} today={differentToday} />)
    expect(container.querySelector('.cal-cell--today')).toBeNull()
  })

  it('today cell contains the correct day number', () => {
    const { container } = render(<MonthView {...defaultProps} />)
    const todayCell = container.querySelector('.cal-cell--today')
    // today is day 1 of Tishrei
    expect(todayCell?.querySelector('.cal-hday')?.textContent).toBe('1')
  })
})

describe('MonthView – selected day highlight', () => {
  it('applies cal-cell--selected to the selected day\'s cell', () => {
    const { container } = render(<MonthView {...defaultProps} selectedDay={day5Greg} />)
    expect(container.querySelector('.cal-cell--selected')).not.toBeNull()
  })

  it('does not mark any cell as selected when selectedDay is null', () => {
    const { container } = render(<MonthView {...defaultProps} selectedDay={null} />)
    expect(container.querySelector('.cal-cell--selected')).toBeNull()
  })

  it('a cell can be both today and selected simultaneously', () => {
    const todayGreg = new HDate(1, month, year).greg()
    const { container } = render(<MonthView {...defaultProps} selectedDay={todayGreg} />)
    const cell = container.querySelector('.cal-cell--today.cal-cell--selected')
    expect(cell).not.toBeNull()
  })
})

describe('MonthView – day click', () => {
  it('calls onDaySelect when a day cell is clicked', () => {
    const { container } = render(<MonthView {...defaultProps} />)
    const cells = container.querySelectorAll('.cal-cell:not(.cal-cell--empty)')
    fireEvent.click(cells[0])
    expect(defaultProps.onDaySelect).toHaveBeenCalledTimes(1)
    expect(defaultProps.onDaySelect).toHaveBeenCalledWith(expect.any(Date))
  })

  it('passes the correct Gregorian date for day 1', () => {
    const { container } = render(<MonthView {...defaultProps} />)
    const cells = container.querySelectorAll('.cal-cell:not(.cal-cell--empty)')
    fireEvent.click(cells[0]) // day 1 of Tishrei 5785
    const expectedGreg = new HDate(1, month, year).greg()
    const called = (defaultProps.onDaySelect as ReturnType<typeof vi.fn>).mock.calls[0][0] as Date
    expect(called.getFullYear()).toBe(expectedGreg.getFullYear())
    expect(called.getMonth()).toBe(expectedGreg.getMonth())
    expect(called.getDate()).toBe(expectedGreg.getDate())
  })

  it('passes the correct Gregorian date for a mid-month day', () => {
    const { container } = render(<MonthView {...defaultProps} />)
    const cells = container.querySelectorAll('.cal-cell:not(.cal-cell--empty)')
    fireEvent.click(cells[14]) // day 15 of Tishrei 5785
    const expectedGreg = new HDate(15, month, year).greg()
    const called = (defaultProps.onDaySelect as ReturnType<typeof vi.fn>).mock.calls[0][0] as Date
    expect(called.getFullYear()).toBe(expectedGreg.getFullYear())
    expect(called.getMonth()).toBe(expectedGreg.getMonth())
    expect(called.getDate()).toBe(expectedGreg.getDate())
  })

  it('does not fire onDaySelect for empty (padding) cells', () => {
    const { container } = render(<MonthView {...defaultProps} />)
    const emptyCells = container.querySelectorAll('.cal-cell--empty')
    for (const cell of emptyCells) {
      fireEvent.click(cell)
    }
    expect(defaultProps.onDaySelect).not.toHaveBeenCalled()
  })
})
