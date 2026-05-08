import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEvents } from './useEvents'

const STORAGE_KEY = 'hebrew-calendar-events'

const baseEvent = {
  title: 'Test Event',
  description: 'Test description',
  useHebrewDate: false,
  startTime: '2024-01-15T09:00',
  endTime: '2024-01-15T10:00',
}

beforeEach(() => {
  localStorage.clear()
})

describe('useEvents – addEvent', () => {
  it('adds an event with a generated ID', () => {
    const { result } = renderHook(() => useEvents())
    act(() => { result.current.addEvent(baseEvent) })
    expect(result.current.events).toHaveLength(1)
    expect(result.current.events[0].id).toBeTruthy()
    expect(result.current.events[0].title).toBe('Test Event')
  })

  it('generates a unique ID for each event', () => {
    const { result } = renderHook(() => useEvents())
    act(() => { result.current.addEvent(baseEvent) })
    act(() => { result.current.addEvent({ ...baseEvent, title: 'Second' }) })
    const ids = result.current.events.map(e => e.id)
    expect(new Set(ids).size).toBe(2)
  })

  it('preserves all event fields', () => {
    const { result } = renderHook(() => useEvents())
    act(() => { result.current.addEvent(baseEvent) })
    const saved = result.current.events[0]
    expect(saved.title).toBe(baseEvent.title)
    expect(saved.description).toBe(baseEvent.description)
    expect(saved.useHebrewDate).toBe(baseEvent.useHebrewDate)
    expect(saved.startTime).toBe(baseEvent.startTime)
    expect(saved.endTime).toBe(baseEvent.endTime)
  })
})

describe('useEvents – updateEvent', () => {
  it('updates only the matching event', () => {
    const { result } = renderHook(() => useEvents())
    act(() => { result.current.addEvent(baseEvent) })
    const id = result.current.events[0].id
    act(() => { result.current.updateEvent(id, { title: 'Updated Title' }) })
    expect(result.current.events[0].title).toBe('Updated Title')
  })

  it('does not modify other events', () => {
    const { result } = renderHook(() => useEvents())
    act(() => { result.current.addEvent(baseEvent) })
    act(() => { result.current.addEvent({ ...baseEvent, title: 'Other' }) })
    const firstId = result.current.events[0].id
    act(() => { result.current.updateEvent(firstId, { title: 'Changed' }) })
    const other = result.current.events.find(e => e.id !== firstId)
    expect(other?.title).toBe('Other')
  })

  it('can update multiple fields at once', () => {
    const { result } = renderHook(() => useEvents())
    act(() => { result.current.addEvent(baseEvent) })
    const id = result.current.events[0].id
    act(() => {
      result.current.updateEvent(id, {
        title: 'New Title',
        description: 'New Desc',
        useHebrewDate: true,
      })
    })
    const updated = result.current.events[0]
    expect(updated.title).toBe('New Title')
    expect(updated.description).toBe('New Desc')
    expect(updated.useHebrewDate).toBe(true)
  })
})

describe('useEvents – deleteEvent', () => {
  it('removes the event with the matching ID', () => {
    const { result } = renderHook(() => useEvents())
    act(() => { result.current.addEvent(baseEvent) })
    const id = result.current.events[0].id
    act(() => { result.current.deleteEvent(id) })
    expect(result.current.events).toHaveLength(0)
  })

  it('leaves other events intact', () => {
    const { result } = renderHook(() => useEvents())
    act(() => { result.current.addEvent(baseEvent) })
    act(() => { result.current.addEvent({ ...baseEvent, title: 'Keep This' }) })
    const idToDelete = result.current.events[0].id
    act(() => { result.current.deleteEvent(idToDelete) })
    expect(result.current.events).toHaveLength(1)
    expect(result.current.events[0].title).toBe('Keep This')
  })

  it('is a no-op when the ID does not exist', () => {
    const { result } = renderHook(() => useEvents())
    act(() => { result.current.addEvent(baseEvent) })
    act(() => { result.current.deleteEvent('nonexistent-id') })
    expect(result.current.events).toHaveLength(1)
  })
})

describe('useEvents – getEventsForDay', () => {
  it('returns events whose startTime matches the given date', () => {
    const { result } = renderHook(() => useEvents())
    act(() => { result.current.addEvent(baseEvent) })
    const day = new Date(2024, 0, 15)
    expect(result.current.getEventsForDay(day)).toHaveLength(1)
  })

  it('excludes events on a different date', () => {
    const { result } = renderHook(() => useEvents())
    act(() => { result.current.addEvent(baseEvent) })
    const different = new Date(2024, 0, 16)
    expect(result.current.getEventsForDay(different)).toHaveLength(0)
  })

  it('sorts events by startTime ascending', () => {
    const { result } = renderHook(() => useEvents())
    act(() => {
      result.current.addEvent({ ...baseEvent, startTime: '2024-01-15T14:00', endTime: '2024-01-15T15:00' })
    })
    act(() => {
      result.current.addEvent({ ...baseEvent, startTime: '2024-01-15T08:00', endTime: '2024-01-15T09:00' })
    })
    const events = result.current.getEventsForDay(new Date(2024, 0, 15))
    expect(events[0].startTime).toBe('2024-01-15T08:00')
    expect(events[1].startTime).toBe('2024-01-15T14:00')
  })

  it('returns an empty array when no events exist for the day', () => {
    const { result } = renderHook(() => useEvents())
    expect(result.current.getEventsForDay(new Date(2024, 0, 15))).toEqual([])
  })
})

describe('useEvents – localStorage persistence', () => {
  it('persists events to localStorage after adding', () => {
    const { result } = renderHook(() => useEvents())
    act(() => { result.current.addEvent(baseEvent) })
    const stored: typeof result.current.events = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]'
    )
    expect(stored).toHaveLength(1)
    expect(stored[0].title).toBe('Test Event')
  })

  it('loads existing events from localStorage on mount', () => {
    const seed = [{ ...baseEvent, id: 'seeded-id' }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    const { result } = renderHook(() => useEvents())
    expect(result.current.events).toHaveLength(1)
    expect(result.current.events[0].id).toBe('seeded-id')
  })

  it('reflects deletions in localStorage', () => {
    const { result } = renderHook(() => useEvents())
    act(() => { result.current.addEvent(baseEvent) })
    const id = result.current.events[0].id
    act(() => { result.current.deleteEvent(id) })
    const stored: unknown[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    expect(stored).toHaveLength(0)
  })

  it('returns an empty array when localStorage contains invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json')
    const { result } = renderHook(() => useEvents())
    expect(result.current.events).toEqual([])
  })
})
