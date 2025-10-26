# Copilot Instructions for GUNDOM Ballistics Calculator

## Project Overview

GUNDOM is a professional-grade external ballistics calculator for long-range shooting sports and hunting. It provides precision trajectory solutions accounting for bullet drop, wind drift, atmospheric conditions, and advanced effects like Coriolis and spin drift.

**Tech Stack:**
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn UI v4 (Radix UI primitives)
- **Icons:** Phosphor Icons
- **State Management:** React Hooks + useKV persistence (@github/spark/hooks)
- **Charts:** Recharts (trajectory visualization)
- **Animations:** Framer Motion

## Project Structure

```
src/
├── components/
│   ├── ui/              # Shadcn UI components (DO NOT modify unless necessary)
│   ├── ProfilesTab.tsx  # Rifle/cartridge configuration
│   ├── BallisticsTab.tsx # Ballistic parameters
│   ├── ReticleTab.tsx   # Reticle and scope settings
│   └── TrajectoryTab.tsx # Results table and visualization
├── lib/
│   ├── ballistics.ts    # Core ballistics calculations
│   ├── types.ts         # TypeScript type definitions
│   ├── profiles.ts      # Profile validation and management
│   └── utils.ts         # Utility functions
├── hooks/
│   └── use-mobile.ts    # Responsive design hook
├── App.tsx              # Main application component
├── index.css            # Global styles and theme variables
└── main.tsx             # Application entry point
```

## Development Commands

- `npm run dev` - Start development server (default: http://localhost:5173, may vary based on port availability)
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (requires dependencies installed)

## Code Style and Conventions

### TypeScript
- Use strict TypeScript with null checks enabled
- Define all types in `src/lib/types.ts`
- Use interfaces for data structures
- Prefer `type` for unions and intersections
- Always type function parameters and return values
- Use the `@/` path alias for imports (e.g., `import { Button } from '@/components/ui/button'`)

### React Patterns
- Use functional components with hooks exclusively
- Use `useState` for local component state
- Use `useKV` from `@github/spark/hooks` for persistent data that should survive page reloads
- Follow the existing component structure in tab components
- Use React 19 patterns (no deprecated lifecycle methods)

### Component Structure
```typescript
import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Component } from '@/components/ui/component'
import type { DataType } from '@/lib/types'

export default function MyComponent() {
  const [localState, setLocalState] = useState<string>('')
  const [persistentData, setPersistentData] = useKV<DataType>('key', defaultValue)
  
  // Event handlers
  const handleAction = () => {
    // Implementation
  }
  
  return (
    <div className="space-y-4">
      {/* Component JSX */}
    </div>
  )
}
```

### Styling
- Use Tailwind CSS utility classes exclusively
- Follow the Tailwind v4 syntax (using `@tailwindcss/vite` plugin)
- Tailwind v4 uses CSS-first configuration with `@import "tailwindcss"` instead of JS config
- Use theme variables defined in `src/index.css` for colors
- Use the `cn()` utility from `@/lib/utils` for conditional classes
- Maintain responsive design with mobile-first approach
- Common spacing: `space-y-4`, `gap-4`, `p-4`, `px-6`, `py-3`
- Common layouts: `flex`, `grid`, `grid-cols-2`, `items-center`, `justify-between`

### Theme Variables (from index.css)
```css
--background: oklch(0.09 0 0);      /* Dark background */
--foreground: oklch(0.95 0 0);      /* Light text */
--primary: oklch(0.45 0.15 250);    /* Blue accent */
--accent: oklch(0.75 0.15 200);     /* Cyan highlights */
```

### State Management
- Use `useKV` (from `@github/spark/hooks`) for data that must persist across sessions:
  - Ballistic data (`ballistic-data`)
  - User profiles
  - Settings
  - Note: `useKV` is a Spark framework hook for key-value storage with browser persistence
- Use `useState` for UI-only state:
  - Active tab
  - Temporary form inputs
  - Modal open/closed state
  
### Icons
- Use Phosphor Icons from `@phosphor-icons/react`
- Import specific icons: `import { Calculator, Export, Target } from '@phosphor-icons/react'`
- Standard size: `size={24}` for normal icons
- Use `weight="regular"` or `weight="bold"` as appropriate

### Toast Notifications
- Import from `sonner`: `import { toast } from 'sonner'`
- Use for user feedback:
  - `toast.success('Success message')`
  - `toast.error('Error message')`
  - `toast.warning('Warning message', { duration: 5000 })`

## Ballistics Calculations

### Core Principles
- All ballistic calculations are in `src/lib/ballistics.ts`
- Validated against industry-standard solvers (±0.1 MOA at 1000 yards)
- Use SI units internally, convert for display
- Account for:
  - Bullet drop (gravity)
  - Wind drift (crosswind/headwind decomposition)
  - Atmospheric effects (air density)
  - Coriolis effect (optional)
  - Spin drift (optional)
  - Gyroscopic drift

### Calculation Flow
1. Validate input data (use `validateBallisticData` from `src/lib/profiles.ts`)
2. Calculate trajectory using `calculateTrajectory(ballisticData)`
3. Returns `TrajectoryResult[]` with range-specific data
4. Display in table with unit conversion (MOA/MIL/CM/CLICKS)

### Important Validation Rules
(Defined in `src/lib/profiles.ts` - validateBallisticData function)
- Muzzle velocity: 500-4500 fps
- Ballistic coefficient: 0.1-1.0
- Bullet mass: > 0 grains (no upper limit enforced)
- Zero distance: > 0 yards (no upper limit enforced)
- Scope height: > 0 inches (no upper limit enforced)
- Temperature: -40°C to 60°C
- Altitude: 0-5000m

## Adding New Features

### New Ballistic Parameters
1. Add field to `BallisticData` interface in `src/lib/types.ts`
2. Update default values in `App.tsx` useKV initialization
3. Add input field in appropriate tab component (ProfilesTab, BallisticsTab, or ReticleTab)
4. Update calculation logic in `src/lib/ballistics.ts` if needed
5. Add validation in `src/lib/profiles.ts` if needed

### New UI Components
1. Check if a Shadcn component exists in `src/components/ui/`
2. Use existing patterns for forms (Label + Input/Select/Slider)
3. Follow the grid layout patterns in existing tabs
4. Use consistent spacing and styling with Tailwind utilities
5. Add proper TypeScript types for props

### New Tab/Section
1. Create new component file in `src/components/`
2. Import in `App.tsx`
3. Add `TabsTrigger` and `TabsContent` in the main Tabs component
4. Use consistent structure with existing tabs (section headers, grid layouts)

## Testing Guidelines

Currently, the project does not have automated tests. When adding features:
- Manually test all input fields
- Verify calculations with known good values
- Test edge cases (min/max values, zero values, etc.)
- Check responsive behavior on mobile
- Verify data persistence (reload page and check if data persists)

## Common Patterns

### Form Input Pattern
```tsx
<div className="grid gap-2">
  <Label htmlFor="fieldId">Field Name</Label>
  <Input
    id="fieldId"
    type="number"
    value={value}
    onChange={(e) => setValue(Number(e.target.value))}
    placeholder="0"
  />
</div>
```

### Select Pattern
```tsx
<div className="grid gap-2">
  <Label htmlFor="selectId">Select Option</Label>
  <Select value={value} onValueChange={setValue}>
    <SelectTrigger id="selectId">
      <SelectValue placeholder="Choose..." />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="option1">Option 1</SelectItem>
      <SelectItem value="option2">Option 2</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### Data Persistence Pattern
```tsx
const [data, setData] = useKV<DataType>('storage-key', {
  field1: defaultValue1,
  field2: defaultValue2,
})

// Update entire object
setData({ ...data, field1: newValue })

// Or update with callback
setData(prev => ({ ...prev, field1: newValue }))
```

## Important Files - DO NOT DELETE

- `PRD.md` - Product requirements document (contains core specifications)
- `runtime.config.json` - Spark framework configuration
- `spark.meta.json` - Spark metadata
- `components.json` - Shadcn UI configuration

## Build Artifacts (Ignored)

These are generated and should not be committed:
- `dist/` - Production build output
- `node_modules/` - Dependencies
- `.tmp/` - Temporary build files

## Domain-Specific Knowledge

### Ballistics Terminology
- **MOA (Minute of Angle):** Angular measurement, 1 MOA ≈ 1.047 inches at 100 yards
- **MIL (Milliradian):** Angular measurement, 1 MIL ≈ 3.6 inches at 100 yards
- **BC (Ballistic Coefficient):** Measure of bullet's ability to overcome air resistance
- **G1/G7:** Drag models (G1 for flat-base bullets, G7 for boat-tail bullets)
- **Zero Distance:** Range at which scope is zeroed (bullet crosses line of sight)
- **FFP/SFP:** First Focal Plane / Second Focal Plane (scope reticle scaling)
- **Turret Clicks:** Scope adjustment increments (typically 0.25 or 0.1 units)

### Unit Conversions
- Velocity: fps (feet per second)
- Distance: yards
- Energy: ft-lbs (foot-pounds)
- Temperature: °C or °F
- Pressure: hPa or inHg
- Bullet weight: grains (1 grain = 0.0648 grams)

## Accessibility and UX

- All form inputs should have associated labels
- Use semantic HTML elements
- Provide visual feedback for all user actions
- Show loading states during calculations
- Display clear error messages for invalid inputs
- Support keyboard navigation

## Performance Considerations

- Trajectory calculations run synchronously but are wrapped in setTimeout for UI responsiveness
- Large trajectory tables (many range increments) may impact render performance
- Use React.memo() for expensive components if needed
- Debounce real-time calculations if auto-calculate is implemented

## Security and Safety

⚠️ **Critical:** This is a ballistics calculator used for real-world shooting applications.
- All calculations must be accurate and validated
- Never remove safety disclaimers
- Validate all user inputs to prevent calculation errors
- Display warnings for subsonic transitions or other accuracy concerns

## Questions or Clarifications

For questions about:
- **Ballistic physics:** Refer to `src/lib/ballistics.ts` implementation
- **Data structures:** Check `src/lib/types.ts`
- **UI components:** See existing tab components for patterns
- **Feature requirements:** Review `PRD.md`
