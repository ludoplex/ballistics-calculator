import type { BallisticData, TrajectoryResult } from './types'

const G_FTPS2 = 32.174
const FEET_PER_YARD = 3
const INCHES_PER_FOOT = 12
const INCHES_PER_YARD = 36
const MOA_INCHES_100Y = 1.0471975511965976
const INCHES_PER_YARD_PER_MIL = INCHES_PER_YARD * 0.001

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

function g7ToG1(bcG7: number): number {
  return bcG7 * 0.512
}

function normalizeInputs(data: BallisticData) {
  const muzzleVelocityFps: number = data.muzzleVelocity ?? 2600
  const bcRaw: number = data.ballisticCoefficient ?? 0.475
  const bcType: 'G1' | 'G7' = data.bcType ?? 'G7'
  const bcG1: number = bcType === 'G7' ? g7ToG1(bcRaw) : bcRaw
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
    bcG1,
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

function stepDrag(state: SimState, dx_ft: number, bc: number, rho: number): SimState {
  const subSteps = Math.max(1, Math.min(10, Math.ceil(dx_ft / 3)))
  const h = dx_ft / subSteps
  let st = { ...state }

  for (let i = 0; i < subSteps; i++) {
    const v = Math.max(1, st.v_fps)
    const dt = h / v
    
    const dragCoef = (rho / bc) * v * dt
    const dragFactor = 1 / (1 + dragCoef)
    
    let vx = st.vx_fps * dragFactor
    let vy = st.vy_fps * dragFactor - G_FTPS2 * dt

    const vx_avg = 0.5 * (st.vx_fps + vx)
    const vy_avg = 0.5 * (st.vy_fps + vy)

    st = {
      x_ft: st.x_ft + h,
      y_ft: st.y_ft + vy_avg * dt,
      vx_fps: vx,
      vy_fps: vy,
      v_fps: Math.hypot(vx, vy),
      t_s: st.t_s + dt,
    }
  }

  return st
}

function solveBoreAngle(
  v0_fps: number,
  bc: number,
  rho: number,
  zeroRangeYards: number,
  sightHeightFeet: number
) {
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
      st = stepDrag(st, step, bc, rho)
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
    bcG1,
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
  } = inputs

  const sigma = getDensityRatio(inputs)
  const rho = 1.2e-4 * sigma

  const sightHeightFeet = sightHeightInches / INCHES_PER_FOOT
  const boreAngle = solveBoreAngle(muzzleVelocityFps, bcG1, rho, zeroRangeYards, sightHeightFeet)

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

    st = stepDrag(st, step, bcG1, rho)

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
