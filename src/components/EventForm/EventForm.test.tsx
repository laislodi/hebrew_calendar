import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventForm from './EventForm'
import type { CalendarEvent } from '../../types/event'

const defaultProps = {
  initialDate: new Date(2024, 0, 15),
  onSave: vi.fn(),
  onClose: vi.fn(),
}

const existingEvent: CalendarEvent = {
  id: 'evt-1',
  title: 'Existing Event',
  description: 'Some description',
  useHebrewDate: false,
  startTime: '2024-01-15T09:00',
  endTime: '2024-01-15T10:00',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('EventForm – rendering', () => {
  it('shows "New Event" heading when no event is passed', () => {
    render(<EventForm {...defaultProps} />)
    expect(screen.getByText('New Event')).toBeTruthy()
  })

  it('shows "Edit Event" heading when editing an existing event', () => {
    render(<EventForm {...defaultProps} event={existingEvent} />)
    expect(screen.getByText('Edit Event')).toBeTruthy()
  })

  it('pre-fills the title when editing', () => {
    render(<EventForm {...defaultProps} event={existingEvent} />)
    const input = screen.getByPlaceholderText('Event title') as HTMLInputElement
    expect(input.value).toBe('Existing Event')
  })

  it('pre-fills the description when editing', () => {
    render(<EventForm {...defaultProps} event={existingEvent} />)
    const textarea = screen.getByPlaceholderText('Optional description') as HTMLTextAreaElement
    expect(textarea.value).toBe('Some description')
  })

  it('shows Delete button only when onDelete is provided', () => {
    const { rerender } = render(<EventForm {...defaultProps} />)
    expect(screen.queryByText('Delete')).toBeNull()

    rerender(<EventForm {...defaultProps} onDelete={vi.fn()} />)
    expect(screen.getByText('Delete')).toBeTruthy()
  })
})

describe('EventForm – form submission', () => {
  it('calls onSave with trimmed title and description', async () => {
    const user = userEvent.setup()
    render(<EventForm {...defaultProps} />)
    await user.type(screen.getByPlaceholderText('Event title'), '  My Event  ')
    await user.type(screen.getByPlaceholderText('Optional description'), '  Notes  ')
    await user.click(screen.getByText('Save'))
    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'My Event', description: 'Notes' })
    )
  })

  it('does not call onSave when the title is blank', async () => {
    const user = userEvent.setup()
    render(<EventForm {...defaultProps} />)
    await user.click(screen.getByText('Save'))
    expect(defaultProps.onSave).not.toHaveBeenCalled()
  })

  it('calls onClose after a successful save', async () => {
    const user = userEvent.setup()
    render(<EventForm {...defaultProps} />)
    await user.type(screen.getByPlaceholderText('Event title'), 'My Event')
    await user.click(screen.getByText('Save'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('includes startTime and endTime in the saved payload', async () => {
    const user = userEvent.setup()
    render(<EventForm {...defaultProps} event={existingEvent} />)
    await user.click(screen.getByText('Save'))
    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        startTime: existingEvent.startTime,
        endTime: existingEvent.endTime,
      })
    )
  })
})

describe('EventForm – cancel and close', () => {
  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<EventForm {...defaultProps} />)
    await user.click(screen.getByText('Cancel'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('calls onClose when the ✕ button is clicked', async () => {
    const user = userEvent.setup()
    render(<EventForm {...defaultProps} />)
    await user.click(screen.getByText('✕'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })
})

describe('EventForm – delete', () => {
  it('calls onDelete and onClose when Delete is clicked', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    render(<EventForm {...defaultProps} onDelete={onDelete} />)
    await user.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalled()
    expect(defaultProps.onClose).toHaveBeenCalled()
  })
})

describe('EventForm – date picker mode', () => {
  it('shows Gregorian month options by default', () => {
    render(<EventForm {...defaultProps} />)
    // Two GregorianDatePickers (From + To) each containing "January" as an option
    const januaryOptions = screen.getAllByRole('option', { name: 'January' })
    expect(januaryOptions.length).toBeGreaterThanOrEqual(1)
  })

  it('switches to Hebrew month options when "Use Hebrew dates" is checked', async () => {
    const user = userEvent.setup()
    render(<EventForm {...defaultProps} />)
    await user.click(screen.getByRole('checkbox'))
    const tishreiOptions = screen.getAllByRole('option', { name: 'Tishrei' })
    expect(tishreiOptions.length).toBeGreaterThanOrEqual(1)
  })

  it('saves useHebrewDate: false in Gregorian mode', async () => {
    const user = userEvent.setup()
    render(<EventForm {...defaultProps} />)
    await user.type(screen.getByPlaceholderText('Event title'), 'Test')
    await user.click(screen.getByText('Save'))
    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ useHebrewDate: false })
    )
  })

  it('saves useHebrewDate: true in Hebrew mode', async () => {
    const user = userEvent.setup()
    render(<EventForm {...defaultProps} />)
    await user.type(screen.getByPlaceholderText('Event title'), 'Test')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByText('Save'))
    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ useHebrewDate: true })
    )
  })

  it('opens in Hebrew mode when event.useHebrewDate is true', () => {
    render(<EventForm {...defaultProps} event={{ ...existingEvent, useHebrewDate: true }} />)
    expect(screen.getAllByRole('option', { name: 'Tishrei' }).length).toBeGreaterThanOrEqual(1)
  })
})

// initialDate = Jan 15, 2024  →  default startTime '2024-01-15T09:00', endTime '2024-01-15T10:00'
// isoToGregorian gives: year=2024, month=0 (Jan), day=15, time='09:00'

describe('EventForm – GregorianDatePicker interactions', () => {
  it('updates startTime when the From month changes', async () => {
    const user = userEvent.setup()
    render(<EventForm {...defaultProps} />)
    const [fromMonth] = screen.getAllByRole('combobox')
    fireEvent.change(fromMonth, { target: { value: '1' } }) // February
    await user.type(screen.getByPlaceholderText('Event title'), 'Test')
    await user.click(screen.getByText('Save'))
    const { startTime } = (defaultProps.onSave as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(startTime).toMatch(/^2024-02-/)
  })

  it('updates startTime when the From day changes', async () => {
    const user = userEvent.setup()
    render(<EventForm {...defaultProps} />)
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[1], { target: { value: '20' } }) // day 20
    await user.type(screen.getByPlaceholderText('Event title'), 'Test')
    await user.click(screen.getByText('Save'))
    const { startTime } = (defaultProps.onSave as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(startTime).toMatch(/^2024-01-20/)
  })

  it('updates startTime when the From year changes', async () => {
    const user = userEvent.setup()
    const { container } = render(<EventForm {...defaultProps} />)
    const [fromYear] = container.querySelectorAll('input[type="number"]')
    fireEvent.change(fromYear, { target: { value: '2025' } })
    await user.type(screen.getByPlaceholderText('Event title'), 'Test')
    await user.click(screen.getByText('Save'))
    const { startTime } = (defaultProps.onSave as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(startTime).toMatch(/^2025-/)
  })

  it('updates startTime when the From time changes', async () => {
    const user = userEvent.setup()
    const { container } = render(<EventForm {...defaultProps} />)
    const [fromTime] = container.querySelectorAll('input[type="time"]')
    fireEvent.change(fromTime, { target: { value: '14:30' } })
    await user.type(screen.getByPlaceholderText('Event title'), 'Test')
    await user.click(screen.getByText('Save'))
    const { startTime } = (defaultProps.onSave as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(startTime).toMatch(/T14:30$/)
  })

  it('clamps the day when changing to a shorter month', async () => {
    // Start with day 31 (March 31 → day 31 in the picker)
    const event31: CalendarEvent = { ...existingEvent, startTime: '2024-03-31T09:00', endTime: '2024-03-31T10:00' }
    const user = userEvent.setup()
    render(<EventForm {...defaultProps} event={event31} />)
    const [fromMonth] = screen.getAllByRole('combobox')
    fireEvent.change(fromMonth, { target: { value: '1' } }) // February (2024 is a leap year → 29 days)
    await user.click(screen.getByText('Save'))
    const { startTime } = (defaultProps.onSave as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(startTime).toMatch(/^2024-02-29/) // clamped to Feb 29
  })

  it('does not update startTime when year is set to 0', async () => {
    const user = userEvent.setup()
    const { container } = render(<EventForm {...defaultProps} />)
    const [fromYear] = container.querySelectorAll('input[type="number"]')
    fireEvent.change(fromYear, { target: { value: '0' } }) // triggers guard: !y → return
    await user.type(screen.getByPlaceholderText('Event title'), 'Test')
    await user.click(screen.getByText('Save'))
    const { startTime } = (defaultProps.onSave as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(startTime).toMatch(/^2024-01-15/) // unchanged
  })
})

// isoToHebrew('2024-01-15T09:00') → ~5 Shevat 5784 (year=5784, month=SHVAT=11, day=5)
// isoToHebrew('2024-03-15T09:00') → ~5 Adar II 5784 (leap year, month=ADAR_II=13)

describe('EventForm – HebrewDatePicker interactions', () => {
  async function switchToHebrew(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('checkbox'))
  }

  it('updates startTime when the From month changes in Hebrew mode', async () => {
    const user = userEvent.setup()
    render(<EventForm {...defaultProps} />)
    await switchToHebrew(user)
    const [fromMonth] = screen.getAllByRole('combobox')
    // change from Shevat (11) to Tishrei (7)
    fireEvent.change(fromMonth, { target: { value: '7' } })
    await user.type(screen.getByPlaceholderText('Event title'), 'Test')
    await user.click(screen.getByText('Save'))
    const { startTime } = (defaultProps.onSave as ReturnType<typeof vi.fn>).mock.calls[0][0]
    // Tishrei 5784 is in Sept/Oct 2023 — date must have changed
    expect(startTime).not.toMatch(/^2024-01-15/)
  })

  it('updates startTime when the From day changes in Hebrew mode', async () => {
    const user = userEvent.setup()
    render(<EventForm {...defaultProps} />)
    await switchToHebrew(user)
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[1], { target: { value: '10' } }) // day 10
    await user.type(screen.getByPlaceholderText('Event title'), 'Test')
    await user.click(screen.getByText('Save'))
    const { startTime } = (defaultProps.onSave as ReturnType<typeof vi.fn>).mock.calls[0][0]
    // Day changed from 5 → 10 Shevat 5784, still Jan 2024 but different day
    expect(startTime).not.toBe('2024-01-15T09:00')
  })

  it('updates startTime time portion when the From time changes in Hebrew mode', async () => {
    const user = userEvent.setup()
    const { container } = render(<EventForm {...defaultProps} />)
    await switchToHebrew(user)
    const [fromTime] = container.querySelectorAll('input[type="time"]')
    fireEvent.change(fromTime, { target: { value: '18:00' } })
    await user.type(screen.getByPlaceholderText('Event title'), 'Test')
    await user.click(screen.getByText('Save'))
    const { startTime } = (defaultProps.onSave as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(startTime).toMatch(/T18:00$/)
  })

  it('updates startTime when the From year changes in Hebrew mode', async () => {
    const user = userEvent.setup()
    const { container } = render(<EventForm {...defaultProps} />)
    await switchToHebrew(user)
    const [fromYear] = container.querySelectorAll('input[type="number"]')
    fireEvent.change(fromYear, { target: { value: '5783' } })
    await user.type(screen.getByPlaceholderText('Event title'), 'Test')
    await user.click(screen.getByText('Save'))
    const { startTime } = (defaultProps.onSave as ReturnType<typeof vi.fn>).mock.calls[0][0]
    // Year changed: 5783 maps to 2022/2023 Gregorian
    expect(startTime).toMatch(/^202[23]-/)
  })

  it('does not update startTime when year is 0 in Hebrew mode', async () => {
    const user = userEvent.setup()
    const { container } = render(<EventForm {...defaultProps} />)
    await switchToHebrew(user)
    const [fromYear] = container.querySelectorAll('input[type="number"]')
    fireEvent.change(fromYear, { target: { value: '0' } }) // triggers guard
    await user.type(screen.getByPlaceholderText('Event title'), 'Test')
    await user.click(screen.getByText('Save'))
    const { startTime } = (defaultProps.onSave as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(startTime).toBe('2024-01-15T09:00') // unchanged
  })

  it('clamps to a valid month when year changes from leap to non-leap', async () => {
    // March 15, 2024 ≈ 5 Adar II 5784 (leap year — ADAR_II is valid)
    const leapEvent: CalendarEvent = { ...existingEvent, startTime: '2024-03-15T09:00', endTime: '2024-03-15T10:00' }
    const user = userEvent.setup()
    const { container } = render(<EventForm {...defaultProps} event={leapEvent} />)
    await switchToHebrew(user)
    // Change year from 5784 (leap) to 5785 (non-leap) — ADAR_II is not a valid month in 5785
    const [fromYear] = container.querySelectorAll('input[type="number"]')
    fireEvent.change(fromYear, { target: { value: '5785' } })
    await user.click(screen.getByText('Save'))
    // Should not throw and should save a valid ISO date
    const { startTime } = (defaultProps.onSave as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(startTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })
})

describe('EventForm – overlay backdrop', () => {
  it('calls onClose when the backdrop (outside the form box) is clicked', () => {
    const { container } = render(<EventForm {...defaultProps} />)
    const overlay = container.querySelector('.form-overlay')!
    fireEvent.click(overlay)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })
})
