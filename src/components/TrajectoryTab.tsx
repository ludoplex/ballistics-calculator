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
  const minDrop = Math.min(...data.map(d => d.dropMOA), 0)
  const maxDrop = Math.max(...data.map(d => d.dropMOA), 1)
  const dropRange = maxDrop - minDrop

  const getDropValue = (row: TrajectoryResult): string => {
    switch (outputUnit) {
      case 'MOA':
        return row.dropMOA.toFixed(2)
      case 'MIL':
        return row.dropMIL.toFixed(2)
      case 'CM':
        return (row.dropInches * 2.54).toFixed(1)
      case 'CLICKS':
        return row.clicks.toString()
    }
  }

  const getWindValue = (row: TrajectoryResult): string => {
    switch (outputUnit) {
      case 'MOA':
        return row.windMOA.toFixed(2)
      case 'MIL':
        return row.windMIL.toFixed(2)
      case 'CM':
        return (row.windInches * 2.54).toFixed(1)
      case 'CLICKS':
        const clickUnit = ballisticData?.turretUnits || 'MOA'
        const clickValue = ballisticData?.clickValue || 0.25
        const windInUnit = clickUnit === 'MIL' ? row.windMIL : row.windMOA
        return Math.round(windInUnit / clickValue).toString()
    }
  }

  const getUnitLabel = (): string => {
    switch (outputUnit) {
      case 'MOA':
        return 'MOA'
      case 'MIL':
        return 'MIL'
      case 'CM':
        return 'cm'
      case 'CLICKS':
        return 'clicks'
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6">
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Trajectory</h3>
        <div className="relative w-full h-48 md:h-64 bg-background rounded-lg border border-secondary overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
            <line x1="40" y1="160" x2="380" y2="160" stroke="currentColor" strokeWidth="1" className="text-secondary" />
            <line x1="40" y1="20" x2="40" y2="160" stroke="currentColor" strokeWidth="1" className="text-secondary" />
            
            {data.length > 1 && (
              <polyline
                points={data.map((d, i) => {
                  const x = 40 + (i / (data.length - 1)) * 340
                  const normalizedDrop = (d.dropMOA - minDrop) / (dropRange || 1)
                  const y = 160 - normalizedDrop * 120
                  return `${x},${y}`
                }).join(' ')}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-success"
              />
            )}
            
            <text x="340" y="180" className="text-muted-foreground text-[10px] md:text-xs fill-current">Range (yd)</text>
            <text x="20" y="100" className="text-muted-foreground text-[10px] md:text-xs fill-current" transform="rotate(-90 20 100)">Drop (MOA)</text>
          </svg>
        </div>
      </Card>

      <Card className="p-4 md:p-6">
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Output Units</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

      <Card className="p-4 md:p-6">
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Solutions</h3>
        {data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Click Calculate to generate trajectory data
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="min-w-full inline-block align-middle px-4 md:px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary">
                    <TableHead className="text-foreground font-bold text-xs">Range (yd)</TableHead>
                    <TableHead className="text-foreground font-bold text-xs">Drop ({getUnitLabel()})</TableHead>
                    <TableHead className="text-foreground font-bold text-xs">Wind ({getUnitLabel()})</TableHead>
                    <TableHead className="text-foreground font-bold text-xs hidden md:table-cell">Vel (fps)</TableHead>
                    <TableHead className="text-foreground font-bold text-xs hidden lg:table-cell">Energy (ft-lb)</TableHead>
                    <TableHead className="text-foreground font-bold text-xs hidden lg:table-cell">Time (s)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell className="text-accent font-medium text-xs py-2">{row.range}</TableCell>
                      <TableCell className="text-success font-bold text-sm py-2">{getDropValue(row)}</TableCell>
                      <TableCell className="text-foreground font-bold text-sm py-2">{getWindValue(row)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs py-2 hidden md:table-cell">{row.velocity.toFixed(0)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs py-2 hidden lg:table-cell">{row.energy.toFixed(0)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs py-2 hidden lg:table-cell">{row.time.toFixed(3)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </Card>

      {data.length > 0 && ballisticData && (
        <Card className="p-4 md:p-6">
          <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Summary</h3>
          <div className="space-y-2 md:space-y-3">
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs text-muted-foreground">Zero range</span>
              <div className="bg-muted px-3 py-1.5 rounded-md">
                <span className="text-accent font-bold text-sm">
                  {ballisticData.zeroDistance} yd
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs text-muted-foreground">Drop @ 500 yd</span>
              <div className="bg-muted px-3 py-1.5 rounded-md">
                <span className="text-accent font-bold text-sm">
                  {data.find(d => d.range === 500) ? getDropValue(data.find(d => d.range === 500)!) : 'N/A'} {getUnitLabel()}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs text-muted-foreground">Wind @ 500 yd</span>
              <div className="bg-muted px-3 py-1.5 rounded-md">
                <span className="text-accent font-bold text-sm">
                  {data.find(d => d.range === 500) ? getWindValue(data.find(d => d.range === 500)!) : 'N/A'} {getUnitLabel()}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs text-muted-foreground">Velocity @ 500 yd</span>
              <div className="bg-muted px-3 py-1.5 rounded-md">
                <span className="text-accent font-bold text-sm">
                  {data.find(d => d.range === 500)?.velocity.toFixed(0) || 'N/A'} fps
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs text-muted-foreground">Energy @ 500 yd</span>
              <div className="bg-muted px-3 py-1.5 rounded-md">
                <span className="text-accent font-bold text-sm">
                  {data.find(d => d.range === 500)?.energy.toFixed(0) || 'N/A'} ft-lb
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
