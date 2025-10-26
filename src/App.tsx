import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import ProfilesTab from '@/components/ProfilesTab'
import BallisticsTab from '@/components/BallisticsTab'
import ReticleTab from '@/components/ReticleTab'
import TrajectoryTab from '@/components/TrajectoryTab'
import { Calculator, Export, Target } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { BallisticData, TrajectoryResult } from '@/lib/types'
import { calculateTrajectory } from '@/lib/ballistics'
import { validateBallisticData } from '@/lib/profiles'

function App() {
  const [activeTab, setActiveTab] = useState('profiles')
  const [ballisticData, setBallisticData] = useKV<BallisticData>('ballistic-data', {
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
  })
  
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryResult[]>([])
  const [outputUnit, setOutputUnit] = useState<'MOA' | 'MIL' | 'CM' | 'CLICKS'>('MOA')
  const [calculating, setCalculating] = useState(false)
  const [hasCalculated, setHasCalculated] = useState(false)

  useEffect(() => {
    if (ballisticData) {
      setHasCalculated(false)
    }
  }, [ballisticData])

  const handleCalculate = () => {
    if (!ballisticData) {
      toast.error('No ballistic data available')
      return
    }

    const errors = validateBallisticData(ballisticData)
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
      return
    }

    setCalculating(true)
    
    setTimeout(() => {
      try {
        const results = calculateTrajectory(ballisticData)
        setTrajectoryData(results)
        setActiveTab('trajectory')
        setHasCalculated(true)
        
        const subsonicTransition = results.find(r => r.velocity < 1125)
        if (subsonicTransition) {
          toast.warning(`Subsonic at ${subsonicTransition.range} yards - reduced accuracy`, {
            duration: 5000,
          })
        }
        
        toast.success('Trajectory calculated successfully')
      } catch (error) {
        toast.error('Calculation error - check inputs')
        console.error('Calculation error:', error)
      } finally {
        setCalculating(false)
      }
    }, 100)
  }

  const handleExport = () => {
    if (trajectoryData.length === 0) {
      toast.error('Calculate trajectory first')
      return
    }

    if (!ballisticData) {
      toast.error('No ballistic data available')
      return
    }

    const timestamp = new Date().toISOString().split('T')[0]
    const headers = ['Range (yd)', 'Drop (MOA)', 'Drop (MIL)', 'Drop (in)', 'Wind (MOA)', 'Wind (MIL)', 'Wind (in)', 'Clicks', 'Velocity (fps)', 'Energy (ft-lb)', 'Time (s)']
    const rows = trajectoryData.map(d => [
      d.range,
      d.dropMOA.toFixed(2),
      d.dropMIL.toFixed(2),
      d.dropInches.toFixed(1),
      d.windMOA.toFixed(2),
      d.windMIL.toFixed(2),
      d.windInches.toFixed(1),
      d.clicks,
      d.velocity.toFixed(0),
      d.energy.toFixed(0),
      d.time.toFixed(3),
    ])

    const metadata = [
      `# Ballistic Solution - ${ballisticData.rifle}`,
      `# Cartridge: ${ballisticData.cartridge}`,
      `# Zero: ${ballisticData.zeroDistance} yd`,
      `# Muzzle Velocity: ${ballisticData.muzzleVelocity} fps`,
      `# BC: ${ballisticData.ballisticCoefficient} (${ballisticData.bcType})`,
      `# Conditions: ${ballisticData.temperature}°C, ${ballisticData.pressure} hPa, Wind ${ballisticData.windSpeed} mph @ ${ballisticData.windAngle}°`,
      `# Date: ${timestamp}`,
      '',
    ]

    const csv = [...metadata, headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ballistics-${ballisticData.rifle.replace(/\s+/g, '-')}-${timestamp}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Trajectory data exported')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      <header className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="text-accent hidden sm:block" weight="bold" size={24} />
            <h1 className="text-lg md:text-2xl font-bold tracking-tight">GUNDOM</h1>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCalculate}
              size="sm"
              disabled={calculating}
              className="bg-primary hover:bg-primary/90 md:h-10 transition-all"
            >
              <Calculator className="md:mr-2" weight="bold" size={18} />
              <span className="hidden md:inline">{calculating ? 'Calculating...' : 'Calculate'}</span>
            </Button>
            <Button
              onClick={handleExport}
              size="sm"
              disabled={trajectoryData.length === 0}
              className="bg-success hover:bg-success/90 text-success-foreground md:h-10 transition-all"
            >
              <Export className="md:mr-2" weight="bold" size={18} />
              <span className="hidden md:inline">Export</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-3 md:p-4 pb-6 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 md:mb-6 bg-card h-auto p-1 border border-border">
            <TabsTrigger value="profiles" className="text-xs md:text-sm px-2 py-2 md:px-4 md:py-2.5 transition-all">
              Profiles
            </TabsTrigger>
            <TabsTrigger value="ballistics" className="text-xs md:text-sm px-2 py-2 md:px-4 md:py-2.5 transition-all">
              Ballistics
            </TabsTrigger>
            <TabsTrigger value="reticle" className="text-xs md:text-sm px-2 py-2 md:px-4 md:py-2.5 transition-all">
              Environment
            </TabsTrigger>
            <TabsTrigger 
              value="trajectory" 
              className="text-xs md:text-sm px-2 py-2 md:px-4 md:py-2.5 transition-all relative"
            >
              Trajectory
              {hasCalculated && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-success rounded-full animate-pulse" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="animate-in fade-in-50 duration-300">
            <ProfilesTab data={ballisticData} setData={setBallisticData} />
          </TabsContent>

          <TabsContent value="ballistics" className="animate-in fade-in-50 duration-300">
            <BallisticsTab data={ballisticData} setData={setBallisticData} />
          </TabsContent>

          <TabsContent value="reticle" className="animate-in fade-in-50 duration-300">
            <ReticleTab data={ballisticData} setData={setBallisticData} />
          </TabsContent>

          <TabsContent value="trajectory" className="animate-in fade-in-50 duration-300">
            <TrajectoryTab 
              data={trajectoryData} 
              outputUnit={outputUnit}
              setOutputUnit={setOutputUnit}
              ballisticData={ballisticData}
            />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border mt-8 py-4">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>Professional ballistics calculator for long-range shooting</p>
          <p className="mt-1 opacity-70">Always verify calculations with real-world testing</p>
        </div>
      </footer>
    </div>
  )
}

export default App