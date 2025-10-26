# Ballistics Calculation Refactoring

## Overview

The ballistics calculation engine has been refactored to use industry-standard G1 and G7 drag coefficient tables and proper physics formulas, replacing the previous oversimplified drag model.

## Key Improvements

### 1. Industry-Standard Drag Tables

- **G1 Drag Table**: 79 data points covering Mach 0.00 to 5.00
- **G7 Drag Table**: 94 data points covering Mach 0.00 to 5.00
- Linear interpolation for smooth drag calculations
- Proper transonic region modeling

### 2. Correct Physics Implementation

```typescript
// Old (simplified):
const dragCoef = (rho / bc) * v * dt
const dragFactor = 1 / (1 + dragCoef)

// New (industry-standard):
const dragFunction = getDragCoefficient(v, bcType, speedOfSound)
const retardation = -(densityRatio * G_FTPS2 * dragFunction) / bc
```

### 3. Enhanced Features

- Temperature-dependent speed of sound calculations
- Separate handling of G1 and G7 ballistic coefficients
- Proper atmospheric density corrections
- Mach number-based drag lookup

## Technical Details

### Ballistic Retardation Formula

The implementation now uses the standard external ballistics formula:

```
a = -(ρ/ρ₀) × g × i(v) / BC

Where:
- ρ/ρ₀ = atmospheric density ratio
- g = 32.174 ft/s² (gravitational acceleration)
- i(v) = drag function from G1/G7 tables
- BC = ballistic coefficient
```

### Drag Table Sources

Based on U.S. Army Aberdeen Proving Ground standards:
- G1: Standard flat-base projectile model
- G7: Modern boat-tail projectile model (lower drag)

## Validation

### Drag Table Validation
✓ G1 coefficient range: 0.202 - 1.231
✓ G7 coefficient range: 0.119 - 0.566
✓ G7 < G1 (correct for boat-tail bullets)
✓ Transonic spike properly represented

### Physics Validation
✓ Gravity acceleration: 32.174 ft/s²
✓ Atmospheric corrections functional
✓ Mach number calculations accurate
✓ Temperature effects included

## Next Steps

To achieve <1% accuracy target:

1. Compare calculations against validated ballistic solvers (JBM, Applied Ballistics)
2. Test with multiple cartridges across full range
3. Fine-tune any scaling factors based on real-world data

## References

- McCoy, Robert L. "Modern Exterior Ballistics"
- U.S. Army Aberdeen Proving Ground drag standards
- Bryan Litz "Applied Ballistics for Long Range Shooting"
- JBM Ballistics (jbmballistics.com)
