import { vi, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Clean up rendered components after every test
afterEach(cleanup)

// Deterministic UUIDs so tests don't depend on random values
let _counter = 0
vi.stubGlobal('crypto', {
  randomUUID: () => `test-uuid-${++_counter}`,
})
