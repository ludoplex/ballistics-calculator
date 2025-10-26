import type { BallisticData } from './types'

export interface SavedProfile {
  id: string
  name: string
  data: BallisticData
  createdAt: number
  updatedAt: number
}

export const DEFAULT_PROFILES: SavedProfile[] = [
  {
    id: 'default-1',
    name: 'Rem 700, .308 Win - TTSX 168gr',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data: {
      rifle: 'Rem 700, .308 Win',
      cartridge: 'TTSX 168gr',
      presetBank: 'Custom 01',
      zeroDistance: 100,
      scopeHeight: 1.75,
      focalPlane: 'FFP',
      magnification: 10,
      muzzleVelocity: 2600,
      ballisticCoefficient: 0.475,
      bcType: 'G7',
      bulletMass: 168,
      barrelTwist: '1:10',
      twistDirection: 'RH',
      turretUnits: 'MOA',
      clickValue: 0.25,
      zeroOffset: 0,
      rifleCant: 0,
      altitude: 0,
      windSpeed: 10,
      windAngle: 90,
      temperature: 15,
      pressure: 1013,
      humidity: 50,
      densityAltitude: 0,
      coriolisEnabled: false,
      spinDriftEnabled: false,
      latitude: 42,
      azimuth: 90,
      gyroDrift: 'AUTO',
    }
  },
  {
    id: 'default-2',
    name: 'AR-15, 5.56 NATO - SMK 77gr',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data: {
      rifle: 'AR-15, 5.56 NATO',
      cartridge: 'SMK 77gr',
      presetBank: 'Factory Default',
      zeroDistance: 50,
      scopeHeight: 2.5,
      focalPlane: 'FFP',
      magnification: 6,
      muzzleVelocity: 2750,
      ballisticCoefficient: 0.372,
      bcType: 'G7',
      bulletMass: 77,
      barrelTwist: '1:7',
      twistDirection: 'RH',
      turretUnits: 'MOA',
      clickValue: 0.25,
      zeroOffset: 0,
      rifleCant: 0,
      altitude: 0,
      windSpeed: 10,
      windAngle: 90,
      temperature: 15,
      pressure: 1013,
      humidity: 50,
      densityAltitude: 0,
      coriolisEnabled: false,
      spinDriftEnabled: false,
      latitude: 42,
      azimuth: 90,
      gyroDrift: 'AUTO',
    }
  },
  {
    id: 'default-3',
    name: 'Tikka T3x, 6.5 CM - ELD-M 140gr',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data: {
      rifle: 'Tikka T3x, 6.5 Creedmoor',
      cartridge: 'ELD-M 140gr',
      presetBank: 'Custom 02',
      zeroDistance: 100,
      scopeHeight: 1.5,
      focalPlane: 'FFP',
      magnification: 15,
      muzzleVelocity: 2710,
      ballisticCoefficient: 0.326,
      bcType: 'G7',
      bulletMass: 140,
      barrelTwist: '1:8',
      twistDirection: 'RH',
      turretUnits: 'MIL',
      clickValue: 0.1,
      zeroOffset: 0,
      rifleCant: 0,
      altitude: 0,
      windSpeed: 10,
      windAngle: 90,
      temperature: 15,
      pressure: 1013,
      humidity: 50,
      densityAltitude: 0,
      coriolisEnabled: false,
      spinDriftEnabled: true,
      latitude: 42,
      azimuth: 90,
      gyroDrift: 'AUTO',
    }
  }
]

export function generateProfileId(): string {
  return `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function createProfile(name: string, data: BallisticData): SavedProfile {
  return {
    id: generateProfileId(),
    name,
    data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function updateProfile(profile: SavedProfile, data: Partial<BallisticData>): SavedProfile {
  return {
    ...profile,
    data: { ...profile.data, ...data },
    updatedAt: Date.now(),
  }
}

export function validateBallisticData(data: Partial<BallisticData>): string[] {
  const errors: string[] = []

  if (data.muzzleVelocity !== undefined && (data.muzzleVelocity < 500 || data.muzzleVelocity > 4500)) {
    errors.push('Muzzle velocity must be between 500-4500 fps')
  }

  if (data.ballisticCoefficient !== undefined && (data.ballisticCoefficient < 0.1 || data.ballisticCoefficient > 1.0)) {
    errors.push('Ballistic coefficient must be between 0.1-1.0')
  }

  if (data.zeroDistance !== undefined && data.zeroDistance <= 0) {
    errors.push('Zero distance must be greater than 0')
  }

  if (data.scopeHeight !== undefined && data.scopeHeight <= 0) {
    errors.push('Scope height must be greater than 0')
  }

  if (data.bulletMass !== undefined && data.bulletMass <= 0) {
    errors.push('Bullet mass must be greater than 0')
  }

  if (data.temperature !== undefined && (data.temperature < -40 || data.temperature > 60)) {
    errors.push('Temperature must be between -40°C and 60°C')
  }

  if (data.altitude !== undefined && (data.altitude < 0 || data.altitude > 5000)) {
    errors.push('Altitude must be between 0-5000m')
  }

  return errors
}
