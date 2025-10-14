import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { BallisticData } from '@/lib/types'

interface BallisticsTabProps {
  data: BallisticData | undefined
  setData: (data: BallisticData | ((prev: BallisticData | undefined) => BallisticData)) => void
}

export default function BallisticsTab({ data, setData }: BallisticsTabProps) {
  if (!data) return null

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Ballistics Inputs</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="zero-range" className="text-xs text-muted-foreground">Zero range</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="zero-range"
                  type="number"
                  value={data.zeroDistance}
                  onChange={(e) => setData((prev) => ({ ...prev!, zeroDistance: Number(e.target.value) }))}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm">yd</span>
              </div>
            </div>

            <div>
              <Label htmlFor="scope-height-b" className="text-xs text-muted-foreground">Scope height</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="scope-height-b"
                  type="number"
                  step="0.01"
                  value={data.scopeHeight}
                  onChange={(e) => setData((prev) => ({ ...prev!, scopeHeight: Number(e.target.value) }))}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm">in</span>
              </div>
            </div>

            <div>
              <Label htmlFor="muzzle-velocity" className="text-xs text-muted-foreground">Muzzle velocity</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="muzzle-velocity"
                  type="number"
                  value={data.muzzleVelocity}
                  onChange={(e) => setData((prev) => ({ ...prev!, muzzleVelocity: Number(e.target.value) }))}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm">fps</span>
              </div>
            </div>

            <div>
              <Label htmlFor="bc" className="text-xs text-muted-foreground">Ballistic coefficient</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="bc"
                  type="number"
                  step="0.001"
                  value={data.ballisticCoefficient}
                  onChange={(e) => setData((prev) => ({ ...prev!, ballisticCoefficient: Number(e.target.value) }))}
                  className="bg-muted text-accent font-bold flex-1"
                />
                <Select value={data.bcType} onValueChange={(v: 'G1' | 'G7') => setData((prev) => ({ ...prev!, bcType: v }))}>
                  <SelectTrigger className="w-24 bg-white text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="G1">G1</SelectItem>
                    <SelectItem value="G7">G7</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="bullet-mass" className="text-xs text-muted-foreground">Bullet mass</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="bullet-mass"
                  type="number"
                  value={data.bulletMass}
                  onChange={(e) => setData((prev) => ({ ...prev!, bulletMass: Number(e.target.value) }))}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm">gr</span>
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
                />
                <span className="text-muted-foreground self-center text-sm">{data.twistDirection}</span>
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
                  value={data.clickValue}
                  onChange={(e) => setData((prev) => ({ ...prev!, clickValue: Number(e.target.value) }))}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm">{data.turretUnits}</span>
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
                  onChange={(e) => setData((prev) => ({ ...prev!, zeroOffset: Number(e.target.value) }))}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm">{data.turretUnits}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="rifle-cant" className="text-xs text-muted-foreground">Rifle cant</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="rifle-cant"
                  type="number"
                  step="0.1"
                  value={data.rifleCant}
                  onChange={(e) => setData((prev) => ({ ...prev!, rifleCant: Number(e.target.value) }))}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm">°</span>
              </div>
            </div>

            <div>
              <Label htmlFor="altitude" className="text-xs text-muted-foreground">Altitude</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="altitude"
                  type="number"
                  value={data.altitude}
                  onChange={(e) => setData((prev) => ({ ...prev!, altitude: Number(e.target.value) }))}
                  className="bg-muted text-accent font-bold"
                />
                <span className="text-muted-foreground self-center text-sm">m</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Advanced Effects</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Button
            variant={data.coriolisEnabled ? 'default' : 'outline'}
            onClick={() => setData((prev) => ({ ...prev!, coriolisEnabled: !prev!.coriolisEnabled }))}
            className="text-sm"
          >
            Coriolis: {data.coriolisEnabled ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant={data.spinDriftEnabled ? 'default' : 'outline'}
            onClick={() => setData((prev) => ({ ...prev!, spinDriftEnabled: !prev!.spinDriftEnabled }))}
            className="text-sm"
          >
            Spin: {data.spinDriftEnabled ? 'ON' : 'OFF'}
          </Button>
          <div>
            <Input
              type="number"
              value={data.latitude}
              onChange={(e) => setData((prev) => ({ ...prev!, latitude: Number(e.target.value) }))}
              placeholder="Latitude"
              className="bg-muted text-accent font-bold text-sm h-9"
            />
          </div>
          <div>
            <Input
              type="number"
              value={data.azimuth}
              onChange={(e) => setData((prev) => ({ ...prev!, azimuth: Number(e.target.value) }))}
              placeholder="Azimuth"
              className="bg-muted text-accent font-bold text-sm h-9"
            />
          </div>
          <div className="col-span-2">
            <Input
              type="text"
              value={data.gyroDrift}
              onChange={(e) => setData((prev) => ({ ...prev!, gyroDrift: e.target.value }))}
              placeholder="Gyro drift"
              className="bg-muted text-accent font-bold text-sm h-9"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
