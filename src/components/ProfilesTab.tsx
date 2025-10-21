import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, FileArrowDown, Trash } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import ProfileDialog from './ProfileDialog'
import type { BallisticData } from '@/lib/types'
import type { SavedProfile } from '@/lib/profiles'
import { DEFAULT_PROFILES, createProfile } from '@/lib/profiles'

interface ProfilesTabProps {
  data: BallisticData | undefined
  setData: (data: BallisticData | ((prev: BallisticData | undefined) => BallisticData)) => void
}

export default function ProfilesTab({ data, setData }: ProfilesTabProps) {
  const [profiles, setProfiles] = useKV<SavedProfile[]>('saved-profiles', DEFAULT_PROFILES)
  const [currentProfileId, setCurrentProfileId] = useKV<string>('current-profile-id', DEFAULT_PROFILES[0].id)
  const [dialogOpen, setDialogOpen] = useState(false)

  if (!data) return null

  const safeProfiles = profiles || DEFAULT_PROFILES
  const safeCurrentProfileId = currentProfileId || DEFAULT_PROFILES[0].id
  const currentProfile = safeProfiles.find(p => p.id === safeCurrentProfileId)

  const handleProfileChange = (profileId: string) => {
    const profile = safeProfiles.find(p => p.id === profileId)
    if (profile) {
      setCurrentProfileId(profileId)
      setData(profile.data)
      toast.success(`Loaded: ${profile.name}`)
    }
  }

  const handleCreateProfile = (name: string, rifle: string, cartridge: string, presetBank: string) => {
    const newProfileData: BallisticData = {
      ...data,
      rifle,
      cartridge,
      presetBank,
    }
    const newProfile = createProfile(name, newProfileData)
    setProfiles(current => [...(current || []), newProfile])
    setCurrentProfileId(newProfile.id)
    setData(newProfile.data)
    toast.success(`Created: ${name}`)
  }

  const handleDeleteProfile = () => {
    if (safeProfiles.length <= 1) {
      toast.error('Cannot delete last profile')
      return
    }
    
    setProfiles(current => {
      const filtered = (current || []).filter(p => p.id !== safeCurrentProfileId)
      if (filtered.length > 0) {
        setCurrentProfileId(filtered[0].id)
        setData(filtered[0].data)
        toast.success('Profile deleted')
      }
      return filtered
    })
  }

  const handleImportProfile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string) as BallisticData
          const newProfile = createProfile(`Imported - ${file.name.replace('.json', '')}`, imported)
          setProfiles(current => [...(current || []), newProfile])
          setCurrentProfileId(newProfile.id)
          setData(newProfile.data)
          toast.success('Profile imported')
        } catch (err) {
          toast.error('Invalid profile file')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleExportProfile = () => {
    if (!currentProfile) return
    
    const dataStr = JSON.stringify(currentProfile.data, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentProfile.name.replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Profile exported')
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6 space-y-4">
        <div>
          <Label htmlFor="saved-profile" className="text-sm text-muted-foreground uppercase tracking-wide">
            Saved Profiles
          </Label>
          <div className="flex gap-2 mt-2">
            <Select value={safeCurrentProfileId} onValueChange={handleProfileChange}>
              <SelectTrigger id="saved-profile" className="flex-1 bg-secondary text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {safeProfiles.map(profile => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDeleteProfile}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              disabled={safeProfiles.length <= 1}
            >
              <Trash weight="bold" />
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="rifle" className="text-sm text-muted-foreground uppercase tracking-wide">Rifle</Label>
          <Select value={data.rifle} onValueChange={(v) => setData((prev) => ({ ...prev!, rifle: v }))}>
            <SelectTrigger id="rifle" className="mt-2 bg-secondary text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Rem 700, .308 Win">Rem 700, .308 Win</SelectItem>
              <SelectItem value="AR-15, 5.56 NATO">AR-15, 5.56 NATO</SelectItem>
              <SelectItem value="Tikka T3x, 6.5 Creedmoor">Tikka T3x, 6.5 Creedmoor</SelectItem>
              <SelectItem value="Savage 110, .300 Win Mag">Savage 110, .300 Win Mag</SelectItem>
              <SelectItem value="Bergara B-14, 6mm Creedmoor">Bergara B-14, 6mm Creedmoor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="cartridge" className="text-sm text-muted-foreground uppercase tracking-wide">Cartridge</Label>
          <Select value={data.cartridge} onValueChange={(v) => setData((prev) => ({ ...prev!, cartridge: v }))}>
            <SelectTrigger id="cartridge" className="mt-2 bg-secondary text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TTSX 168gr">TTSX 168gr</SelectItem>
              <SelectItem value="SMK 175gr">SMK 175gr</SelectItem>
              <SelectItem value="SMK 77gr">SMK 77gr</SelectItem>
              <SelectItem value="ELD-M 140gr">ELD-M 140gr</SelectItem>
              <SelectItem value="Berger 185gr">Berger 185gr</SelectItem>
              <SelectItem value="Hornady 147gr">Hornady 147gr</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="preset" className="text-sm text-muted-foreground uppercase tracking-wide">Preset Bank</Label>
          <Select value={data.presetBank} onValueChange={(v) => setData((prev) => ({ ...prev!, presetBank: v }))}>
            <SelectTrigger id="preset" className="mt-2 bg-secondary text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Custom 01">Custom 01</SelectItem>
              <SelectItem value="Custom 02">Custom 02</SelectItem>
              <SelectItem value="Custom 03">Custom 03</SelectItem>
              <SelectItem value="Factory Default">Factory Default</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button onClick={() => setDialogOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2" weight="bold" />
            Add Profile
          </Button>
          <Button onClick={handleImportProfile} className="bg-success hover:bg-success/90 text-success-foreground">
            <FileArrowDown className="mr-2" weight="bold" />
            Import
          </Button>
        </div>
      </Card>

      <ProfileDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleCreateProfile}
      />

      <Card className="p-4 md:p-6">
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Scope Setup</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="zero-distance" className="text-xs text-muted-foreground">Zero distance</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="zero-distance"
                type="number"
                min="1"
                max="1000"
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
              <SelectTrigger id="focal-plane" className="mt-1 bg-secondary text-foreground">
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
