# GUNDOM Ballistics Calculator

<!-- ⚠️ DO NOT DELETE THIS DOCUMENT ⚠️ -->
<!-- This PRD defines the core requirements and design specifications for the application -->

A professional-grade external ballistics calculator for long-range shooting sports and hunting that provides precision trajectory solutions accounting for bullet drop, wind drift, atmospheric conditions, and advanced Coriolis/gyroscopic effects.

**Experience Qualities**:
1. **Precision** - Every calculation must be accurate and trustworthy for real-world shooting applications where precision matters
2. **Professional** - Interface should feel serious, tactical, and purpose-built like professional mil-spec equipment
3. **Efficient** - Quick data entry and immediate access to critical trajectory solutions without unnecessary steps

**Complexity Level**: Light Application (multiple features with basic state)
This is a single-page calculator with multiple input sections, real-time calculations, and persistent profile data. It's more sophisticated than a micro tool but doesn't require user accounts or backend infrastructure.

## Essential Features

### Profile Management
- **Functionality**: Save and switch between rifle/cartridge configurations
- **Purpose**: Shooters use multiple rifles and loads; quick switching is essential
- **Trigger**: User selects profile dropdowns or adds new profile
- **Progression**: Select rifle → Select cartridge → Select preset bank → Profile loads all associated ballistic data
- **Success criteria**: Profile data persists between sessions and populates all input fields correctly

### Ballistic Calculations
- **Functionality**: Compute bullet trajectory accounting for all environmental and rifle-specific variables
- **Purpose**: Core function - provides drop/wind compensation values for accurate long-range shots
- **Trigger**: User clicks "Calculate" button after entering/modifying inputs
- **Progression**: Gather all inputs → Apply ballistic equations → Generate trajectory table → Display drop/wind solutions in MOA/MIL/clicks
- **Success criteria**: Trajectory output matches industry-standard ballistic solvers (within 0.1 MOA at 1000 yards)

### Environmental Inputs
- **Functionality**: Accept wind, temperature, pressure, humidity, altitude
- **Purpose**: Environmental conditions significantly affect bullet flight; accurate inputs are critical
- **Trigger**: User modifies any environmental input field
- **Progression**: User enters value → Unit conversion applied → Value stored → Recalculation triggered
- **Success criteria**: All standard units supported (mph/kph, °C/°F, hPa/inHg, etc.)

### Multi-Unit Output
- **Functionality**: Display solutions in MOA, MIL, centimeters, and scope clicks
- **Purpose**: Different scopes use different adjustment systems; shooters need their specific units
- **Trigger**: User toggles output unit selector
- **Progression**: Toggle unit → Recalculate display values → Update trajectory table
- **Success criteria**: Conversions are mathematically correct and table updates instantly

### Data Export
- **Functionality**: Export trajectory table as CSV or text format
- **Purpose**: Shooters print data cards or import into ballistic apps for field use
- **Trigger**: User clicks "Export" button
- **Progression**: Click export → Generate formatted data → Download file
- **Success criteria**: Exported data is properly formatted and includes all relevant solution data

## Edge Case Handling

- **Missing inputs**: Default to standard atmospheric conditions (59°F, 29.92 inHg, 0 altitude)
- **Invalid ranges**: Clamp ballistic coefficient to realistic values (0.1-1.0), velocities to 500-4500 fps
- **Extreme conditions**: Calculator works at -40°F to 140°F, 0-15000ft altitude
- **Zero distance errors**: Prevent zero distance greater than max range output
- **Subsonic transition**: Flag when bullet goes subsonic (calculations less reliable)

## Design Direction

The design should feel tactical, serious, and precision-focused like professional military or competition shooting equipment. It should evoke confidence and technical competence - this is a tool for serious shooters who demand accuracy. The interface should be information-dense but highly organized, prioritizing function over decoration while maintaining a sleek, modern aesthetic similar to aerospace instrumentation or professional ballistic apps like Strelok Pro.

Minimal interface serves the purpose - every element has a job, no decoration for decoration's sake. Dark UI reduces eye strain during field use and emphasizes the bright, readable data values.

## Color Selection

Custom tactical palette - dark backgrounds with high-contrast data values and clear state differentiation.

- **Primary Color**: Deep blue (`oklch(0.45 0.15 250)`) - Professional, technical, trustworthy; used for active tabs and primary actions
- **Secondary Colors**: 
  - Charcoal grays (`oklch(0.15 0 0)` to `oklch(0.25 0 0)`) for layered backgrounds
  - Cool slate (`oklch(0.35 0.03 250)`) for borders and dividers
- **Accent Color**: Bright cyan (`oklch(0.75 0.15 200)`) for editable values and active inputs - stands out clearly for quick scanning
- **Success/Calculate**: Vibrant green (`oklch(0.65 0.18 150)`) for export/confirmation actions
- **Warning/Highlight**: Amber (`oklch(0.75 0.15 85)`) for calculated results requiring attention

**Foreground/Background Pairings**:
- Background (`oklch(0.09 0 0)`): White text (`oklch(0.95 0 0)`) - Ratio 18.2:1 ✓
- Card/Panel (`oklch(0.13 0.01 250)`): Light gray text (`oklch(0.92 0 0)`) - Ratio 14.8:1 ✓
- Primary (`oklch(0.45 0.15 250)`): White text (`oklch(1 0 0)`) - Ratio 6.9:1 ✓
- Accent cyan (`oklch(0.75 0.15 200)`): Dark background (`oklch(0.13 0.01 250)`) - Ratio 9.4:1 ✓
- Success green (`oklch(0.65 0.18 150)`): White text (`oklch(1 0 0)`) - Ratio 5.2:1 ✓
- Input fields (`oklch(0.18 0.02 250)`): Cyan text (`oklch(0.75 0.15 200)`) - Ratio 5.8:1 ✓

## Font Selection

Clean, technical sans-serif fonts that suggest precision and readability. SF Pro or Inter for their excellent numerals and tabular figure support - critical when scanning columns of ballistic data. Monospace characteristics for number columns ensure alignment.

- **Typographic Hierarchy**:
  - H1 (Brand/Title): Inter Bold / 24px / tight tracking (-0.02em) - Strong presence
  - H2 (Section Headers): Inter SemiBold / 14px / uppercase / wide tracking (+0.05em) / muted color - Organizational clarity
  - Body (Labels): Inter Regular / 13px / standard spacing - Clean readability
  - Data Values: Inter Bold / 17px / tabular numerals - Quick scanning, clear hierarchy
  - Table Data: Inter Medium / 13px / tabular numerals / monospace fallback - Perfect alignment
  - Units: Inter Regular / 12px / muted color - Present but not competing with values

## Animations

Subtle and functional - this is a tool, not a showcase. Animations should clarify state changes and guide attention without slowing workflow or distracting shooters who need to work quickly.

- **Purposeful Meaning**: Smooth input field highlighting on focus reinforces "this is active". Tab transitions slide horizontally to show spatial relationship. Calculate button pulses subtly when inputs change (prompting recalculation).
- **Hierarchy of Movement**: 
  1. Input feedback (immediate, <100ms)
  2. Tab/section transitions (250ms ease-out)
  3. Table population (staggered 30ms per row for visual feedback that calculation completed)
  4. Value updates (morph numbers smoothly rather than instant replacement)

## Component Selection

- **Components**: 
  - `Tabs` for Profile/Ballistics/Reticle/Trajectory navigation
  - `Select` for rifle/cartridge/preset dropdowns
  - `Input` for all numeric entry fields
  - `Button` for Calculate/Export/Add Profile actions with distinct variants
  - `Card` for grouping related inputs (Scope setup, Wind, Atmosphere blocks)
  - `Table` for trajectory solutions output
  - Custom compass component for wind direction visualization
  - Custom trajectory chart using SVG/Canvas for visual trajectory path

- **Customizations**: 
  - Input fields styled as dark inset with cyan text for active values
  - Unit labels positioned inline-right within input containers
  - Segmented tab control with active state highlighting
  - Data table with alternating row backgrounds and color-coded columns

- **States**: 
  - Inputs: default dark, focus with cyan border glow, disabled grayed
  - Buttons: primary blue (Calculate), success green (Export), secondary for Add
  - Tabs: inactive gray with blue highlight for active
  - Select dropdowns: white background to stand out as interactive

- **Icon Selection**: 
  - `@phosphor-icons/react` - `Plus` for Add Profile, `Export` for export action, `Calculator` for calculate, `Wind` for wind section, `ThermometerSimple` for temperature, `Gauge` for pressure, `Crosshair` for reticle

- **Spacing**: 
  - Card padding: `p-6`
  - Input groups: `gap-4`
  - Section spacing: `space-y-6`
  - Grid gaps: `gap-3` for tight input grids
  - Page margins: `p-4` mobile, `p-6` desktop

- **Mobile**: 
  - Stack tabs vertically on mobile as full-width buttons
  - Input grids collapse from 2-column to single column
  - Trajectory table becomes horizontally scrollable
  - Bottom action buttons stack vertically
  - Compress spacing slightly (p-4 instead of p-6)
  - Sticky header with Calculate/Export always visible

---

## Reference Images

<!-- ⚠️ DO NOT DELETE THIS SECTION ⚠️ -->
<!-- These reference images from Strelok Pro inform the feature set and UX patterns -->

The following reference screenshots from Strelok Pro ballistics app are stored in `/src/assets/images/` and serve as functional reference for feature implementation:

### screenshot_1_small.png - Main Calculator Interface
**Purpose**: Primary input screen layout reference
- Shows distance, slope angle, wind speed/direction inputs
- Displays vertical/horizontal correction outputs in multiple units (MOA, MRAD, inches, clicks)
- "Calculate!" primary action button with "Reticle" secondary action
- Clean separation between inputs (top) and results (bottom)
- Weather conditions summary banner
- Rifle/ammunition configuration display

**Key Learnings**:
- Input fields should be clearly labeled with units inline
- Results should display simultaneously in all relevant units for quick scanning
- Weather summary provides context for calculations
- Configuration reminder keeps user aware of active profile

### screenshot_3_small.png - Reticle Visualization
**Purpose**: Visual reticle overlay with trajectory data
- Circular reticle view with crosshair grid
- Wind drift visualization overlaid on reticle
- Range markings at various distances with precise hold values
- Distance slider for adjusting target range
- Reticle type selector dropdown
- Search and settings actions

**Key Learnings**:
- Reticle visualization is valuable for understanding hold-overs visually
- Multiple reticle patterns should be supported (future enhancement)
- Interactive range adjustment provides real-time feedback
- Wind data integrated into visual display

### screenshot_4_small.png - Additional Ballistic Info
**Purpose**: Detailed secondary calculations modal
- Bullet speed corrected for current conditions
- Retained velocity at distance
- Sound speed calculation
- Time of flight
- Click value at distance in inches
- Muzzle energy and retained energy

**Key Learnings**:
- Secondary data in modal/dialog keeps main interface clean
- Energy calculations important for hunting applications
- Sound speed helps with timing observations
- All values clearly labeled with appropriate units

### screenshot_5_small.png - Trajectory Table
**Purpose**: Complete trajectory solution table
- Distance increments (100-700 yards shown)
- Bullet speed per distance
- Vertical correction (MOA)
- Horizontal wind correction (MOA)
- Compact tabular format for easy scanning
- Settings, email, and close actions

**Key Learnings**:
- Table format is essential for detailed trajectory analysis
- Distance increments should be configurable (25yd, 50yd, 100yd)
- Multiple correction columns allow comparison
- Export functionality (email) is critical for field use
- Compact display fits maximum data on screen

### screenshot_6_small.png - Rifle/Cartridge Editor
**Purpose**: Profile data entry modal
- Manufacturer dropdown (Federal)
- Cartridge/bullet selection
- Bullet weight input (grains)
- Ballistic coefficient with precision
- Bullet speed (fps)
- Temperature at chronograph
- Temperature sensitivity factor
- OK/Cancel actions

**Key Learnings**:
- Profile editing in focused modal reduces complexity
- Hierarchical selection (manufacturer → cartridge → specifics)
- Temperature sensitivity affects velocity calculations
- Clear save/cancel actions prevent accidental changes

### screenshot_7_small.png - Weather Conditions
**Purpose**: Environmental inputs modal
- Altitude (feet)
- Temperature (°F)
- Pressure (inHg)
- Pressure unit selector dropdown
- Standard atmosphere button for defaults
- OK/Cancel actions

**Key Learnings**:
- Weather inputs grouped separately from ballistic data
- Unit conversion options important (metric/imperial)
- Standard atmosphere defaults simplify common case
- Clear modal pattern for focused data entry

### screenshot_8_small.png - Profile Summary
**Purpose**: Quick profile overview
- Profile name display
- Profile name edit field
- Scope configuration summary
- Zeroing weather conditions
- Cartridge details with key specs (velocity/BC)
- Close action

**Key Learnings**:
- Profile summary provides quick confirmation of active settings
- Editable profile name for organization
- Key specifications displayed for verification
- Zeroing conditions are critical reference data

---

## Implementation Status

<!-- ⚠️ DO NOT DELETE THIS SECTION ⚠️ -->
<!-- Track feature implementation progress against the PRD -->

### Completed Features ✓
- ✓ Profile management (save/load/delete/import/export)
- ✓ Ballistic calculations with industry-standard equations
- ✓ Environmental inputs (wind, temperature, pressure, humidity, altitude)
- ✓ Multi-unit output (MOA, MIL, cm, clicks)
- ✓ Data export to CSV
- ✓ Trajectory visualization chart
- ✓ Comprehensive trajectory table
- ✓ Input validation and error handling
- ✓ Responsive mobile layout
- ✓ Wind direction compass visualization
- ✓ Reticle scaffold preview
- ✓ Advanced effects (Coriolis, Spin Drift)
- ✓ Persistent state with useKV
- ✓ Tab-based navigation (Profiles/Ballistics/Environment/Trajectory)
- ✓ Professional tactical dark theme

### Future Enhancements (Optional)
- ⚪ Interactive reticle overlay with distance slider (per screenshot_3)
- ⚪ Additional info modal with secondary calculations (per screenshot_4)
- ⚪ Multiple reticle pattern library
- ⚪ Temperature sensitivity factors in velocity calculations
- ⚪ Standard atmosphere quick-set button
- ⚪ Slope angle compensation
- ⚪ Range unit toggling (yards/meters)
- ⚪ Detailed summary view modal (per screenshot_8)
