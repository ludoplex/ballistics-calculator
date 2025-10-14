import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { BallisticData } from '@/lib/types'

interface ReticleTabProps {
  data: BallisticData | undefined
  setData: (data: BallisticData | ((prev: BallisticData | undefined) => BallisticData)) => void
}

export default function ReticleTab({ data, setData }: ReticleTabProps) {
  if (!data) return null

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6">
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Wind</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="wind-speed" className="text-xs text-muted-foreground">Speed</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="wind-speed"
                  type="number"
                  value={data.windSpeed}
                  onChange={(e) => setData((prev) => ({ ...prev!, windSpeed: Number(e.target.value) }))}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm">mph</span>
              </div>
            </div>

            <div>
              <Label htmlFor="wind-angle" className="text-xs text-muted-foreground">Angle</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="wind-angle"
                  type="number"
                  value={data.windAngle}
                  onChange={(e) => setData((prev) => ({ ...prev!, windAngle: Number(e.target.value) }))}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm">°</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center py-4">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-xl bg-card border-2 border-secondary">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-xs text-muted-foreground absolute top-2">N</div>
                <div className="text-xs text-muted-foreground absolute right-2">E</div>
                <div className="text-xs text-muted-foreground absolute bottom-2">S</div>
                <div className="text-xs text-muted-foreground absolute left-2">W</div>
                <div
                  className="absolute w-1 h-8 bg-accent rounded-full origin-bottom"
                  style={{
                    transform: `rotate(${data.windAngle}deg) translateY(-50%)`,
                    left: '50%',
                    top: '50%',
                    marginLeft: '-2px',
                  }}
                />
                <div className="w-4 h-4 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-6">
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Atmosphere</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="temperature" className="text-xs text-muted-foreground">Temperature</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="temperature"
                type="number"
                value={data.temperature}
                onChange={(e) => setData((prev) => ({ ...prev!, temperature: Number(e.target.value) }))}
                className="bg-muted text-accent font-bold"
              />
              <span className="text-muted-foreground self-center text-sm">°C</span>
            </div>
          </div>

          <div>
            <Label htmlFor="pressure" className="text-xs text-muted-foreground">Pressure</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="pressure"
                type="number"
                value={data.pressure}
                onChange={(e) => setData((prev) => ({ ...prev!, pressure: Number(e.target.value) }))}
                className="bg-muted text-accent font-bold"
              />
              <span className="text-muted-foreground self-center text-sm">hPa</span>
            </div>
          </div>

          <div>
            <Label htmlFor="humidity" className="text-xs text-muted-foreground">Humidity</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="humidity"
                type="number"
                value={data.humidity}
                onChange={(e) => setData((prev) => ({ ...prev!, humidity: Number(e.target.value) }))}
                className="bg-muted text-accent font-bold"
              />
              <span className="text-muted-foreground self-center text-sm">%</span>
            </div>
          </div>

          <div>
            <Label htmlFor="density-alt" className="text-xs text-muted-foreground">Density altitude</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="density-alt"
                type="number"
                value={data.densityAltitude}
                onChange={(e) => setData((prev) => ({ ...prev!, densityAltitude: Number(e.target.value) }))}
                className="bg-muted text-accent font-bold"
              />
              <span className="text-muted-foreground self-center text-sm">m</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-6">
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Reticle Scaffold</h3>
        <div className="relative w-full aspect-[2/1] bg-background rounded-lg border border-secondary overflow-hidden">
          <svg className="w-full h-full">
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth="1" className="text-secondary" />
            <line x1="25%" y1="0" x2="25%" y2="100%" stroke="currentColor" strokeWidth="0.5" className="text-border opacity-50" />
            <line x1="75%" y1="0" x2="75%" y2="100%" stroke="currentColor" strokeWidth="0.5" className="text-border opacity-50" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-secondary" />
            <line x1="0" y1="25%" x2="100%" y2="25%" stroke="currentColor" strokeWidth="0.5" className="text-border opacity-50" />
            <line x1="0" y1="75%" x2="100%" y2="75%" stroke="currentColor" strokeWidth="0.5" className="text-border opacity-50" />
            <circle cx="50%" cy="50%" r="4" className="fill-success" />
          </svg>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <Button variant="outline" className="bg-muted text-accent font-bold text-sm">
            Scale: 1.0 @ {data.magnification}×
          </Button>
          <Button variant="outline" className="bg-muted text-accent font-bold text-sm">
            {data.focalPlane} alignment: ON
          </Button>
        </div>
      </Card>
    </div>
  )
}
