import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { BallisticData } from '@/lib/types'

interface BallisticsTabProps {
  data: BallisticData | undefined
  setData: (data: BallisticData | ((prev: BallisticData | undefined) => BallisticData)) => void
}

export default function BallisticsTab({ data, setData }: BallisticsTabProps) {
  if (!data) return null

  const handleNumberInput = (field: keyof BallisticData, value: string, min?: number, max?: number) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return
    
    let finalValue = numValue
    if (min !== undefined && numValue < min) finalValue = min
    if (max !== undefined && numValue > max) finalValue = max
    
    setData((prev) => ({ ...prev!, [field]: finalValue }))
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6">
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Ballistics Inputs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="zero-range" className="text-xs text-muted-foreground">Zero range</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="zero-range"
                  type="number"
                  min="10"
                  max="1000"
                  value={data.zeroDistance}
                  onChange={(e) => handleNumberInput('zeroDistance', e.target.value, 10, 1000)}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm min-w-[2rem]">yd</span>
              </div>
            </div>

            <div>
              <Label htmlFor="scope-height-b" className="text-xs text-muted-foreground">Scope height</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="scope-height-b"
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="5"
                  value={data.scopeHeight}
                  onChange={(e) => handleNumberInput('scopeHeight', e.target.value, 0.5, 5)}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm min-w-[2rem]">in</span>
              </div>
            </div>

            <div>
              <Label htmlFor="muzzle-velocity" className="text-xs text-muted-foreground">Muzzle velocity</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="muzzle-velocity"
                  type="number"
                  min="500"
                  max="4500"
                  value={data.muzzleVelocity}
                  onChange={(e) => handleNumberInput('muzzleVelocity', e.target.value, 500, 4500)}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm min-w-[2rem]">fps</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 opacity-70">Valid: 500-4500 fps</p>
            </div>

            <div>
              <Label htmlFor="bc" className="text-xs text-muted-foreground">Ballistic coefficient</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="bc"
                  type="number"
                  step="0.001"
                  min="0.1"
                  max="1.0"
                  value={data.ballisticCoefficient}
                  onChange={(e) => handleNumberInput('ballisticCoefficient', e.target.value, 0.1, 1.0)}
                  className="bg-muted text-accent font-bold flex-1"
                />
                <Select value={data.bcType} onValueChange={(v: 'G1' | 'G7') => setData((prev) => ({ ...prev!, bcType: v }))}>
                  <SelectTrigger className="w-24 bg-secondary text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="G1">G1</SelectItem>
                    <SelectItem value="G7">G7</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground mt-1 opacity-70">Valid: 0.1-1.0</p>
            </div>

            <div>
              <Label htmlFor="bullet-mass" className="text-xs text-muted-foreground">Bullet mass</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="bullet-mass"
                  type="number"
                  min="20"
                  max="750"
                  value={data.bulletMass}
                  onChange={(e) => handleNumberInput('bulletMass', e.target.value, 20, 750)}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm min-w-[2rem]">gr</span>
              </div>
            </div>

            <div>
              <Label htmlFor="barrel-twist" className="text-xs text-muted-foreground">Barrel twist</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="barrel-twist"
                  type="text"
                  value={data.barrelTwist}
                  onChange={(e) => setData((prev) => ({ ...prev!, barrelTwist: e.target.value }))}
                  className="bg-muted text-accent font-bold"
                  placeholder="1:10"
                />
                <Select value={data.twistDirection} onValueChange={(v: 'RH' | 'LH') => setData((prev) => ({ ...prev!, twistDirection: v }))}>
                  <SelectTrigger className="w-20 bg-secondary text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="LH">LH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Turret units</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={data.turretUnits === 'MOA' ? 'default' : 'outline'}
                  onClick={() => setData((prev) => ({ ...prev!, turretUnits: 'MOA' }))}
                  className="flex-1"
                >
                  MOA
                </Button>
                <Button
                  variant={data.turretUnits === 'MIL' ? 'default' : 'outline'}
                  onClick={() => setData((prev) => ({ ...prev!, turretUnits: 'MIL' }))}
                  className="flex-1"
                >
                  MIL
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="click-value" className="text-xs text-muted-foreground">Click value</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="click-value"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1"
                  value={data.clickValue}
                  onChange={(e) => handleNumberInput('clickValue', e.target.value, 0.01, 1)}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm min-w-[3rem]">{data.turretUnits}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="zero-offset" className="text-xs text-muted-foreground">Zero offset</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="zero-offset"
                  type="number"
                  step="0.01"
                  value={data.zeroOffset}
                  onChange={(e) => handleNumberInput('zeroOffset', e.target.value)}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm min-w-[3rem]">{data.turretUnits}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="rifle-cant" className="text-xs text-muted-foreground">Rifle cant</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="rifle-cant"
                  type="number"
                  step="0.1"
                  min="-45"
                  max="45"
                  value={data.rifleCant}
                  onChange={(e) => handleNumberInput('rifleCant', e.target.value, -45, 45)}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm min-w-[2rem]">°</span>
              </div>
            </div>

            <div>
              <Label htmlFor="altitude" className="text-xs text-muted-foreground">Altitude</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="altitude"
                  type="number"
                  min="0"
                  max="5000"
                  value={data.altitude}
                  onChange={(e) => handleNumberInput('altitude', e.target.value, 0, 5000)}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm min-w-[2rem]">m</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-6">
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Advanced Effects</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Coriolis Effect</Label>
              <p className="text-xs text-muted-foreground">Account for Earth's rotation</p>
            </div>
            <Switch
              checked={data.coriolisEnabled}
              onCheckedChange={(checked) => setData((prev) => ({ ...prev!, coriolisEnabled: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Spin Drift</Label>
              <p className="text-xs text-muted-foreground">Account for gyroscopic drift</p>
            </div>
            <Switch
              checked={data.spinDriftEnabled}
              onCheckedChange={(checked) => setData((prev) => ({ ...prev!, spinDriftEnabled: checked }))}
            />
          </div>

          {(data.coriolisEnabled || data.spinDriftEnabled) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
              <div className="mt-3">
                <Label htmlFor="latitude" className="text-xs text-muted-foreground">Latitude</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="latitude"
                    type="number"
                    min="-90"
                    max="90"
                    value={data.latitude}
                    onChange={(e) => handleNumberInput('latitude', e.target.value, -90, 90)}
                    className="bg-muted text-accent font-bold"
                  />
                  <span className="text-muted-foreground self-center text-sm">°</span>
                </div>
              </div>
              <div className="mt-3">
                <Label htmlFor="azimuth" className="text-xs text-muted-foreground">Azimuth</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="azimuth"
                    type="number"
                    min="0"
                    max="360"
                    value={data.azimuth}
                    onChange={(e) => handleNumberInput('azimuth', e.target.value, 0, 360)}
                    className="bg-muted text-accent font-bold"
                  />
                  <span className="text-muted-foreground self-center text-sm">°</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
