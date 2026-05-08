import { describe, it, expect } from 'vitest'
import { HDate, months } from '@hebcal/core'
import {
  getMonthName,
  getYearMonthOrder,
  navigateMonth,
  getWeekStart,
  buildMonthCells,
  isSameHDate,
  isSameDayGreg,
} from './hebrewCalendar'

// 5784 is a Hebrew leap year (5784 mod 19 = 8, which is a leap position)
const LEAP_YEAR = 5784
const NON_LEAP_YEAR = 5785

describe('getMonthName', () => {
  it('returns "Adar" for ADAR_I in a non-leap year', () => {
    expect(getMonthName(months.ADAR_I, NON_LEAP_YEAR)).toBe('Adar')
  })

  it('returns "Adar I" for ADAR_I in a leap year', () => {
    expect(getMonthName(months.ADAR_I, LEAP_YEAR)).toBe('Adar I')
  })

  it('returns "Adar II" for ADAR_II', () => {
    expect(getMonthName(months.ADAR_II, LEAP_YEAR)).toBe('Adar II')
  })

  it('returns correct names for all standard months', () => {
    const cases: [number, string][] = [
      [months.TISHREI, 'Tishrei'],
      [months.CHESHVAN, 'Cheshvan'],
      [months.KISLEV, 'Kislev'],
      [months.TEVET, 'Tevet'],
      [months.SHVAT, 'Shevat'],
      [months.NISAN, 'Nisan'],
      [months.IYYAR, 'Iyyar'],
      [months.SIVAN, 'Sivan'],
      [months.TAMUZ, 'Tammuz'],
      [months.AV, 'Av'],
      [months.ELUL, 'Elul'],
    ]
    for (const [m, name] of cases) {
      expect(getMonthName(m, NON_LEAP_YEAR)).toBe(name)
    }
  })
})

describe('getYearMonthOrder', () => {
  it('returns 12 months for a non-leap year', () => {
    expect(getYearMonthOrder(NON_LEAP_YEAR)).toHaveLength(12)
  })

  it('returns 13 months for a leap year', () => {
    expect(getYearMonthOrder(LEAP_YEAR)).toHaveLength(13)
  })

  it('starts with Tishrei', () => {
    expect(getYearMonthOrder(NON_LEAP_YEAR)[0]).toBe(months.TISHREI)
  })

  it('ends with Elul', () => {
    const order = getYearMonthOrder(NON_LEAP_YEAR)
    expect(order[order.length - 1]).toBe(months.ELUL)
  })

  it('includes both ADAR_I and ADAR_II in a leap year', () => {
    const order = getYearMonthOrder(LEAP_YEAR)
    expect(order).toContain(months.ADAR_I)
    expect(order).toContain(months.ADAR_II)
  })

  it('does not include ADAR_II in a non-leap year', () => {
    expect(getYearMonthOrder(NON_LEAP_YEAR)).not.toContain(months.ADAR_II)
  })

  it('contains each month exactly once', () => {
    const order = getYearMonthOrder(NON_LEAP_YEAR)
    expect(new Set(order).size).toBe(order.length)
  })
})

describe('navigateMonth', () => {
  it('moves forward within the same year', () => {
    expect(navigateMonth(months.TISHREI, NON_LEAP_YEAR, 1)).toEqual({
      month: months.CHESHVAN,
      year: NON_LEAP_YEAR,
    })
  })

  it('moves backward within the same year', () => {
    expect(navigateMonth(months.CHESHVAN, NON_LEAP_YEAR, -1)).toEqual({
      month: months.TISHREI,
      year: NON_LEAP_YEAR,
    })
  })

  it('rolls Elul forward to Tishrei of the next year', () => {
    expect(navigateMonth(months.ELUL, NON_LEAP_YEAR, 1)).toEqual({
      month: months.TISHREI,
      year: NON_LEAP_YEAR + 1,
    })
  })

  it('rolls Tishrei backward to Elul of the previous year', () => {
    expect(navigateMonth(months.TISHREI, NON_LEAP_YEAR, -1)).toEqual({
      month: months.ELUL,
      year: NON_LEAP_YEAR - 1,
    })
  })

  it('handles the leap-year Adar boundary correctly', () => {
    // In a leap year, Adar I is followed by Adar II
    const result = navigateMonth(months.ADAR_I, LEAP_YEAR, 1)
    expect(result).toEqual({ month: months.ADAR_II, year: LEAP_YEAR })
  })
})

describe('getWeekStart', () => {
  it('returns Sunday (day 0) for any input date', () => {
    // Jan 10 2024 is a Wednesday
    const wednesday = new Date(2024, 0, 10)
    expect(getWeekStart(wednesday).getDay()).toBe(0)
  })

  it('returns the same day when input is already Sunday', () => {
    // Jan 7 2024 is a Sunday
    const sunday = new Date(2024, 0, 7)
    const result = getWeekStart(sunday)
    expect(result.getDay()).toBe(0)
    expect(result.getDate()).toBe(7)
  })

  it('zeroes out the time portion', () => {
    const d = new Date(2024, 0, 10, 15, 30, 45, 999)
    const result = getWeekStart(d)
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
  })
})

describe('buildMonthCells', () => {
  it('returns a length that is a multiple of 7', () => {
    for (const m of [months.TISHREI, months.NISAN, months.ELUL]) {
      const cells = buildMonthCells(m, NON_LEAP_YEAR)
      expect(cells.length % 7).toBe(0)
    }
  })

  it('contains exactly daysInMonth day numbers', () => {
    const daysInTishrei = 30 // Tishrei always has 30 days
    const cells = buildMonthCells(months.TISHREI, NON_LEAP_YEAR)
    expect(cells.filter(c => c !== null)).toHaveLength(daysInTishrei)
  })

  it('day numbers are sequential starting at 1', () => {
    const cells = buildMonthCells(months.NISAN, NON_LEAP_YEAR)
    const days = cells.filter((c): c is number => c !== null)
    expect(days[0]).toBe(1)
    for (let i = 0; i < days.length; i++) {
      expect(days[i]).toBe(i + 1)
    }
  })

  it('leading null cells match the weekday of the 1st', () => {
    const firstGreg = new HDate(1, months.TISHREI, NON_LEAP_YEAR).greg()
    const expectedOffset = firstGreg.getDay()
    const cells = buildMonthCells(months.TISHREI, NON_LEAP_YEAR)
    const leadingNulls = cells.slice(0, expectedOffset)
    expect(leadingNulls.every(c => c === null)).toBe(true)
    expect(cells[expectedOffset]).toBe(1)
  })
})

describe('isSameHDate', () => {
  it('returns true for the same date', () => {
    const hdate = new HDate(15, months.TISHREI, NON_LEAP_YEAR)
    expect(isSameHDate(hdate, 15, months.TISHREI, NON_LEAP_YEAR)).toBe(true)
  })

  it('returns false when day differs', () => {
    const hdate = new HDate(15, months.TISHREI, NON_LEAP_YEAR)
    expect(isSameHDate(hdate, 16, months.TISHREI, NON_LEAP_YEAR)).toBe(false)
  })

  it('returns false when month differs', () => {
    const hdate = new HDate(15, months.TISHREI, NON_LEAP_YEAR)
    expect(isSameHDate(hdate, 15, months.CHESHVAN, NON_LEAP_YEAR)).toBe(false)
  })

  it('returns false when year differs', () => {
    const hdate = new HDate(15, months.TISHREI, NON_LEAP_YEAR)
    expect(isSameHDate(hdate, 15, months.TISHREI, LEAP_YEAR)).toBe(false)
  })
})

describe('isSameDayGreg', () => {
  it('returns true for dates on the same calendar day regardless of time', () => {
    const a = new Date(2024, 0, 15, 9, 0)
    const b = new Date(2024, 0, 15, 17, 30)
    expect(isSameDayGreg(a, b)).toBe(true)
  })

  it('returns false for dates on different days', () => {
    const a = new Date(2024, 0, 15)
    const b = new Date(2024, 0, 16)
    expect(isSameDayGreg(a, b)).toBe(false)
  })

  it('returns false for same day in different months', () => {
    const a = new Date(2024, 0, 15)
    const b = new Date(2024, 1, 15)
    expect(isSameDayGreg(a, b)).toBe(false)
  })

  it('returns false for same day in different years', () => {
    const a = new Date(2024, 0, 15)
    const b = new Date(2025, 0, 15)
    expect(isSameDayGreg(a, b)).toBe(false)
  })
})
