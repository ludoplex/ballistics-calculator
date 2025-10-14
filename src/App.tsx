import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Toaster } from '@/components/ui/sonner'
import ProfilesTab from '@/components/ProfilesTab'
import BallisticsTab from '@/components/BallisticsTab'
import ReticleTab from '@/components/ReticleTab'
import TrajectoryTab from '@/components/TrajectoryTab'
import { Calculator, Export } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { BallisticData, TrajectoryResult } from '@/lib/types'
import { calculateTrajectory } from '@/lib/ballistics'

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
    altitude: 1500,
    windSpeed: 14,
    windAngle: 45,
    temperature: 15,
    pressure: 1013,
    humidity: 45,
    densityAltitude: 1800,
    coriolisEnabled: true,
    spinDriftEnabled: true,
    latitude: 42,
    azimuth: 90,
    gyroDrift: 'AUTO',
  })
  
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryResult[]>([])
  const [outputUnit, setOutputUnit] = useState<'MOA' | 'MIL' | 'CM' | 'CLICKS'>('MOA')

  const handleCalculate = () => {
    if (!ballisticData) {
      toast.error('No ballistic data available')
      return
    }
    const results = calculateTrajectory(ballisticData)
    setTrajectoryData(results)
    setActiveTab('trajectory')
    toast.success('Trajectory calculated')
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

    const headers = ['Range (yd)', 'Drop (MOA)', 'Drop (MIL)', 'Wind (MOA)', 'Clicks', 'Velocity (fps)', 'Energy (ft-lb)']
    const rows = trajectoryData.map(d => [
      d.range,
      d.dropMOA.toFixed(2),
      d.dropMIL.toFixed(2),
      d.windMOA.toFixed(2),
      d.clicks,
      d.velocity.toFixed(0),
      d.energy.toFixed(0)
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trajectory-${ballisticData.rifle.replace(/\s+/g, '-')}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Trajectory exported')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">GUNDOM</h1>
          <div className="flex gap-2">
            <Button
              onClick={handleCalculate}
              size="sm"
              className="bg-primary hover:bg-primary/90 md:h-10"
            >
              <Calculator className="md:mr-2" weight="bold" />
              <span className="hidden md:inline">Calculate</span>
            </Button>
            <Button
              onClick={handleExport}
              size="sm"
              className="bg-success hover:bg-success/90 text-success-foreground md:h-10"
            >
              <Export className="md:mr-2" weight="bold" />
              <span className="hidden md:inline">Export</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-3 md:p-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 md:mb-6 bg-card h-auto p-1">
            <TabsTrigger value="profiles" className="text-xs md:text-sm px-2 py-2 md:px-4 md:py-2.5">Profiles</TabsTrigger>
            <TabsTrigger value="ballistics" className="text-xs md:text-sm px-2 py-2 md:px-4 md:py-2.5">Ballistics</TabsTrigger>
            <TabsTrigger value="reticle" className="text-xs md:text-sm px-2 py-2 md:px-4 md:py-2.5">Reticle</TabsTrigger>
            <TabsTrigger value="trajectory" className="text-xs md:text-sm px-2 py-2 md:px-4 md:py-2.5">Trajectory</TabsTrigger>
          </TabsList>

          <TabsContent value="profiles">
            <ProfilesTab data={ballisticData} setData={setBallisticData} />
          </TabsContent>

          <TabsContent value="ballistics">
            <BallisticsTab data={ballisticData} setData={setBallisticData} />
          </TabsContent>

          <TabsContent value="reticle">
            <ReticleTab data={ballisticData} setData={setBallisticData} />
          </TabsContent>

          <TabsContent value="trajectory">
            <TrajectoryTab 
              data={trajectoryData} 
              outputUnit={outputUnit}
              setOutputUnit={setOutputUnit}
              ballisticData={ballisticData}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App