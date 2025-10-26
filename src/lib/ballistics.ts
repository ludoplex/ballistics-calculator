import type { BallisticData, TrajectoryResult } from './types'

const G_FTPS2 = 32.174
const FEET_PER_YARD = 3
const INCHES_PER_FOOT = 12
const INCHES_PER_YARD = 36
const MOA_INCHES_100Y = 1.0471975511965976
const INCHES_PER_YARD_PER_MIL = INCHES_PER_YARD * 0.001
const SPEED_OF_SOUND_FPS = 1116.4 // At sea level, 59°F

// G1 Drag Coefficient Table (Mach, CD)
// Based on standard G1 projectile drag model
const G1_DRAG_TABLE: [number, number][] = [
  [0.00, 0.2629],
  [0.05, 0.2558],
  [0.10, 0.2487],
  [0.15, 0.2413],
  [0.20, 0.2344],
  [0.25, 0.2278],
  [0.30, 0.2214],
  [0.35, 0.2155],
  [0.40, 0.2104],
  [0.45, 0.2061],
  [0.50, 0.2032],
  [0.55, 0.2020],
  [0.60, 0.2034],
  [0.70, 0.2165],
  [0.75, 0.2230],
  [0.80, 0.2313],
  [0.85, 0.2417],
  [0.90, 0.2546],
  [0.95, 0.2706],
  [1.00, 0.2901],
  [1.02, 0.2990],
  [1.04, 0.3085],
  [1.06, 0.3188],
  [1.08, 0.3299],
  [1.10, 0.3420],
  [1.12, 0.3551],
  [1.14, 0.3693],
  [1.16, 0.3847],
  [1.18, 0.4015],
  [1.20, 0.4201],
  [1.22, 0.4407],
  [1.24, 0.4639],
  [1.26, 0.4903],
  [1.28, 0.5206],
  [1.30, 0.5571],
  [1.35, 0.6419],
  [1.40, 0.7450],
  [1.45, 0.8650],
  [1.50, 0.9800],
  [1.55, 1.0663],
  [1.60, 1.1284],
  [1.65, 1.1716],
  [1.70, 1.2004],
  [1.75, 1.2183],
  [1.80, 1.2278],
  [1.85, 1.2310],
  [1.90, 1.2297],
  [1.95, 1.2253],
  [2.00, 1.2188],
  [2.05, 1.2109],
  [2.10, 1.2023],
  [2.15, 1.1934],
  [2.20, 1.1846],
  [2.25, 1.1761],
  [2.30, 1.1681],
  [2.35, 1.1608],
  [2.40, 1.1542],
  [2.45, 1.1482],
  [2.50, 1.1428],
  [2.60, 1.1336],
  [2.70, 1.1261],
  [2.80, 1.1197],
  [2.90, 1.1142],
  [3.00, 1.1096],
  [3.10, 1.1056],
  [3.20, 1.1020],
  [3.30, 1.0988],
  [3.40, 1.0959],
  [3.50, 1.0932],
  [3.60, 1.0908],
  [3.70, 1.0885],
  [3.80, 1.0864],
  [3.90, 1.0844],
  [4.00, 1.0825],
  [4.20, 1.0793],
  [4.40, 1.0764],
  [4.60, 1.0740],
  [4.80, 1.0718],
  [5.00, 1.0698],
]

// G7 Drag Coefficient Table (Mach, CD)
// Based on standard G7 projectile drag model (long range boat tail)
const G7_DRAG_TABLE: [number, number][] = [
  [0.00, 0.1198],
  [0.05, 0.1197],
  [0.10, 0.1196],
  [0.15, 0.1194],
  [0.20, 0.1193],
  [0.25, 0.1194],
  [0.30, 0.1194],
  [0.35, 0.1194],
  [0.40, 0.1193],
  [0.45, 0.1193],
  [0.50, 0.1194],
  [0.55, 0.1193],
  [0.60, 0.1194],
  [0.65, 0.1197],
  [0.70, 0.1202],
  [0.75, 0.1207],
  [0.80, 0.1215],
  [0.85, 0.1226],
  [0.90, 0.1242],
  [0.95, 0.1266],
  [1.00, 0.1306],
  [1.02, 0.1327],
  [1.04, 0.1351],
  [1.06, 0.1376],
  [1.08, 0.1404],
  [1.10, 0.1434],
  [1.12, 0.1467],
  [1.14, 0.1503],
  [1.16, 0.1543],
  [1.18, 0.1590],
  [1.20, 0.1645],
  [1.22, 0.1710],
  [1.24, 0.1787],
  [1.26, 0.1878],
  [1.28, 0.1986],
  [1.30, 0.2113],
  [1.32, 0.2266],
  [1.34, 0.2449],
  [1.36, 0.2669],
  [1.38, 0.2915],
  [1.40, 0.3185],
  [1.42, 0.3474],
  [1.44, 0.3772],
  [1.46, 0.4070],
  [1.48, 0.4359],
  [1.50, 0.4630],
  [1.52, 0.4877],
  [1.54, 0.5093],
  [1.56, 0.5271],
  [1.58, 0.5408],
  [1.60, 0.5502],
  [1.65, 0.5614],
  [1.70, 0.5657],
  [1.75, 0.5654],
  [1.80, 0.5620],
  [1.85, 0.5563],
  [1.90, 0.5490],
  [1.95, 0.5410],
  [2.00, 0.5326],
  [2.05, 0.5242],
  [2.10, 0.5160],
  [2.15, 0.5081],
  [2.20, 0.5006],
  [2.25, 0.4935],
  [2.30, 0.4869],
  [2.35, 0.4806],
  [2.40, 0.4747],
  [2.45, 0.4691],
  [2.50, 0.4639],
  [2.55, 0.4589],
  [2.60, 0.4541],
  [2.65, 0.4496],
  [2.70, 0.4452],
  [2.75, 0.4410],
  [2.80, 0.4370],
  [2.85, 0.4331],
  [2.90, 0.4293],
  [2.95, 0.4257],
  [3.00, 0.4221],
  [3.10, 0.4154],
  [3.20, 0.4090],
  [3.30, 0.4029],
  [3.40, 0.3971],
  [3.50, 0.3915],
  [3.60, 0.3862],
  [3.70, 0.3811],
  [3.80, 0.3762],
  [3.90, 0.3715],
  [4.00, 0.3669],
  [4.20, 0.3584],
  [4.40, 0.3505],
  [4.60, 0.3432],
  [4.80, 0.3365],
  [5.00, 0.3303],
]

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

// Linear interpolation for drag coefficient lookup
function interpolateDrag(dragTable: [number, number][], mach: number): number {
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

// Get drag coefficient for given velocity and BC type
function getDragCoefficient(velocityFps: number, bcType: 'G1' | 'G7', speedOfSound: number): number {
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

// Calculate speed of sound based on temperature
function calculateSpeedOfSound(tempF: number): number {
  // Speed of sound in fps = SPEED_OF_SOUND_FPS * sqrt(T/518.67) where T is in Rankine
  const tempR = tempF + 459.67
  return SPEED_OF_SOUND_FPS * Math.sqrt(tempR / 518.67)
}

function stepDrag(
  state: SimState, 
  dx_ft: number, 
  bc: number, 
  bcType: 'G1' | 'G7',
  densityRatio: number,
  speedOfSound: number
): SimState {
  const subSteps = Math.max(1, Math.min(10, Math.ceil(dx_ft / 3)))
  const h = dx_ft / subSteps
  let st = { ...state }

  for (let i = 0; i < subSteps; i++) {
    const v = Math.max(1, st.v_fps)
    
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
    const retardation = -(densityRatio * G_FTPS2 * dragFunction) / bc
    
    // Apply retardation to velocity components (negative, opposing motion)
    const vx_new = st.vx_fps + (retardation / v) * st.vx_fps * dt
    const vy_new = st.vy_fps + (retardation / v) * st.vy_fps * dt - G_FTPS2 * dt

    // Use average velocity for position update (trapezoidal integration)
    const vx_avg = 0.5 * (st.vx_fps + vx_new)
    const vy_avg = 0.5 * (st.vy_fps + vy_new)

    st = {
      x_ft: st.x_ft + vx_avg * dt,
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
    : SPEED_OF_SOUND_FPS

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
