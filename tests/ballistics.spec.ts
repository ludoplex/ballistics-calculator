import { describe, it, expect } from 'vitest'
import { 
  interpolateDrag, 
  getDragCoefficient, 
  calculateSpeedOfSound,
  calculateTrajectory,
  BC_MIN,
  MIN_VELOCITY_FPS,
  DEFAULT_SPEED_OF_SOUND_FPS
} from '@/lib/ballistics'
import { G1_DRAG_TABLE, G7_DRAG_TABLE } from '@/lib/drag-tables'
import type { BallisticData } from '@/lib/types'

describe('Ballistics Calculations', () => {
  describe('interpolateDrag', () => {
    it('should return first value for Mach below table range', () => {
      const result = interpolateDrag(G1_DRAG_TABLE, -0.5)
      expect(result).toBe(G1_DRAG_TABLE[0][1])
    })

    it('should return last value for Mach above table range', () => {
      const result = interpolateDrag(G1_DRAG_TABLE, 10.0)
      expect(result).toBe(G1_DRAG_TABLE[G1_DRAG_TABLE.length - 1][1])
    })

    it('should return exact value for table entry', () => {
      const mach = 1.0
      const expectedCd = G1_DRAG_TABLE.find(([m]) => m === mach)?.[1]
      const result = interpolateDrag(G1_DRAG_TABLE, mach)
      expect(result).toBe(expectedCd)
    })

    it('should linearly interpolate between two table values', () => {
      // Test interpolation between Mach 0.0 and 0.05
      const mach = 0.025 // Midpoint
      const cd1 = G1_DRAG_TABLE[0][1] // 0.2629 at Mach 0.0
      const cd2 = G1_DRAG_TABLE[1][1] // 0.2558 at Mach 0.05
      const expected = cd1 + 0.5 * (cd2 - cd1)
      const result = interpolateDrag(G1_DRAG_TABLE, mach)
      expect(result).toBeCloseTo(expected, 6)
    })
  })

  describe('getDragCoefficient', () => {
    it('should return G1 drag coefficient for subsonic velocity', () => {
      const velocity = 800 // fps, subsonic
      const speedOfSound = DEFAULT_SPEED_OF_SOUND_FPS
      const result = getDragCoefficient(velocity, 'G1', speedOfSound)
      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(2)
    })

    it('should return G7 drag coefficient for supersonic velocity', () => {
      const velocity = 2600 // fps, supersonic
      const speedOfSound = DEFAULT_SPEED_OF_SOUND_FPS
      const result = getDragCoefficient(velocity, 'G7', speedOfSound)
      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(2)
    })

    it('should handle G7 vs G1 differences - G7 should be lower for same velocity', () => {
      const velocity = 2600 // fps
      const speedOfSound = DEFAULT_SPEED_OF_SOUND_FPS
      const g1 = getDragCoefficient(velocity, 'G1', speedOfSound)
      const g7 = getDragCoefficient(velocity, 'G7', speedOfSound)
      // G7 is optimized for boat-tail bullets and should have lower drag
      expect(g7).toBeLessThan(g1)
    })

    it('should guard against division by zero with MIN_VELOCITY_FPS', () => {
      const result = getDragCoefficient(1000, 'G1', 0) // speedOfSound = 0
      // Should not throw, should use MIN_VELOCITY_FPS as safeguard
      expect(result).toBeGreaterThan(0)
    })
  })

  describe('calculateSpeedOfSound', () => {
    it('should return DEFAULT_SPEED_OF_SOUND_FPS at 59°F (standard temp)', () => {
      const result = calculateSpeedOfSound(59)
      expect(result).toBeCloseTo(DEFAULT_SPEED_OF_SOUND_FPS, 1)
    })

    it('should increase speed of sound with temperature', () => {
      const cold = calculateSpeedOfSound(32) // Freezing
      const hot = calculateSpeedOfSound(100) // Hot day
      expect(hot).toBeGreaterThan(cold)
    })

    it('should calculate reasonable values across temperature range', () => {
      const result = calculateSpeedOfSound(32) // 32°F (0°C)
      expect(result).toBeGreaterThan(1000)
      expect(result).toBeLessThan(1200)
    })
  })

  describe('calculateTrajectory - smoke test', () => {
    it('should calculate a complete trajectory without errors', () => {
      const testData: BallisticData = {
        rifle: 'Test Rifle',
        cartridge: '.308 Win',
        presetBank: 'custom',
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
        temperature: 59,
        pressure: 1013,
        humidity: 50,
        densityAltitude: 0,
        coriolisEnabled: false,
        spinDriftEnabled: false,
        latitude: 0,
        azimuth: 0,
        gyroDrift: '0',
      }

      const results = calculateTrajectory(testData)

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)

      // Check first result
      const firstResult = results[0]
      expect(firstResult.range).toBeGreaterThan(0)
      expect(firstResult.velocity).toBeGreaterThan(0)
      expect(firstResult.energy).toBeGreaterThan(0)
      expect(firstResult.time).toBeGreaterThanOrEqual(0)

      // Verify velocity decreases over range
      const lastResult = results[results.length - 1]
      expect(lastResult.velocity).toBeLessThan(firstResult.velocity)
    })

    it('should handle minimum BC without throwing', () => {
      const testData: BallisticData = {
        rifle: 'Test',
        cartridge: 'Test',
        presetBank: 'custom',
        zeroDistance: 100,
        scopeHeight: 1.75,
        focalPlane: 'FFP',
        magnification: 10,
        muzzleVelocity: 2600,
        ballisticCoefficient: 0.001, // Very low, should be clamped to BC_MIN
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
        temperature: 59,
        pressure: 1013,
        humidity: 50,
        densityAltitude: 0,
        coriolisEnabled: false,
        spinDriftEnabled: false,
        latitude: 0,
        azimuth: 0,
        gyroDrift: '0',
      }

      // Should not throw, should clamp to BC_MIN
      const results = calculateTrajectory(testData)
      expect(results).toBeDefined()
      expect(results.length).toBeGreaterThan(0)
    })

    it('should produce different results for G1 vs G7', () => {
      const baseData: BallisticData = {
        rifle: 'Test',
        cartridge: 'Test',
        presetBank: 'custom',
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
        temperature: 59,
        pressure: 1013,
        humidity: 50,
        densityAltitude: 0,
        coriolisEnabled: false,
        spinDriftEnabled: false,
        latitude: 0,
        azimuth: 0,
        gyroDrift: '0',
      }

      const g7Results = calculateTrajectory({ ...baseData, bcType: 'G7' })
      const g1Results = calculateTrajectory({ ...baseData, bcType: 'G1' })

      // Results should be different for G1 vs G7
      const g7_500yd = g7Results.find(r => r.range === 500)
      const g1_500yd = g1Results.find(r => r.range === 500)
      
      expect(g7_500yd).toBeDefined()
      expect(g1_500yd).toBeDefined()
      expect(g7_500yd!.dropInches).not.toBe(g1_500yd!.dropInches)
    })
  })

  describe('Drag table boundaries', () => {
    it('G1 drag coefficients should be in expected range', () => {
      G1_DRAG_TABLE.forEach(([mach, cd]) => {
        expect(cd).toBeGreaterThan(0.1)
        expect(cd).toBeLessThan(1.5)
      })
    })

    it('G7 drag coefficients should be in expected range', () => {
      G7_DRAG_TABLE.forEach(([mach, cd]) => {
        expect(cd).toBeGreaterThan(0.05)
        expect(cd).toBeLessThan(1.0)
      })
    })

    it('G7 should have lower drag than G1 across most Mach numbers', () => {
      // Sample a few Mach numbers
      const testMachs = [0.5, 1.0, 1.5, 2.0, 3.0]
      testMachs.forEach(mach => {
        const g1Cd = interpolateDrag(G1_DRAG_TABLE, mach)
        const g7Cd = interpolateDrag(G7_DRAG_TABLE, mach)
        // G7 (boat-tail) should have lower drag
        expect(g7Cd).toBeLessThan(g1Cd)
      })
    })
  })

  describe('Safety constants', () => {
    it('BC_MIN should be a small positive number', () => {
      expect(BC_MIN).toBeGreaterThan(0)
      expect(BC_MIN).toBeLessThan(0.1)
    })

    it('MIN_VELOCITY_FPS should be a small positive number', () => {
      expect(MIN_VELOCITY_FPS).toBeGreaterThan(0)
      expect(MIN_VELOCITY_FPS).toBeLessThan(10)
    })

    it('DEFAULT_SPEED_OF_SOUND_FPS should be reasonable', () => {
      expect(DEFAULT_SPEED_OF_SOUND_FPS).toBeGreaterThan(1000)
      expect(DEFAULT_SPEED_OF_SOUND_FPS).toBeLessThan(1200)
    })
  })
})
