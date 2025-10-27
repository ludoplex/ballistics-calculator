import type { BallisticData, TrajectoryResult } from './types'
import { G1_DRAG_TABLE, G7_DRAG_TABLE } from './drag-tables'

// Physical constants
const G_FTPS2 = 32.174
const FEET_PER_YARD = 3
const INCHES_PER_FOOT = 12
const INCHES_PER_YARD = 36
const MOA_INCHES_100Y = 1.0471975511965976
const INCHES_PER_YARD_PER_MIL = INCHES_PER_YARD * 0.001
const DEFAULT_SPEED_OF_SOUND_FPS = 1116.4 // At sea level, 59°F

// Numeric safety constants
const BC_MIN = 1e-4 // Minimum ballistic coefficient to prevent division by zero
const MIN_VELOCITY_FPS = 0.1 // Minimum velocity to prevent division by zero

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function degToRad(d: number) {
  return (d * Math.PI) / 180
}

function mphToFps(mph: number) {
  return mph * 1.46666667
}

function densityRatioFromDA(daFeet: number) {
  const term = 1 - 6.87535e-6 * clamp(daFeet, -3000, 80000)
  return Math.pow(term, 4.2561)
}

function densityRatioFromPT(pressureInHg: number, tempF: number) {
  const p0InHg = 29.92126
  const T0R = 518.67
  const TR = (tempF + 459.67)
  return (pressureInHg / p0InHg) * (T0R / TR)
}

function inchesToMOA(inches: number, rangeYards: number) {
  if (rangeYards <= 0) return 0
  const moaInches = (MOA_INCHES_100Y * rangeYards) / 100
  return inches / moaInches
}

function inchesToMIL(inches: number, rangeYards: number) {
  if (rangeYards <= 0) return 0
  const inchesPerMil = INCHES_PER_YARD_PER_MIL * rangeYards
  return inches / inchesPerMil
}

function computeClicks(unit: 'MOA' | 'MIL', clickValue: number, dropMOA: number, dropMIL: number) {
  if (!clickValue || clickValue <= 0) return 0
  if (unit === 'MIL') {
    return Math.round(dropMIL / clickValue)
  }
  return Math.round(dropMOA / clickValue)
}

/**
 * Linear interpolation for drag coefficient lookup from standard drag tables.
 * 
 * @param dragTable - Array of [Mach, Cd] tuples representing the drag model
 * @param mach - Mach number (velocity / speed of sound, dimensionless)
 * @returns Drag coefficient (Cd, dimensionless)
 */
export function interpolateDrag(dragTable: [number, number][], mach: number): number {
  if (mach <= dragTable[0][0]) return dragTable[0][1]
  if (mach >= dragTable[dragTable.length - 1][0]) return dragTable[dragTable.length - 1][1]

  for (let i = 0; i < dragTable.length - 1; i++) {
    const [m1, cd1] = dragTable[i]
    const [m2, cd2] = dragTable[i + 1]
    
    if (mach >= m1 && mach <= m2) {
      const t = (mach - m1) / (m2 - m1)
      return cd1 + t * (cd2 - cd1)
    }
  }
  
  return dragTable[dragTable.length - 1][1]
}

/**
 * Get drag coefficient for a given velocity and BC type from standard drag tables.
 * 
 * @param velocityFps - Projectile velocity in feet per second
 * @param bcType - Ballistic coefficient type: 'G1' for flat-base bullets, 'G7' for boat-tail bullets
 * @param speedOfSound - Speed of sound in fps (temperature-dependent)
 * @returns Drag coefficient (Cd, dimensionless)
 */
export function getDragCoefficient(velocityFps: number, bcType: 'G1' | 'G7', speedOfSound: number): number {
  const mach = velocityFps / speedOfSound
  const dragTable = bcType === 'G7' ? G7_DRAG_TABLE : G1_DRAG_TABLE
  return interpolateDrag(dragTable, mach)
}

function normalizeInputs(data: BallisticData) {
  const muzzleVelocityFps: number = data.muzzleVelocity ?? 2600
  const ballisticCoefficient: number = data.ballisticCoefficient ?? 0.475
  const bcType: 'G1' | 'G7' = data.bcType ?? 'G7'
  const bulletWeightGrains: number = data.bulletMass ?? 168

  const zeroRangeYards: number = data.zeroDistance ?? 100
  const sightHeightInches: number = data.scopeHeight ?? 1.75

  const stepYards: number = 25
  const maxRangeYards: number = 1000

  const windSpeedMph: number = data.windSpeed ?? 0
  const windDirectionDeg: number = data.windAngle ?? 90

  const clickUnit: 'MOA' | 'MIL' = data.turretUnits ?? 'MOA'
  const clickValue: number = data.clickValue ?? (clickUnit === 'MIL' ? 0.1 : 0.25)

  const densityAltitudeFeet: number | undefined = data.densityAltitude !== 0 ? data.densityAltitude : undefined
  const pressureInHg: number | undefined = data.pressure ? data.pressure / 33.8639 : undefined
  const tempF: number | undefined = data.temperature !== undefined ? (data.temperature * 9/5) + 32 : undefined

  const coriolisEnabled: boolean = !!data.coriolisEnabled
  const spinDriftEnabled: boolean = !!data.spinDriftEnabled
  const latitudeDeg: number = data.latitude ?? 0
  const azimuthDeg: number = data.azimuth ?? 0

  return {
    muzzleVelocityFps,
    ballisticCoefficient,
    bcType,
    bulletWeightGrains,
    zeroRangeYards,
    sightHeightInches,
    stepYards,
    maxRangeYards,
    windSpeedMph,
    windDirectionDeg,
    clickUnit,
    clickValue,
    densityAltitudeFeet,
    pressureInHg,
    tempF,
    coriolisEnabled,
    spinDriftEnabled,
    latitudeDeg,
    azimuthDeg,
  }
}

function getDensityRatio(inputs: ReturnType<typeof normalizeInputs>) {
  if (typeof inputs.densityAltitudeFeet === 'number') {
    return densityRatioFromDA(inputs.densityAltitudeFeet)
  }
  if (typeof inputs.pressureInHg === 'number' && typeof inputs.tempF === 'number') {
    return densityRatioFromPT(inputs.pressureInHg, inputs.tempF)
  }
  return 1
}

type SimState = {
  x_ft: number
  y_ft: number
  vx_fps: number
  vy_fps: number
  v_fps: number
  t_s: number
}

/**
 * Calculate speed of sound based on temperature.
 * 
 * @param tempF - Temperature in degrees Fahrenheit
 * @returns Speed of sound in feet per second
 * 
 * Formula: v = v₀ × sqrt(T/T₀) where T is in Rankine (°F + 459.67)
 */
function calculateSpeedOfSound(tempF: number): number {
  // Speed of sound in fps = DEFAULT_SPEED_OF_SOUND_FPS * sqrt(T/518.67) where T is in Rankine
  const tempR = tempF + 459.67
  return DEFAULT_SPEED_OF_SOUND_FPS * Math.sqrt(tempR / 518.67)
}

function stepDrag(
  state: SimState, 
  dx_ft: number, 
  bc: number, 
  bcType: 'G1' | 'G7',
  densityRatio: number,
  speedOfSound: number
): SimState {
  // Safe BC: clamp to minimum value to prevent division by zero
  const bcSafe = Math.max(BC_MIN, bc)
  
  // Adaptive substepping: increase substeps near transonic region (Mach 0.8-1.2)
  const currentMach = state.v_fps / speedOfSound
  const isNearTransonic = currentMach >= 0.8 && currentMach <= 1.2
  const baseSubSteps = Math.max(1, Math.min(10, Math.ceil(dx_ft / 3)))
  const subSteps = isNearTransonic ? Math.min(20, baseSubSteps * 2) : baseSubSteps
  
  const h = dx_ft / subSteps
  let st = { ...state }

  for (let i = 0; i < subSteps; i++) {
    const v = Math.max(MIN_VELOCITY_FPS, st.v_fps)
    
    // Get drag function value i(v) from table
    const dragFunction = getDragCoefficient(v, bcType, speedOfSound)
    
    // Time step: we're stepping horizontally by h feet, so dt = h / vx
    // Note: vx should remain positive in normal ballistic trajectory
    if (st.vx_fps <= 0) {
      // Projectile stopped or moving backwards - physics error
      return st
    }
    const dt = h / st.vx_fps
    
    // Ballistic retardation formula:
    // a = -(ρ/ρ₀) × g × i(v) / BC  (negative because drag opposes motion)
    // where g = 32.174 ft/s² and i(v) is from drag tables
    const retardation = -(densityRatio * G_FTPS2 * dragFunction) / bcSafe
    
    // Apply retardation to velocity components (negative, opposing motion)
    const vx_new = st.vx_fps + (retardation / v) * st.vx_fps * dt
    const vy_new = st.vy_fps + (retardation / v) * st.vy_fps * dt - G_FTPS2 * dt

    // Use average velocity for position update (trapezoidal integration)
    const vx_avg = 0.5 * (st.vx_fps + vx_new)
    const vy_avg = 0.5 * (st.vy_fps + vy_new)

    st = {
      x_ft: st.x_ft + h,
      y_ft: st.y_ft + vy_avg * dt,
      vx_fps: vx_new,
      vy_fps: vy_new,
      v_fps: Math.hypot(vx_new, vy_new),
      t_s: st.t_s + dt,
    }
  }

  return st
}

function solveBoreAngle(
  v0_fps: number,
  bc: number,
  bcType: 'G1' | 'G7',
  densityRatio: number,
  speedOfSound: number,
  zeroRangeYards: number,
  sightHeightFeet: number
): number {
  const xZero_ft = zeroRangeYards * FEET_PER_YARD

  let lo = 0
  let hi = degToRad(5)
  let angle = degToRad(1.5)

  for (let iter = 0; iter < 24; iter++) {
    angle = 0.5 * (lo + hi)

    let st: SimState = {
      x_ft: 0,
      y_ft: 0,
      vx_fps: v0_fps * Math.cos(angle),
      vy_fps: v0_fps * Math.sin(angle),
      v_fps: v0_fps,
      t_s: 0,
    }

    while (st.x_ft < xZero_ft) {
      const remaining = xZero_ft - st.x_ft
      const step = Math.min(3 * FEET_PER_YARD, remaining)
      st = stepDrag(st, step, bc, bcType, densityRatio, speedOfSound)
      if (st.y_ft < sightHeightFeet - 5) break
    }

    const err = st.y_ft - sightHeightFeet
    if (err > 0) {
      hi = angle
    } else {
      lo = angle
    }
  }

  return angle
}

/**
 * Calculate ballistic trajectory for a projectile.
 * 
 * This function computes a complete trajectory table accounting for bullet drop, wind drift,
 * atmospheric conditions, and optional effects like Coriolis and spin drift.
 * 
 * @param data - Ballistic input data containing all parameters
 * @returns Array of trajectory results at each range increment
 * 
 * Units:
 * - Input velocity: feet per second (fps)
 * - Input BC: dimensionless G1 or G7 ballistic coefficient (as provided by bullet manufacturer)
 * - Input distances: yards
 * - Input wind speed: mph
 * - Output ranges: yards
 * - Output velocities: fps
 * - Output drop/wind: MOA, MIL, inches, and turret clicks
 * 
 * BC Convention:
 * The ballistic coefficient (BC) is expected to be the conventional G1 or G7 value
 * as provided by bullet manufacturers. The solver uses this BC directly with the
 * standard drag tables. Note: BC derivation from Cd/cross-sectional area/mass is
 * complex and not performed here. For different BC definitions or units, explicit
 * conversion should be performed before calling this function.
 * 
 * @throws Will clamp invalid BC values to BC_MIN to prevent division errors
 */
export function calculateTrajectory(data: BallisticData): TrajectoryResult[] {
  const inputs = normalizeInputs(data)
  const {
    muzzleVelocityFps,
    ballisticCoefficient,
    bcType,
    bulletWeightGrains,
    zeroRangeYards,
    sightHeightInches,
    stepYards,
    maxRangeYards,
    windSpeedMph,
    windDirectionDeg,
    clickUnit,
    clickValue,
    coriolisEnabled,
    spinDriftEnabled,
    latitudeDeg,
    azimuthDeg,
    tempF,
  } = inputs

  const densityRatio = getDensityRatio(inputs)
  
  // Calculate speed of sound based on temperature
  const speedOfSound = tempF !== undefined 
    ? calculateSpeedOfSound(tempF) 
    : DEFAULT_SPEED_OF_SOUND_FPS

  const sightHeightFeet = sightHeightInches / INCHES_PER_FOOT
  const boreAngle = solveBoreAngle(
    muzzleVelocityFps, 
    ballisticCoefficient, 
    bcType,
    densityRatio, 
    speedOfSound,
    zeroRangeYards, 
    sightHeightFeet
  )

  let st: SimState = {
    x_ft: 0,
    y_ft: 0,
    vx_fps: muzzleVelocityFps * Math.cos(boreAngle),
    vy_fps: muzzleVelocityFps * Math.sin(boreAngle),
    v_fps: muzzleVelocityFps,
    t_s: 0,
  }

  const crosswind_fps = mphToFps(windSpeedMph) * Math.sin(degToRad(windDirectionDeg))
  let accumulatedDrift_ft = 0

  const results: TrajectoryResult[] = []
  const maxX_ft = maxRangeYards * FEET_PER_YARD

  let nextSampleYards = stepYards
  const sampleStep_ft = stepYards * FEET_PER_YARD

  while (st.x_ft < maxX_ft) {
    const step = Math.min(sampleStep_ft, maxX_ft - st.x_ft)
    const pre_t = st.t_s

    st = stepDrag(st, step, ballisticCoefficient, bcType, densityRatio, speedOfSound)

    const dt = st.t_s - pre_t
    accumulatedDrift_ft += crosswind_fps * dt

    const rangeYards = st.x_ft / FEET_PER_YARD
    if (rangeYards + 1e-6 >= nextSampleYards || st.x_ft >= maxX_ft - 1e-6) {
      const drop_in = (sightHeightFeet - st.y_ft) * INCHES_PER_FOOT
      const wind_in = accumulatedDrift_ft * INCHES_PER_FOOT

      let extraWindIn = 0
      if (coriolisEnabled) {
        const omega = 7.2921159e-5
        const lat = degToRad(latitudeDeg)
        extraWindIn += (2 * omega * Math.sin(lat) * st.v_fps * st.t_s) * (INCHES_PER_FOOT / 12)
      }
      if (spinDriftEnabled) {
        const r1000 = rangeYards / 1000
        const driftMil = 0.15 * Math.pow(clamp(r1000, 0, 1.5), 1.83)
        extraWindIn += driftMil * INCHES_PER_YARD_PER_MIL * rangeYards
      }

      const windTotalIn = wind_in + extraWindIn

      const dropMOA = inchesToMOA(drop_in, rangeYards)
      const dropMIL = inchesToMIL(drop_in, rangeYards)
      const windMOA = inchesToMOA(windTotalIn, rangeYards)
      const windMIL = inchesToMIL(windTotalIn, rangeYards)
      const clicks = computeClicks(clickUnit, clickValue, dropMOA, dropMIL)

      const energy_ftlb = (bulletWeightGrains * st.v_fps * st.v_fps) / 450240

      results.push({
        range: Math.round(rangeYards),
        dropMOA,
        dropMIL,
        dropInches: drop_in,
        windMOA,
        windMIL,
        windInches: windTotalIn,
        clicks,
        velocity: st.v_fps,
        energy: energy_ftlb,
        time: st.t_s,
      })

      nextSampleYards += stepYards
    }

    if (st.v_fps < 200) {
      break
    }
  }

  return results
}
