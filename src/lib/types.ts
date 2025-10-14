export interface BallisticData {
  rifle: string
  cartridge: string
  presetBank: string
  zeroDistance: number
  scopeHeight: number
  focalPlane: 'FFP' | 'SFP'
  magnification: number
  muzzleVelocity: number
  ballisticCoefficient: number
  bcType: 'G1' | 'G7'
  bulletMass: number
  barrelTwist: string
  twistDirection: 'RH' | 'LH'
  turretUnits: 'MOA' | 'MIL'
  clickValue: number
  zeroOffset: number
  rifleCant: number
  altitude: number
  windSpeed: number
  windAngle: number
  temperature: number
  pressure: number
  humidity: number
  densityAltitude: number
  coriolisEnabled: boolean
  spinDriftEnabled: boolean
  latitude: number
  azimuth: number
  gyroDrift: string
}

export interface TrajectoryResult {
  range: number
  dropMOA: number
  dropMIL: number
  dropInches: number
  windMOA: number
  windMIL: number
  windInches: number
  clicks: number
  velocity: number
  energy: number
  time: number
}
