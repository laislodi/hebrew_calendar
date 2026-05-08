import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HDate } from '@hebcal/core'
import EventPanel from './EventPanel'
import type { CalendarEvent } from '../../types/event'
import { getMonthName } from '../../utils/hebrewCalendar'

// Jan 15, 2024 (Monday)
const selectedDay = new Date(2024, 0, 15)

const mockEvent: CalendarEvent = {
  id: 'evt-1',
  title: 'Team Meeting',
  description: 'Weekly sync',
  useHebrewDate: false,
  startTime: '2024-01-15T09:00',
  endTime: '2024-01-15T10:30',
}

const defaultProps = {
  selectedDay,
  events: [] as CalendarEvent[],
  onAddEvent: vi.fn(),
  onUpdateEvent: vi.fn(),
  onDeleteEvent: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('EventPanel – date display', () => {
  it('shows the Hebrew date for the selected day', () => {
    render(<EventPanel {...defaultProps} />)
    const hdate = new HDate(selectedDay)
    const expected = `${getMonthName(hdate.getMonth(), hdate.getFullYear())} ${hdate.getDate()}, ${hdate.getFullYear()}`
    expect(screen.getByText(expected)).toBeTruthy()
  })

  it('shows the Gregorian date for the selected day', () => {
    render(<EventPanel {...defaultProps} />)
    expect(screen.getByText('Monday, January 15, 2024')).toBeTruthy()
  })
})

describe('EventPanel – event list', () => {
  it('shows "No events for this day" when the list is empty', () => {
    render(<EventPanel {...defaultProps} />)
    expect(screen.getByText('No events for this day')).toBeTruthy()
  })

  it('shows event title', () => {
    render(<EventPanel {...defaultProps} events={[mockEvent]} />)
    expect(screen.getByText('Team Meeting')).toBeTruthy()
  })

  it('shows formatted start–end time', () => {
    render(<EventPanel {...defaultProps} events={[mockEvent]} />)
    expect(screen.getByText('9:00 AM – 10:30 AM')).toBeTruthy()
  })

  it('shows event description when present', () => {
    render(<EventPanel {...defaultProps} events={[mockEvent]} />)
    expect(screen.getByText('Weekly sync')).toBeTruthy()
  })

  it('hides description when it is empty', () => {
    render(<EventPanel {...defaultProps} events={[{ ...mockEvent, description: '' }]} />)
    expect(screen.queryByText('Weekly sync')).toBeNull()
  })

  it('renders multiple events', () => {
    const second: CalendarEvent = { ...mockEvent, id: 'evt-2', title: 'Lunch', startTime: '2024-01-15T12:00', endTime: '2024-01-15T13:00' }
    render(<EventPanel {...defaultProps} events={[mockEvent, second]} />)
    expect(screen.getByText('Team Meeting')).toBeTruthy()
    expect(screen.getByText('Lunch')).toBeTruthy()
  })
})

describe('EventPanel – time formatting', () => {
  it('formats noon as 12:00 PM', () => {
    const event = { ...mockEvent, startTime: '2024-01-15T12:00', endTime: '2024-01-15T13:00' }
    render(<EventPanel {...defaultProps} events={[event]} />)
    expect(screen.getByText('12:00 PM – 1:00 PM')).toBeTruthy()
  })

  it('formats midnight as 12:00 AM', () => {
    const event = { ...mockEvent, startTime: '2024-01-15T00:00', endTime: '2024-01-15T01:00' }
    render(<EventPanel {...defaultProps} events={[event]} />)
    expect(screen.getByText('12:00 AM – 1:00 AM')).toBeTruthy()
  })

  it('pads minutes correctly', () => {
    const event = { ...mockEvent, startTime: '2024-01-15T14:05', endTime: '2024-01-15T15:05' }
    render(<EventPanel {...defaultProps} events={[event]} />)
    expect(screen.getByText('2:05 PM – 3:05 PM')).toBeTruthy()
  })
})

describe('EventPanel – close button', () => {
  it('shows close button when onClose is provided', () => {
    render(<EventPanel {...defaultProps} onClose={vi.fn()} />)
    expect(screen.getByText('✕')).toBeTruthy()
  })

  it('hides close button when onClose is not provided', () => {
    render(<EventPanel {...defaultProps} />)
    expect(screen.queryByText('✕')).toBeNull()
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<EventPanel {...defaultProps} onClose={onClose} />)
    await user.click(screen.getByText('✕'))
    expect(onClose).toHaveBeenCalled()
  })
})

describe('EventPanel – add event flow', () => {
  it('opens the form when "+ Add Event" is clicked', async () => {
    const user = userEvent.setup()
    render(<EventPanel {...defaultProps} />)
    await user.click(screen.getByText('+ Add Event'))
    expect(screen.getByPlaceholderText('Event title')).toBeTruthy()
  })

  it('calls onAddEvent with the submitted data', async () => {
    const user = userEvent.setup()
    render(<EventPanel {...defaultProps} />)
    await user.click(screen.getByText('+ Add Event'))
    await user.type(screen.getByPlaceholderText('Event title'), 'New Event')
    await user.click(screen.getByText('Save'))
    expect(defaultProps.onAddEvent).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Event' })
    )
    expect(defaultProps.onUpdateEvent).not.toHaveBeenCalled()
  })

  it('closes the form after saving a new event', async () => {
    const user = userEvent.setup()
    render(<EventPanel {...defaultProps} />)
    await user.click(screen.getByText('+ Add Event'))
    await user.type(screen.getByPlaceholderText('Event title'), 'New Event')
    await user.click(screen.getByText('Save'))
    expect(screen.queryByPlaceholderText('Event title')).toBeNull()
  })
})

describe('EventPanel – edit event flow', () => {
  it('opens the form with existing data when clicking an event', async () => {
    const user = userEvent.setup()
    render(<EventPanel {...defaultProps} events={[mockEvent]} />)
    await user.click(screen.getByText('Team Meeting'))
    const input = screen.getByPlaceholderText('Event title') as HTMLInputElement
    expect(input.value).toBe('Team Meeting')
  })

  it('calls onUpdateEvent (not onAddEvent) when saving an edited event', async () => {
    const user = userEvent.setup()
    render(<EventPanel {...defaultProps} events={[mockEvent]} />)
    await user.click(screen.getByText('Team Meeting'))
    const input = screen.getByPlaceholderText('Event title') as HTMLInputElement
    await user.clear(input)
    await user.type(input, 'Updated Meeting')
    await user.click(screen.getByText('Save'))
    expect(defaultProps.onUpdateEvent).toHaveBeenCalledWith(
      'evt-1',
      expect.objectContaining({ title: 'Updated Meeting' })
    )
    expect(defaultProps.onAddEvent).not.toHaveBeenCalled()
  })

  it('shows the Delete button when editing an existing event', async () => {
    const user = userEvent.setup()
    render(<EventPanel {...defaultProps} events={[mockEvent]} />)
    await user.click(screen.getByText('Team Meeting'))
    expect(screen.getByText('Delete')).toBeTruthy()
  })

  it('calls onDeleteEvent with the event ID when Delete is clicked', async () => {
    const user = userEvent.setup()
    render(<EventPanel {...defaultProps} events={[mockEvent]} />)
    await user.click(screen.getByText('Team Meeting'))
    await user.click(screen.getByText('Delete'))
    expect(defaultProps.onDeleteEvent).toHaveBeenCalledWith('evt-1')
  })
})
