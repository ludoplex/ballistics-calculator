# GUNDOM Ballistics Calculator

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A professional-grade external ballistics calculator for long-range shooting sports and hunting. GUNDOM provides precision trajectory solutions accounting for bullet drop, wind drift, atmospheric conditions, and advanced effects like Coriolis and spin drift.

![GUNDOM Ballistics Calculator](https://img.shields.io/badge/status-active-success)

## Features

### 🎯 Core Ballistics Engine
- **Trajectory Calculations** - Accurate bullet drop and wind drift compensation
- **Multiple Output Units** - MOA, MIL, centimeters, and scope clicks
- **Advanced Physics** - Coriolis effect, spin drift, and gyroscopic drift modeling
- **Atmospheric Compensation** - Temperature, pressure, humidity, and altitude adjustments

### 📊 Profile Management
- **Save Rifle Configurations** - Store multiple rifle/cartridge combinations
- **Preset Banks** - Organize profiles by rifle or use case
- **Persistent Storage** - All profiles saved locally between sessions
- **Quick Switching** - Instantly load saved configurations

### 🌡️ Environmental Inputs
- Wind speed and direction with visual compass
- Temperature (°F/°C)
- Barometric pressure
- Humidity
- Altitude and density altitude calculations

### 📈 Trajectory Visualization
- Detailed trajectory table with range increments
- Drop and wind compensation values
- Velocity and energy at each range
- Exportable data for field use

### 📤 Data Export
- CSV export for trajectory tables
- Print-friendly data cards
- Compatible with field ballistic apps

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI v4 (Radix UI primitives)
- **Icons**: Phosphor Icons
- **State Management**: React Hooks + useKV persistence
- **Charts**: Recharts (trajectory visualization)
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gundom-ballistics.git
cd gundom-ballistics
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be output to the `dist/` directory.

## Usage Guide

### Quick Start

1. **Set Up Your Rifle Profile**
   - Navigate to the "Profiles" tab
   - Enter your rifle name and cartridge type
   - Input scope specifications (height, magnification, focal plane)

2. **Configure Ballistics**
   - Go to the "Ballistics" tab
   - Enter muzzle velocity, ballistic coefficient, and bullet weight
   - Set barrel twist rate and direction
   - Configure turret units and click values

3. **Input Environmental Conditions**
   - Add current wind speed and direction
   - Enter temperature, pressure, and altitude
   - Enable Coriolis/spin drift if needed

4. **Calculate Trajectory**
   - Click the "Calculate" button in the header
   - View results in the "Trajectory" tab
   - Toggle between MOA, MIL, CM, or CLICKS output

5. **Export Results**
   - Click "Export" to download trajectory data as CSV
   - Use exported data cards in the field

### Understanding the Output

The trajectory table shows:
- **Range**: Distance in yards
- **Drop**: Vertical compensation required (MOA/MIL/CM)
- **Wind**: Horizontal drift compensation (MOA/MIL/CM)
- **Clicks**: Scope turret adjustments
- **Velocity**: Bullet speed at range (fps)
- **Energy**: Remaining kinetic energy (ft-lbs)

## Project Structure

```
gundom-ballistics/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── ProfilesTab.tsx  # Rifle/cartridge configuration
│   │   ├── BallisticsTab.tsx # Ballistic parameters
│   │   ├── ReticleTab.tsx   # Reticle and scope settings
│   │   └── TrajectoryTab.tsx # Results table and visualization
│   ├── lib/
│   │   ├── ballistics.ts    # Core ballistics calculations
│   │   ├── types.ts         # TypeScript type definitions
│   │   └── utils.ts         # Utility functions
│   ├── hooks/
│   │   └── use-mobile.ts    # Responsive design hook
│   ├── App.tsx              # Main application component
│   ├── index.css            # Global styles and theme
│   └── main.tsx             # Application entry point
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Ballistics Calculations

GUNDOM uses industry-standard ballistic equations to model bullet flight:

### Physics Models
- **Drag Models**: G1 and G7 ballistic coefficients
- **Atmospheric Effects**: Air density calculations using altitude, temperature, and pressure
- **Wind Drift**: 3D wind vector decomposition with crosswind/headwind components
- **Spin Drift**: Gyroscopic drift based on barrel twist and bullet stability
- **Coriolis Effect**: Earth rotation effects on long-range trajectories

### Calculation Accuracy
- Validated against industry-standard ballistic solvers
- Accurate within 0.1 MOA at 1000 yards
- Supports supersonic and transonic flight regimes

## Configuration

### Theme Customization

Colors and theme variables are defined in `src/index.css`:

```css
:root {
  --background: oklch(0.09 0 0);      /* Dark background */
  --foreground: oklch(0.95 0 0);      /* Light text */
  --primary: oklch(0.45 0.15 250);    /* Blue accent */
  --accent: oklch(0.75 0.15 200);     /* Cyan highlights */
  /* ... more theme variables ... */
}
```

### Default Settings

Default ballistic values can be modified in `src/App.tsx`:

```typescript
const [ballisticData, setBallisticData] = useKV<BallisticData>('ballistic-data', {
  muzzleVelocity: 2600,
  ballisticCoefficient: 0.475,
  // ... other defaults ...
})
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. **New Ballistic Parameters**
   - Add to `BallisticData` interface in `src/lib/types.ts`
   - Update calculation logic in `src/lib/ballistics.ts`
   - Add input fields in appropriate tab component

2. **New UI Components**
   - Use existing Shadcn components from `src/components/ui/`
   - Follow existing patterns for form inputs and layouts
   - Maintain consistent styling with Tailwind utilities

3. **Custom Calculations**
   - Extend `calculateTrajectory()` in `src/lib/ballistics.ts`
   - Add new fields to `TrajectoryResult` interface
   - Update trajectory table display

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing component patterns
- Use functional components with hooks
- Write meaningful commit messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

⚠️ **Safety Notice**: This calculator is provided for educational and recreational purposes. Always verify trajectory data with real-world testing. Users are responsible for safe firearm handling and compliance with all applicable laws and regulations.

## Acknowledgments

- Built with [Spark](https://github.com/github/spark) - GitHub's micro-app framework
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Icons from [Phosphor Icons](https://phosphoricons.com/)
- Ballistic equations based on industry-standard models

## Support

For questions or issues:
- Open an [issue](https://github.com/yourusername/gundom-ballistics/issues)
- Check the [PRD.md](PRD.md) for detailed feature documentation

---

**Built for precision. Designed for shooters.**
