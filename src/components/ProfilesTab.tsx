import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, FileArrowDown } from '@phosphor-icons/react'
import type { BallisticData } from '@/lib/types'

interface ProfilesTabProps {
  data: BallisticData | undefined
  setData: (data: BallisticData | ((prev: BallisticData | undefined) => BallisticData)) => void
}

export default function ProfilesTab({ data, setData }: ProfilesTabProps) {
  if (!data) return null

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div>
          <Label htmlFor="rifle" className="text-sm text-muted-foreground uppercase tracking-wide">Rifle</Label>
          <Select value={data.rifle} onValueChange={(v) => setData((prev) => ({ ...prev!, rifle: v }))}>
            <SelectTrigger id="rifle" className="mt-2 bg-white text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Rem 700, .308 Win">Rem 700, .308 Win</SelectItem>
              <SelectItem value="AR-15, 5.56 NATO">AR-15, 5.56 NATO</SelectItem>
              <SelectItem value="Tikka T3x, 6.5 Creedmoor">Tikka T3x, 6.5 Creedmoor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="cartridge" className="text-sm text-muted-foreground uppercase tracking-wide">Cartridge</Label>
          <Select value={data.cartridge} onValueChange={(v) => setData((prev) => ({ ...prev!, cartridge: v }))}>
            <SelectTrigger id="cartridge" className="mt-2 bg-white text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TTSX 168gr">TTSX 168gr</SelectItem>
              <SelectItem value="SMK 175gr">SMK 175gr</SelectItem>
              <SelectItem value="ELD-M 140gr">ELD-M 140gr</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="preset" className="text-sm text-muted-foreground uppercase tracking-wide">Preset Bank</Label>
          <Select value={data.presetBank} onValueChange={(v) => setData((prev) => ({ ...prev!, presetBank: v }))}>
            <SelectTrigger id="preset" className="mt-2 bg-white text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Custom 01">Custom 01</SelectItem>
              <SelectItem value="Custom 02">Custom 02</SelectItem>
              <SelectItem value="Factory Default">Factory Default</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button className="flex-1 bg-primary hover:bg-primary/90">
            <Plus className="mr-2" weight="bold" />
            Add Profile
          </Button>
          <Button className="flex-1 bg-success hover:bg-success/90 text-success-foreground">
            <FileArrowDown className="mr-2" weight="bold" />
            Import
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Scope Setup</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="zero-distance" className="text-xs text-muted-foreground">Zero distance</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="zero-distance"
                type="number"
                value={data.zeroDistance}
                onChange={(e) => setData((prev) => ({ ...prev!, zeroDistance: Number(e.target.value) }))}
                className="bg-muted text-accent font-bold"
              />
              <span className="text-muted-foreground self-center text-sm">yd</span>
            </div>
          </div>

          <div>
            <Label htmlFor="focal-plane" className="text-xs text-muted-foreground">Focal plane</Label>
            <Select value={data.focalPlane} onValueChange={(v: 'FFP' | 'SFP') => setData((prev) => ({ ...prev!, focalPlane: v }))}>
              <SelectTrigger id="focal-plane" className="mt-1 bg-white text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FFP">FFP</SelectItem>
                <SelectItem value="SFP">SFP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="scope-height" className="text-xs text-muted-foreground">Scope height</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="scope-height"
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
            <Label htmlFor="magnification" className="text-xs text-muted-foreground">Magnification</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="magnification"
                type="number"
                value={data.magnification}
                onChange={(e) => setData((prev) => ({ ...prev!, magnification: Number(e.target.value) }))}
                className="bg-muted text-accent font-bold"
              />
              <span className="text-muted-foreground self-center text-sm">×</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
