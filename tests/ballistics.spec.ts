import { describe, it, expect } from 'vitest'
import { calculateTrajectory, interpolateDrag, getDragCoefficient } from '../src/lib/ballistics'
import { G1_DRAG_TABLE, G7_DRAG_TABLE } from '../src/lib/drag-tables'
import type { BallisticData } from '../src/lib/types'

describe('Drag Table Interpolation', () => {
  describe('interpolateDrag', () => {
    it('should return exact value for table entry - G1', () => {
      const mach = 1.00
      const cd = interpolateDrag(G1_DRAG_TABLE, mach)
      expect(cd).toBe(0.2901)
    })

    it('should return exact value for table entry - G7', () => {
      const mach = 1.20
      const cd = interpolateDrag(G7_DRAG_TABLE, mach)
      expect(cd).toBe(0.1645)
    })

    it('should interpolate midpoint correctly - G1', () => {
      // Between Mach 1.00 (0.2901) and Mach 1.02 (0.2990)
      const mach = 1.01
      const cd = interpolateDrag(G1_DRAG_TABLE, mach)
      const expected = 0.2901 + 0.5 * (0.2990 - 0.2901)
      expect(cd).toBeCloseTo(expected, 4)
    })

    it('should interpolate midpoint correctly - G7', () => {
      // Between Mach 0.50 (0.1194) and Mach 0.55 (0.1193)
      const mach = 0.525
      const cd = interpolateDrag(G7_DRAG_TABLE, mach)
      const expected = 0.1194 + 0.5 * (0.1193 - 0.1194)
      expect(cd).toBeCloseTo(expected, 4)
    })

    it('should handle below-minimum Mach number', () => {
      const cd = interpolateDrag(G1_DRAG_TABLE, -0.5)
      expect(cd).toBe(G1_DRAG_TABLE[0][1])
    })

    it('should handle above-maximum Mach number', () => {
      const cd = interpolateDrag(G7_DRAG_TABLE, 10.0)
      expect(cd).toBe(G7_DRAG_TABLE[G7_DRAG_TABLE.length - 1][1])
    })
  })

  describe('getDragCoefficient', () => {
    it('should return correct Cd for exact Mach match - G1', () => {
      const speedOfSound = 1116.4
      const velocity = 1116.4 // Mach 1.0
      const cd = getDragCoefficient(velocity, 'G1', speedOfSound)
      expect(cd).toBe(0.2901)
    })

    it('should return correct Cd for exact Mach match - G7', () => {
      const speedOfSound = 1116.4
      const velocity = 558.2 // Mach 0.5
      const cd = getDragCoefficient(velocity, 'G7', speedOfSound)
      expect(cd).toBe(0.1194)
    })

    it('should handle very low velocity (below table minimum)', () => {
      const speedOfSound = 1116.4
      const velocity = 10 // Very low velocity
      const cd = getDragCoefficient(velocity, 'G1', speedOfSound)
      expect(cd).toBe(G1_DRAG_TABLE[0][1])
    })

    it('should handle very high velocity (above table maximum)', () => {
      const speedOfSound = 1116.4
      const velocity = 6000 // Very high velocity
      const cd = getDragCoefficient(velocity, 'G7', speedOfSound)
      expect(cd).toBe(G7_DRAG_TABLE[G7_DRAG_TABLE.length - 1][1])
    })
  })
})

describe('Ballistic Trajectory Calculations', () => {
  describe('calculateTrajectory', () => {
    it('should calculate trajectory for basic input', () => {
      const data: BallisticData = {
        rifle: 'Test Rifle',
        cartridge: '.308 Winchester',
        presetBank: 'default',
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
        windSpeed: 0,
        windAngle: 90,
        temperature: 15,
        pressure: 1013.25,
        humidity: 50,
        densityAltitude: 0,
        coriolisEnabled: false,
        spinDriftEnabled: false,
        latitude: 0,
        azimuth: 0,
        gyroDrift: '0',
      }

      const results = calculateTrajectory(data)
      
      // Basic sanity checks
      expect(results).toBeDefined()
      expect(results.length).toBeGreaterThan(0)
      
      // First result should be at 25 yards (first step)
      expect(results[0].range).toBe(25)
      
      // Velocity should decrease with range
      expect(results[results.length - 1].velocity).toBeLessThan(results[0].velocity)
      
      // Energy should decrease with range
      expect(results[results.length - 1].energy).toBeLessThan(results[0].energy)
      
      // Drop should increase with range (positive drop = below line of sight)
      expect(results[results.length - 1].dropInches).toBeGreaterThan(results[0].dropInches)
    })

    it('should handle zero drag scenario (density ratio = 0)', () => {
      // This tests the solver's baseline behavior without drag
      // In vacuum, projectile follows parabolic trajectory with only gravity
      const data: BallisticData = {
        rifle: 'Test Rifle',
        cartridge: 'Test',
        presetBank: 'default',
        zeroDistance: 100,
        scopeHeight: 1.75,
        focalPlane: 'FFP',
        magnification: 10,
        muzzleVelocity: 1000, // Low velocity for easier calculation
        ballisticCoefficient: 0.5,
        bcType: 'G1',
        bulletMass: 150,
        barrelTwist: '1:10',
        twistDirection: 'RH',
        turretUnits: 'MOA',
        clickValue: 0.25,
        zeroOffset: 0,
        rifleCant: 0,
        altitude: 0,
        windSpeed: 0,
        windAngle: 90,
        temperature: 15,
        pressure: 0, // Zero pressure = zero density ratio (no drag)
        humidity: 50,
        densityAltitude: 0,
        coriolisEnabled: false,
        spinDriftEnabled: false,
        latitude: 0,
        azimuth: 0,
        gyroDrift: '0',
      }

      const results = calculateTrajectory(data)
      
      // Should still calculate trajectory
      expect(results).toBeDefined()
      expect(results.length).toBeGreaterThan(0)
      
      // Without drag, velocity should remain constant (within numerical error)
      // Note: Due to numerical integration, there may be small variations
      const velocityVariation = Math.abs(results[0].velocity - results[1].velocity)
      expect(velocityVariation).toBeLessThan(5) // Allow small numerical error
    })

    it('should handle invalid BC gracefully (test BC safety clamping)', () => {
      const data: BallisticData = {
        rifle: 'Test Rifle',
        cartridge: 'Test',
        presetBank: 'default',
        zeroDistance: 100,
        scopeHeight: 1.75,
        focalPlane: 'FFP',
        magnification: 10,
        muzzleVelocity: 2600,
        ballisticCoefficient: 0, // Invalid BC (zero)
        bcType: 'G7',
        bulletMass: 168,
        barrelTwist: '1:10',
        twistDirection: 'RH',
        turretUnits: 'MOA',
        clickValue: 0.25,
        zeroOffset: 0,
        rifleCant: 0,
        altitude: 0,
        windSpeed: 0,
        windAngle: 90,
        temperature: 15,
        pressure: 1013.25,
        humidity: 50,
        densityAltitude: 0,
        coriolisEnabled: false,
        spinDriftEnabled: false,
        latitude: 0,
        azimuth: 0,
        gyroDrift: '0',
      }

      // Should not throw error due to BC clamping
      expect(() => calculateTrajectory(data)).not.toThrow()
      
      const results = calculateTrajectory(data)
      expect(results).toBeDefined()
      expect(results.length).toBeGreaterThan(0)
    })

    it('should calculate wind drift when wind is present', () => {
      const noWindData: BallisticData = {
        rifle: 'Test Rifle',
        cartridge: '.308 Winchester',
        presetBank: 'default',
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
        windSpeed: 0,
        windAngle: 90,
        temperature: 15,
        pressure: 1013.25,
        humidity: 50,
        densityAltitude: 0,
        coriolisEnabled: false,
        spinDriftEnabled: false,
        latitude: 0,
        azimuth: 0,
        gyroDrift: '0',
      }

      const windData: BallisticData = {
        ...noWindData,
        windSpeed: 10, // 10 mph crosswind
      }

      const noWindResults = calculateTrajectory(noWindData)
      const windResults = calculateTrajectory(windData)
      
      // Wind drift should be zero without wind
      expect(noWindResults[0].windInches).toBe(0)
      
      // Wind drift should be non-zero with wind
      expect(windResults[windResults.length - 1].windInches).toBeGreaterThan(0)
      
      // Wind drift should increase with range
      expect(windResults[windResults.length - 1].windInches).toBeGreaterThan(windResults[0].windInches)
    })
  })
})
