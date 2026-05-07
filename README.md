# Hebrew Calendar

A calendar web application built with React, TypeScript, and Vite that uses the Hebrew (Jewish) lunisolar calendar instead of the Gregorian calendar.

---

## What it does

The app displays dates using the 12 (or 13, in leap years) Hebrew months:

**Tishrei · Cheshvan · Kislev · Tevet · Shevat · Adar (I & II in leap years) · Nisan · Iyyar · Sivan · Tammuz · Av · Elul**

Each day cell also shows its corresponding Gregorian date for reference.

### Views

| View | Description |
|------|-------------|
| **Month** | Standard calendar grid for a single Hebrew month. |
| **Year** | All months of the Hebrew year displayed as mini calendars in a grid. |
| **Week** | 7-day row showing the Hebrew date, month name, and Gregorian date for each day. |

### Navigation

- Use the **← →** arrows to move between months, years, or weeks depending on the active view.
- In **Month** or **Week** view, click the **year number** in the navigation bar to jump directly to Year view.
- In **Year** view, click any **month name** to jump directly to that month in Month view.
- Today is always highlighted with an accent color.

---

## Tech stack

| Tool | Version | Purpose |
|------|---------|---------|
| [React](https://react.dev/) | 19 | UI components and state |
| [TypeScript](https://www.typescriptlang.org/) | 6 | Static typing |
| [Vite](https://vite.dev/) | 8 | Dev server and bundler |
| [@hebcal/core](https://github.com/hebcal/hebcal-es6) | latest | Hebrew date calculations |

### Project structure

```
src/
├── components/
│   ├── MonthView.tsx     # Single-month calendar grid
│   ├── YearView.tsx      # Full-year grid of mini calendars
│   └── WeekView.tsx      # 7-day week row
├── utils/
│   └── hebrewCalendar.ts # Shared constants, helpers, and date logic
├── App.tsx               # View state, navigation, and layout
└── App.css               # All styles
```

---

## Getting started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

The dev server runs at `http://localhost:5173` by default.

---

## Hebrew calendar notes

- The Hebrew year begins in **Tishrei** (usually September/October in the Gregorian calendar).
- A **leap year** adds a 13th month — **Adar I** — before the regular **Adar II**, occurring 7 times in every 19-year cycle.
- Month lengths vary: Cheshvan and Kislev can be 29 or 30 days depending on the year type (deficient, regular, or complete).
- All calendar calculations are handled by `@hebcal/core`, a well-established JavaScript library for Hebrew date arithmetic.
