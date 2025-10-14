import type { BallisticData, TrajectoryResult } from './types'

const G1_DRAG = [
  { mach: 0, cd: 0.2629 },
  { mach: 0.5, cd: 0.2558 },
  { mach: 0.8, cd: 0.2487 },
  { mach: 1.0, cd: 0.2937 },
  { mach: 1.2, cd: 0.3281 },
  { mach: 1.5, cd: 0.3644 },
  { mach: 2.0, cd: 0.3831 },
  { mach: 3.0, cd: 0.3658 },
]

const G7_DRAG = [
  { mach: 0, cd: 0.1198 },
  { mach: 0.5, cd: 0.1197 },
  { mach: 0.8, cd: 0.1196 },
  { mach: 1.0, cd: 0.1206 },
  { mach: 1.2, cd: 0.1291 },
  { mach: 1.5, cd: 0.1462 },
  { mach: 2.0, cd: 0.1731 },
  { mach: 3.0, cd: 0.2075 },
]

function getDragCoefficient(velocity: number, bcType: 'G1' | 'G7'): number {
  const speedOfSound = 1116.45
  const mach = velocity / speedOfSound
  const dragTable = bcType === 'G7' ? G7_DRAG : G1_DRAG

  if (mach <= dragTable[0].mach) return dragTable[0].cd
  if (mach >= dragTable[dragTable.length - 1].mach) return dragTable[dragTable.length - 1].cd

  for (let i = 0; i < dragTable.length - 1; i++) {
    if (mach >= dragTable[i].mach && mach <= dragTable[i + 1].mach) {
      const t = (mach - dragTable[i].mach) / (dragTable[i + 1].mach - dragTable[i].mach)
      return dragTable[i].cd + t * (dragTable[i + 1].cd - dragTable[i].cd)
    }
  }

  return dragTable[0].cd
}

function calculateAirDensity(temp: number, pressure: number, humidity: number, altitude: number): number {
  const tempK = (temp + 273.15)
  const pressurePa = pressure * 100
  const altitudeM = altitude
  
  const satVaporPressure = 611.21 * Math.exp((18.678 - temp / 234.5) * (temp / (257.14 + temp)))
  const vaporPressure = (humidity / 100) * satVaporPressure
  const dryAirPressure = pressurePa - vaporPressure
  
  const density = (dryAirPressure / (287.05 * tempK)) + (vaporPressure / (461.495 * tempK))
  const altitudeFactor = Math.exp(-altitudeM / 8500)
  
  return density * altitudeFactor
}

export function calculateTrajectory(data: BallisticData): TrajectoryResult[] {
  if (data.muzzleVelocity < 500 || data.muzzleVelocity > 4500) {
    throw new Error('Muzzle velocity must be between 500-4500 fps')
  }
  if (data.ballisticCoefficient < 0.1 || data.ballisticCoefficient > 1.0) {
    throw new Error('Ballistic coefficient must be between 0.1-1.0')
  }
  if (data.zeroDistance <= 0 || data.zeroDistance > 1000) {
    throw new Error('Zero distance must be between 1-1000 yards')
  }
  
  const results: TrajectoryResult[] = []
  const dt = 0.001
  const ranges = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
  
  const zeroDistanceYards = data.zeroDistance
  const scopeHeightInches = data.scopeHeight
  const muzzleVelocityFPS = data.muzzleVelocity
  const bc = data.ballisticCoefficient
  const bulletMassGrains = data.bulletMass
  const windSpeedMPH = data.windSpeed
  const windAngleDeg = data.windAngle
  
  const airDensity = calculateAirDensity(data.temperature, data.pressure, data.humidity, data.altitude)
  const standardDensity = 1.225
  const densityRatio = airDensity / standardDensity
  
  const bulletMassLbs = bulletMassGrains / 7000
  const gravity = 32.174
  
  const windComponent = windSpeedMPH * Math.cos((windAngleDeg * Math.PI) / 180) * 1.467
  
  let zeroAngle = 0
  for (let attempt = 0; attempt < 20; attempt++) {
    let vx = muzzleVelocityFPS * Math.cos(zeroAngle)
    let vy = muzzleVelocityFPS * Math.sin(zeroAngle)
    let x = 0
    let y = -scopeHeightInches / 12
    
    while (x < zeroDistanceYards * 3) {
      const v = Math.sqrt(vx * vx + vy * vy)
      const cd = getDragCoefficient(v, data.bcType)
      const drag = 0.5 * densityRatio * cd * v * v / bc
      
      const ax = -(drag * vx) / (bulletMassLbs * 7000)
      const ay = -gravity - (drag * vy) / (bulletMassLbs * 7000)
      
      vx += ax * dt
      vy += ay * dt
      x += vx * dt
      y += vy * dt
      
      if (x >= zeroDistanceYards * 3) {
        const error = y * 12
        zeroAngle += error / (zeroDistanceYards * 36) * 0.5
        break
      }
    }
  }
  
  for (const rangeYards of ranges) {
    let vx = muzzleVelocityFPS * Math.cos(zeroAngle)
    let vy = muzzleVelocityFPS * Math.sin(zeroAngle)
    let vz = 0
    let x = 0
    let y = -scopeHeightInches / 12
    let z = 0
    let time = 0
    
    while (x < rangeYards * 3) {
      const v = Math.sqrt(vx * vx + vy * vy)
      const cd = getDragCoefficient(v, data.bcType)
      const drag = 0.5 * densityRatio * cd * v * v / bc
      
      const ax = -(drag * vx) / (bulletMassLbs * 7000)
      const ay = -gravity - (drag * vy) / (bulletMassLbs * 7000)
      const az = windComponent * 0.01
      
      vx += ax * dt
      vy += ay * dt
      vz += az * dt
      x += vx * dt
      y += vy * dt
      z += vz * dt
      time += dt
      
      if (x >= rangeYards * 3) break
    }
    
    const dropInches = y * 12
    const windInches = z * 12
    const dropMOA = (Math.atan2(dropInches, rangeYards * 36) * 180 / Math.PI) * 60
    const windMOA = (Math.atan2(windInches, rangeYards * 36) * 180 / Math.PI) * 60
    const dropMIL = dropMOA / 3.43775
    const windMIL = windMOA / 3.43775
    const velocity = Math.sqrt(vx * vx + vy * vy)
    const energy = 0.5 * bulletMassLbs * velocity * velocity
    const clicks = Math.round(Math.abs(dropMOA) / data.clickValue)
    
    results.push({
      range: rangeYards,
      dropMOA,
      dropMIL,
      dropInches,
      windMOA,
      windMIL,
      windInches,
      clicks,
      velocity,
      energy,
      time,
    })
  }
  
  return results
}
