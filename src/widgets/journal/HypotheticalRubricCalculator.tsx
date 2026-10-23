import React, { FC, useState, useMemo, useEffect } from 'react'
import { Rubric } from '@/shared/types'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Calculator } from '@phosphor-icons/react'
import {
  AssessmentItem,
  calculatePercentage,
  formatPercentage,
} from '@/lib/gradeCalculator'

type HypotheticalRubricCalculatorProps = {
  initialSor: Rubric[]
  initialSoch: Rubric[]
}

const HypotheticalRubricCalculator: FC<HypotheticalRubricCalculatorProps> = ({
  initialSor,
  initialSoch,
}) => {
  const [isSimulatorMode, setIsSimulatorMode] = useState(false)

  // Real data transformed into AssessmentItems with guaranteed unique IDs per criterion
  const realSorItems: AssessmentItem[] = useMemo(() => {
    return initialSor.map((r, i) => {
      const maxMark = Math.max(0, Number(r.maxMark) || 0)
      const rawMark = Math.max(0, Number(r.mark) || 0)
      const effectiveMax = maxMark > 0 ? maxMark : (rawMark > 0 ? rawMark : 10)
      return {
        id: r.id ? `sor-${r.id}-${i}` : `sor-init-${i}`,
        title: r.title?.ru || r.title?.kk || `СОР ${i + 1}`,
        mark: Math.min(rawMark, effectiveMax),
        maxMark: effectiveMax,
      }
    })
  }, [initialSor])

  const realSochItems: AssessmentItem[] = useMemo(() => {
    return initialSoch.map((r, i) => {
      const maxMark = Math.max(0, Number(r.maxMark) || 0)
      const rawMark = Math.max(0, Number(r.mark) || 0)
      const effectiveMax = maxMark > 0 ? maxMark : (rawMark > 0 ? rawMark : 20)
      return {
        id: r.id ? `soch-${r.id}-${i}` : `soch-init-${i}`,
        title: r.title?.ru || r.title?.kk || `СОЧ ${i + 1}`,
        mark: Math.min(rawMark, effectiveMax),
        maxMark: effectiveMax,
      }
    })
  }, [initialSoch])

  // Simulator state synchronized with real data
  const [sorItems, setSorItems] = useState<AssessmentItem[]>(realSorItems)
  const [sochItems, setSochItems] = useState<AssessmentItem[]>(realSochItems)

  useEffect(() => {
    setSorItems(realSorItems)
    setSochItems(realSochItems)
  }, [realSorItems, realSochItems])

  const hasSochInitial = realSochItems.length > 0

  // Calculate actual percentage
  const actualResult = useMemo(() => {
    return calculatePercentage(realSorItems, realSochItems, hasSochInitial)
  }, [realSorItems, realSochItems, hasSochInitial])

  // Calculate hypothetical percentage
  const hypotheticalResult = useMemo(() => {
    return calculatePercentage(sorItems, sochItems, hasSochInitial)
  }, [sorItems, sochItems, hasSochInitial])

  const handleUpdateSor = (id: string, value: number) => {
    setSorItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              mark: Math.min(item.maxMark, Math.max(0, value)),
            }
          : item,
      ),
    )
  }

  const handleUpdateSoch = (id: string, value: number) => {
    setSochItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              mark: Math.min(item.maxMark, Math.max(0, value)),
            }
          : item,
      ),
    )
  }

  const diff = Math.round((hypotheticalResult.totalPercentage - actualResult.totalPercentage) * 100) / 100

  const activeResult = isSimulatorMode ? hypotheticalResult : actualResult

  const hasAnyItems = realSorItems.length > 0 || realSochItems.length > 0

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {/* Header with Calculator Icon Button */}
      <div className="flex items-center justify-between border-b pb-2 gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl font-black">
              {formatPercentage(activeResult.totalPercentage)}%
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: activeResult.markColor }}
            >
              Оценка {activeResult.mark}
            </span>
            {isSimulatorMode && diff !== 0 && (
              <span
                className={`text-xs font-semibold shrink-0 ${
                  diff > 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {diff > 0 ? `+${formatPercentage(diff)}%` : `${formatPercentage(diff)}%`}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {isSimulatorMode ? 'Прогнозируемый процент' : 'Текущий итоговый процент'}
          </p>
        </div>

        {hasAnyItems && (
          <Button
            size="icon"
            variant={isSimulatorMode ? 'secondary' : 'outline'}
            onClick={() => {
              if (isSimulatorMode) {
                setSorItems(realSorItems)
                setSochItems(realSochItems)
              }
              setIsSimulatorMode((prev) => !prev)
            }}
            className={`h-9 w-9 rounded-lg shrink-0 transition-colors ${
              isSimulatorMode ? 'bg-primary/20 text-primary border-primary/30' : ''
            }`}
            title={isSimulatorMode ? 'Выйти из симулятора' : 'Симулятор баллов'}
          >
            <Calculator
              size={18}
              className={isSimulatorMode ? 'text-primary' : 'text-muted-foreground'}
            />
          </Button>
        )}
      </div>

      <Progress
        value={activeResult.totalPercentage}
        className="h-1.5"
        color={activeResult.markColor}
      />

      {!hasAnyItems && (
        <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-4 text-center my-2">
          <p className="text-sm font-medium text-foreground">
            Оценок по предмету за эту четверть пока нет
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Текущий результат составляет 0%. По мере проведения СОР и СОЧ здесь появятся баллы.
          </p>
        </div>
      )}

      {/* СОР Section */}
      {realSorItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <span className="font-semibold text-foreground">СОР</span>
            <span>
              {activeResult.sorMark}/{activeResult.sorMaxMark} —{' '}
              <strong className="text-foreground">{formatPercentage(activeResult.sorScore)}%</strong>
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {(isSimulatorMode ? sorItems : realSorItems).map((rubric) => (
              <div
                key={rubric.id}
                className="flex flex-col gap-1.5 rounded-lg border p-2.5 text-sm transition-colors overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <span className="text-xs sm:text-sm font-medium leading-snug break-words flex-1 min-w-0 pr-1">
                    {rubric.title}
                  </span>

                  {isSimulatorMode ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <select
                        value={rubric.mark}
                        onChange={(e) =>
                          handleUpdateSor(rubric.id, Number(e.target.value))
                        }
                        className="h-7 rounded-md border border-primary/40 bg-background px-2 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        {Array.from({ length: rubric.maxMark + 1 }, (_, i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                      <span className="text-muted-foreground text-xs font-semibold">
                        / {rubric.maxMark}
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold text-xs sm:text-sm shrink-0 whitespace-nowrap">
                      {rubric.mark}/{rubric.maxMark}
                    </span>
                  )}
                </div>

                {isSimulatorMode && (
                  <input
                    type="range"
                    min={0}
                    max={rubric.maxMark}
                    value={rubric.mark}
                    onChange={(e) =>
                      handleUpdateSor(rubric.id, Number(e.target.value))
                    }
                    className="h-1.5 w-full cursor-pointer accent-purple-600 bg-secondary rounded-lg"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* СОЧ Section */}
      {hasSochInitial && (
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <span className="font-semibold text-foreground">СОЧ</span>
            <span>
              {activeResult.sochMark}/{activeResult.sochMaxMark} —{' '}
              <strong className="text-foreground">{formatPercentage(activeResult.sochScore)}%</strong>
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {(isSimulatorMode ? sochItems : realSochItems).map((rubric) => (
              <div
                key={rubric.id}
                className="flex flex-col gap-1.5 rounded-lg border p-2.5 text-sm transition-colors overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <span className="text-xs sm:text-sm font-medium leading-snug break-words flex-1 min-w-0 pr-1">
                    {rubric.title}
                  </span>

                  {isSimulatorMode ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <select
                        value={rubric.mark}
                        onChange={(e) =>
                          handleUpdateSoch(rubric.id, Number(e.target.value))
                        }
                        className="h-7 rounded-md border border-primary/40 bg-background px-2 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        {Array.from({ length: rubric.maxMark + 1 }, (_, i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                      <span className="text-muted-foreground text-xs font-semibold">
                        / {rubric.maxMark}
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold text-xs sm:text-sm shrink-0 whitespace-nowrap">
                      {rubric.mark}/{rubric.maxMark}
                    </span>
                  )}
                </div>

                {isSimulatorMode && (
                  <input
                    type="range"
                    min={0}
                    max={rubric.maxMark}
                    value={rubric.mark}
                    onChange={(e) =>
                      handleUpdateSoch(rubric.id, Number(e.target.value))
                    }
                    className="h-1.5 w-full cursor-pointer accent-purple-600 bg-secondary rounded-lg"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default HypotheticalRubricCalculator
