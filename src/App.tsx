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
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">GUNDOM</h1>
          <div className="flex gap-2">
            <Button
              onClick={handleCalculate}
              className="bg-primary hover:bg-primary/90"
            >
              <Calculator className="mr-2" weight="bold" />
              Calculate
            </Button>
            <Button
              onClick={handleExport}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              <Export className="mr-2" weight="bold" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-card">
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
            <TabsTrigger value="ballistics">Ballistics</TabsTrigger>
            <TabsTrigger value="reticle">Reticle</TabsTrigger>
            <TabsTrigger value="trajectory">Trajectory</TabsTrigger>
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