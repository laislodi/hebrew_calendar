import { HDate, months } from '@hebcal/core'

export type View = 'year' | 'month' | 'week'

export const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const WEEK_DAYS_MINI = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const MONTH_NAMES: Record<number, string> = {
  [months.TISHREI]: 'Tishrei',
  [months.CHESHVAN]: 'Cheshvan',
  [months.KISLEV]: 'Kislev',
  [months.TEVET]: 'Tevet',
  [months.SHVAT]: 'Shevat',
  [months.ADAR_I]: 'Adar',
  [months.ADAR_II]: 'Adar II',
  [months.NISAN]: 'Nisan',
  [months.IYYAR]: 'Iyyar',
  [months.SIVAN]: 'Sivan',
  [months.TAMUZ]: 'Tammuz',
  [months.AV]: 'Av',
  [months.ELUL]: 'Elul',
}

export function getMonthName(month: number, year: number): string {
  if (month === months.ADAR_I && HDate.isLeapYear(year)) return 'Adar I'
  return MONTH_NAMES[month] ?? ''
}

export function getYearMonthOrder(year: number): number[] {
  const isLeap = HDate.isLeapYear(year)
  return [
    months.TISHREI, months.CHESHVAN, months.KISLEV, months.TEVET,
    months.SHVAT,
    ...(isLeap ? [months.ADAR_I, months.ADAR_II] : [months.ADAR_I]),
    months.NISAN, months.IYYAR, months.SIVAN, months.TAMUZ, months.AV, months.ELUL,
  ]
}

export function navigateMonth(month: number, year: number, dir: 1 | -1): { month: number; year: number } {
  const order = getYearMonthOrder(year)
  const nextIdx = order.indexOf(month) + dir
  if (nextIdx < 0) {
    const prevYear = year - 1
    const prevOrder = getYearMonthOrder(prevYear)
    return { month: prevOrder[prevOrder.length - 1], year: prevYear }
  }
  if (nextIdx >= order.length) {
    return { month: months.TISHREI, year: year + 1 }
  }
  return { month: order[nextIdx], year }
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

export function buildMonthCells(month: number, year: number): (number | null)[] {
  const daysInMonth = HDate.daysInMonth(month, year)
  const startDow = new HDate(1, month, year).greg().getDay()
  const cells: (number | null)[] = [
    ...Array<null>(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function isSameHDate(a: HDate, day: number, month: number, year: number): boolean {
  return a.getDate() === day && a.getMonth() === month && a.getFullYear() === year
}
