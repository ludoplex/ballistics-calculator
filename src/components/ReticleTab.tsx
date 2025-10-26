import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Wind, ThermometerSimple, Gauge } from '@phosphor-icons/react'
import type { BallisticData } from '@/lib/types'

interface ReticleTabProps {
  data: BallisticData | undefined
  setData: (data: BallisticData | ((prev: BallisticData | undefined) => BallisticData)) => void
}

export default function ReticleTab({ data, setData }: ReticleTabProps) {
  if (!data) return null

  const handleNumberInput = (field: keyof BallisticData, value: string, min?: number, max?: number) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return
    
    let finalValue = numValue
    if (min !== undefined && numValue < min) finalValue = min
    if (max !== undefined && numValue > max) finalValue = max
    
    setData((prev) => ({ ...prev!, [field]: finalValue }))
  }

  const windDirections = [
    { deg: 0, label: 'N' },
    { deg: 45, label: 'NE' },
    { deg: 90, label: 'E' },
    { deg: 135, label: 'SE' },
    { deg: 180, label: 'S' },
    { deg: 225, label: 'SW' },
    { deg: 270, label: 'W' },
    { deg: 315, label: 'NW' },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wind className="text-accent" weight="bold" size={20} />
          <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Wind</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="wind-speed" className="text-xs text-muted-foreground">Speed</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="wind-speed"
                  type="number"
                  min="0"
                  max="100"
                  value={data.windSpeed}
                  onChange={(e) => handleNumberInput('windSpeed', e.target.value, 0, 100)}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm min-w-[3rem]">mph</span>
              </div>
            </div>

            <div>
              <Label htmlFor="wind-angle" className="text-xs text-muted-foreground">Angle</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="wind-angle"
                  type="number"
                  min="0"
                  max="360"
                  value={data.windAngle}
                  onChange={(e) => handleNumberInput('windAngle', e.target.value, 0, 360)}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm min-w-[3rem]">°</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {windDirections.map(({ deg, label }) => (
                <Button
                  key={deg}
                  variant={data.windAngle === deg ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setData((prev) => ({ ...prev!, windAngle: deg }))}
                  className="text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center py-4">
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-card border-2 border-secondary flex items-center justify-center">
              <div className="text-sm text-foreground font-bold absolute top-3">N</div>
              <div className="text-sm text-foreground font-bold absolute right-3">E</div>
              <div className="text-sm text-foreground font-bold absolute bottom-3">S</div>
              <div className="text-sm text-foreground font-bold absolute left-3">W</div>
              
              <svg className="absolute inset-0" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border opacity-30" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border opacity-30" />
                <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border opacity-30" />
                <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border opacity-30" />
                
                <g transform={`rotate(${data.windAngle} 100 100)`}>
                  <line x1="100" y1="100" x2="100" y2="30" stroke="currentColor" strokeWidth="4" className="text-accent" />
                  <polygon points="100,25 95,35 105,35" fill="currentColor" className="text-accent" />
                </g>
              </svg>
              
              <div className="w-3 h-3 rounded-full bg-primary z-10" />
              <div className="absolute bottom-6 bg-muted px-3 py-1 rounded-md">
                <span className="text-accent font-bold text-sm">{data.windSpeed} mph</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <ThermometerSimple className="text-accent" weight="bold" size={20} />
          <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Atmosphere</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="temperature" className="text-xs text-muted-foreground">Temperature</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="temperature"
                type="number"
                min="-40"
                max="60"
                value={data.temperature}
                onChange={(e) => handleNumberInput('temperature', e.target.value, -40, 60)}
                className="bg-muted text-accent font-bold"
              />
              <span className="text-muted-foreground self-center text-sm min-w-[2rem]">°C</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 opacity-70">Valid: -40°C to 60°C</p>
          </div>

          <div>
            <Label htmlFor="pressure" className="text-xs text-muted-foreground">Pressure</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="pressure"
                type="number"
                min="800"
                max="1100"
                value={data.pressure}
                onChange={(e) => handleNumberInput('pressure', e.target.value, 800, 1100)}
                className="bg-muted text-accent font-bold"
              />
              <span className="text-muted-foreground self-center text-sm min-w-[2rem]">hPa</span>
            </div>
          </div>

          <div>
            <Label htmlFor="humidity" className="text-xs text-muted-foreground">Humidity</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="humidity"
                type="number"
                min="0"
                max="100"
                value={data.humidity}
                onChange={(e) => handleNumberInput('humidity', e.target.value, 0, 100)}
                className="bg-muted text-accent font-bold"
              />
              <span className="text-muted-foreground self-center text-sm min-w-[2rem]">%</span>
            </div>
          </div>

          <div>
            <Label htmlFor="density-alt" className="text-xs text-muted-foreground">Density altitude</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="density-alt"
                type="number"
                min="-1000"
                max="5000"
                value={data.densityAltitude}
                onChange={(e) => handleNumberInput('densityAltitude', e.target.value, -1000, 5000)}
                className="bg-muted text-accent font-bold"
              />
              <span className="text-muted-foreground self-center text-sm min-w-[2rem]">m</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-6">
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Reticle Scaffold</h3>
        <div className="relative w-full aspect-[2/1] bg-background rounded-lg border border-secondary overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <line x1="200" y1="0" x2="200" y2="200" stroke="currentColor" strokeWidth="1.5" className="text-secondary" />
            <line x1="100" y1="0" x2="100" y2="200" stroke="currentColor" strokeWidth="0.5" className="text-border opacity-50" />
            <line x1="300" y1="0" x2="300" y2="200" stroke="currentColor" strokeWidth="0.5" className="text-border opacity-50" />
            
            <line x1="0" y1="100" x2="400" y2="100" stroke="currentColor" strokeWidth="1.5" className="text-secondary" />
            <line x1="0" y1="50" x2="400" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-border opacity-50" />
            <line x1="0" y1="150" x2="400" y2="150" stroke="currentColor" strokeWidth="0.5" className="text-border opacity-50" />
            
            <circle cx="200" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent opacity-70" />
            <circle cx="200" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent opacity-70" />
            
            <circle cx="200" cy="100" r="4" className="fill-success" />
            
            {[10, 20, 30, 40, 50].map(dist => (
              <g key={dist}>
                <line x1="200" y1={100 - dist * 1.5} x2="210" y2={100 - dist * 1.5} stroke="currentColor" strokeWidth="1" className="text-muted-foreground opacity-60" />
                <text x="215" y={100 - dist * 1.5 + 4} className="text-muted-foreground fill-current text-[8px]">{dist * 10}</text>
              </g>
            ))}
          </svg>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div className="bg-muted px-4 py-2 rounded-md">
            <div className="text-xs text-muted-foreground">Scale</div>
            <div className="text-accent font-bold text-sm">1.0 @ {data.magnification}×</div>
          </div>
          <div className="bg-muted px-4 py-2 rounded-md">
            <div className="text-xs text-muted-foreground">Focal plane</div>
            <div className="text-accent font-bold text-sm">{data.focalPlane} alignment</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
