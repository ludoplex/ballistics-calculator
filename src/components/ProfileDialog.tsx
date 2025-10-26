import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string, rifle: string, cartridge: string, presetBank: string) => void
}

export default function ProfileDialog({ open, onOpenChange, onSave }: ProfileDialogProps) {
  const [name, setName] = useState('')
  const [rifle, setRifle] = useState('Rem 700, .308 Win')
  const [cartridge, setCartridge] = useState('TTSX 168gr')
  const [presetBank, setPresetBank] = useState('Custom 01')

  const handleSave = () => {
    if (!name.trim()) return
    onSave(name, rifle, cartridge, presetBank)
    setName('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Profile</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set up a new rifle and cartridge configuration
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="profile-name" className="text-xs text-muted-foreground uppercase tracking-wide">
              Profile Name
            </Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Hunting Load .308"
              className="mt-2 bg-muted text-foreground"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="dialog-rifle" className="text-xs text-muted-foreground uppercase tracking-wide">
              Rifle
            </Label>
            <Select value={rifle} onValueChange={setRifle}>
              <SelectTrigger id="dialog-rifle" className="mt-2 bg-secondary text-foreground">
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
            <Label htmlFor="dialog-cartridge" className="text-xs text-muted-foreground uppercase tracking-wide">
              Cartridge
            </Label>
            <Select value={cartridge} onValueChange={setCartridge}>
              <SelectTrigger id="dialog-cartridge" className="mt-2 bg-secondary text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TTSX 168gr">TTSX 168gr</SelectItem>
                <SelectItem value="SMK 175gr">SMK 175gr</SelectItem>
                <SelectItem value="ELD-M 140gr">ELD-M 140gr</SelectItem>
                <SelectItem value="Berger 185gr">Berger 185gr</SelectItem>
                <SelectItem value="Hornady 147gr">Hornady 147gr</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dialog-preset" className="text-xs text-muted-foreground uppercase tracking-wide">
              Preset Bank
            </Label>
            <Select value={presetBank} onValueChange={setPresetBank}>
              <SelectTrigger id="dialog-preset" className="mt-2 bg-secondary text-foreground">
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="bg-primary hover:bg-primary/90">
            Create Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
