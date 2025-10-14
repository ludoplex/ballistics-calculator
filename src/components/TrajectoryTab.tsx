import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { TrajectoryResult, BallisticData } from '@/lib/types'

interface TrajectoryTabProps {
  data: TrajectoryResult[]
  outputUnit: 'MOA' | 'MIL' | 'CM' | 'CLICKS'
  setOutputUnit: (unit: 'MOA' | 'MIL' | 'CM' | 'CLICKS') => void
  ballisticData: BallisticData | undefined
}

export default function TrajectoryTab({ data, outputUnit, setOutputUnit, ballisticData }: TrajectoryTabProps) {
  const maxRange = data.length > 0 ? data[data.length - 1].range : 1000
  const maxDrop = Math.max(...data.map(d => Math.abs(d.dropMOA)), 1)

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Trajectory</h3>
        <div className="relative w-full h-48 bg-background rounded-lg border border-secondary overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
            <line x1="40" y1="160" x2="380" y2="160" stroke="currentColor" strokeWidth="1" className="text-secondary" />
            <line x1="40" y1="20" x2="40" y2="160" stroke="currentColor" strokeWidth="1" className="text-secondary" />
            
            {data.length > 1 && (
              <polyline
                points={data.map((d, i) => {
                  const x = 40 + (i / (data.length - 1)) * 340
                  const y = 160 - (Math.abs(d.dropMOA) / maxDrop) * 120
                  return `${x},${y}`
                }).join(' ')}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-success"
              />
            )}
            
            <text x="340" y="180" className="text-muted-foreground text-xs fill-current">Range (yd)</text>
            <text x="20" y="100" className="text-muted-foreground text-xs fill-current" transform="rotate(-90 20 100)">Drop (MOA)</text>
          </svg>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Output Units</h3>
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant={outputUnit === 'MOA' ? 'default' : 'outline'}
            onClick={() => setOutputUnit('MOA')}
            className="text-sm"
          >
            MOA
          </Button>
          <Button
            variant={outputUnit === 'MIL' ? 'default' : 'outline'}
            onClick={() => setOutputUnit('MIL')}
            className="text-sm"
          >
            MIL
          </Button>
          <Button
            variant={outputUnit === 'CM' ? 'default' : 'outline'}
            onClick={() => setOutputUnit('CM')}
            className="text-sm"
          >
            cm
          </Button>
          <Button
            variant={outputUnit === 'CLICKS' ? 'default' : 'outline'}
            onClick={() => setOutputUnit('CLICKS')}
            className="text-sm"
          >
            Clicks
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Solutions</h3>
        {data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Click Calculate to generate trajectory data
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary">
                  <TableHead className="text-foreground font-bold">Range</TableHead>
                  <TableHead className="text-foreground font-bold">Drop MOA</TableHead>
                  <TableHead className="text-foreground font-bold">Drop MIL</TableHead>
                  <TableHead className="text-foreground font-bold">Wind MOA</TableHead>
                  <TableHead className="text-foreground font-bold">Clicks</TableHead>
                  <TableHead className="text-foreground font-bold">Velocity</TableHead>
                  <TableHead className="text-foreground font-bold">Energy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell className="text-accent font-medium">{row.range}</TableCell>
                    <TableCell className="text-success">{row.dropMOA.toFixed(2)}</TableCell>
                    <TableCell className="text-success">{row.dropMIL.toFixed(2)}</TableCell>
                    <TableCell className="text-foreground">{row.windMOA.toFixed(2)}</TableCell>
                    <TableCell className="text-amber-400 font-bold">{row.clicks}</TableCell>
                    <TableCell className="text-muted-foreground">{row.velocity.toFixed(0)}</TableCell>
                    <TableCell className="text-muted-foreground">{row.energy.toFixed(0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {data.length > 0 && ballisticData && (
        <Card className="p-6">
          <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Zero shift</span>
              <div className="bg-muted px-4 py-2 rounded-md">
                <span className="text-accent font-bold">
                  {ballisticData.zeroOffset.toFixed(2)} {ballisticData.turretUnits}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Wind hold @ 500</span>
              <div className="bg-muted px-4 py-2 rounded-md">
                <span className="text-accent font-bold">
                  {data.find(d => d.range === 500)?.windMOA.toFixed(2) || 'N/A'} MOA
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Clicks up @ 500</span>
              <div className="bg-muted px-4 py-2 rounded-md">
                <span className="text-accent font-bold">
                  {data.find(d => d.range === 500)?.clicks || 'N/A'} per {ballisticData.clickValue}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
