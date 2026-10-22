import React, { FC, useState, useMemo } from 'react'
import { Rubric } from '@/shared/types'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Calculator,
  ArrowCounterClockwise,
  Plus,
  Trash,
  CheckCircle,
  Sparkle,
} from '@phosphor-icons/react'
import {
  AssessmentItem,
  calculatePercentage,
  getColorByScore,
  getMarkFromScore,
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

  // Real data transformed into AssessmentItems
  const realSorItems: AssessmentItem[] = useMemo(() => {
    return initialSor.map((r, i) => ({
      id: r.id || `sor-init-${i}`,
      title: r.title?.ru || `СОР ${i + 1}`,
      mark: Number(r.mark) || 0,
      maxMark: Number(r.maxMark) || 0,
    }))
  }, [initialSor])

  const realSochItems: AssessmentItem[] = useMemo(() => {
    return initialSoch.map((r, i) => ({
      id: r.id || `soch-init-${i}`,
      title: r.title?.ru || `СОЧ ${i + 1}`,
      mark: Number(r.mark) || 0,
      maxMark: Number(r.maxMark) || 0,
    }))
  }, [initialSoch])

  // Simulator state
  const [sorItems, setSorItems] = useState<AssessmentItem[]>(realSorItems)
  const [sochItems, setSochItems] = useState<AssessmentItem[]>(realSochItems)

  const hasSochInitial = initialSoch.length > 0
  const [includeSoch, setIncludeSoch] = useState(hasSochInitial)

  // Calculate actual percentage
  const actualResult = useMemo(() => {
    return calculatePercentage(realSorItems, realSochItems, hasSochInitial)
  }, [realSorItems, realSochItems, hasSochInitial])

  // Calculate hypothetical percentage
  const hypotheticalResult = useMemo(() => {
    return calculatePercentage(sorItems, sochItems, includeSoch || sochItems.length > 0)
  }, [sorItems, sochItems, includeSoch])

  const handleReset = () => {
    setSorItems(realSorItems)
    setSochItems(realSochItems)
    setIncludeSoch(hasSochInitial)
  }

  const handleUpdateSor = (id: string, field: 'mark' | 'maxMark', value: number) => {
    setSorItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    )
  }

  const handleUpdateSoch = (id: string, field: 'mark' | 'maxMark', value: number) => {
    setSochItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    )
  }

  const handleAddSor = () => {
    const newItem: AssessmentItem = {
      id: `hypo-sor-${Date.now()}`,
      title: `Новый СОР ${sorItems.length + 1}`,
      mark: 15,
      maxMark: 20,
    }
    setSorItems((prev) => [...prev, newItem])
  }

  const handleAddSoch = () => {
    setIncludeSoch(true)
    const newItem: AssessmentItem = {
      id: `hypo-soch-${Date.now()}`,
      title: `СОЧ (гипотетический)`,
      mark: 30,
      maxMark: 40,
    }
    setSochItems((prev) => [...prev, newItem])
  }

  const handleDeleteSor = (id: string) => {
    setSorItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleDeleteSoch = (id: string) => {
    setSochItems((prev) => prev.filter((item) => item.id !== id))
  }

  const diff = parseFloat(
    (hypotheticalResult.totalPercentage - actualResult.totalPercentage).toFixed(2),
  )

  const activeResult = isSimulatorMode ? hypotheticalResult : actualResult

  return (
    <div className="flex flex-col gap-3">
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black">
              {activeResult.totalPercentage}%
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
              style={{ backgroundColor: activeResult.markColor }}
            >
              Оценка {activeResult.mark}
            </span>
            {isSimulatorMode && diff !== 0 && (
              <span
                className={`text-xs font-semibold ${
                  diff > 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {diff > 0 ? `+${diff}%` : `${diff}%`}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isSimulatorMode ? 'Прогнозируемый процент' : 'Текущий итоговый процент'}
          </p>
        </div>

        <Button
          size="sm"
          variant={isSimulatorMode ? 'secondary' : 'outline'}
          onClick={() => {
            if (!isSimulatorMode) {
              handleReset()
            }
            setIsSimulatorMode((prev) => !prev)
          }}
          className="flex items-center gap-1.5"
        >
          {isSimulatorMode ? (
            <>
              <CheckCircle size={16} />
              <span>Обычный режим</span>
            </>
          ) : (
            <>
              <Calculator size={16} className="text-primary" />
              <span>Симулятор баллов</span>
            </>
          )}
        </Button>
      </div>

      <Progress
        value={activeResult.totalPercentage}
        className="h-1.5"
        color={activeResult.markColor}
      />

      {/* Simulator Mode Help & Reset Bar */}
      {isSimulatorMode && (
        <div className="flex flex-col gap-2 rounded-lg bg-secondary/50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Sparkle size={14} className="text-yellow-500" />
              Изменяйте баллы для проверки процента
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReset}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowCounterClockwise size={14} className="mr-1" />
              Сброс
            </Button>
          </div>

          {/* Target advice */}
          {activeResult.pointsNeededFor5 !== null && activeResult.pointsNeededFor5 !== undefined && (
            <div className="rounded bg-background/80 p-2 text-xs">
              🎯 Для оценки <strong className="text-green-500">5 (85%)</strong> на СОЧ нужно набрать минимум:{' '}
              <strong className="text-foreground">
                {activeResult.pointsNeededFor5} из {activeResult.sochMaxMark}
              </strong>{' '}
              баллов
            </div>
          )}
          {activeResult.pointsNeededFor5 === null && activeResult.pointsNeededFor4 !== null && activeResult.pointsNeededFor4 !== undefined && (
            <div className="rounded bg-background/80 p-2 text-xs">
              🎯 Для оценки <strong className="text-yellow-500">4 (65%)</strong> на СОЧ нужно набрать минимум:{' '}
              <strong className="text-foreground">
                {activeResult.pointsNeededFor4} из {activeResult.sochMaxMark}
              </strong>{' '}
              баллов
            </div>
          )}
        </div>
      )}

      {/* СОР Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <span className="font-semibold text-foreground">СОР (50%)</span>
          <span>
            {activeResult.sorMark}/{activeResult.sorMaxMark} —{' '}
            <strong className="text-foreground">{activeResult.sorScore}%</strong>
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {(isSimulatorMode ? sorItems : realSorItems).map((rubric) => (
            <div
              key={rubric.id}
              className="flex items-center justify-between rounded border p-2 text-sm"
            >
              <span className="max-w-[55%] truncate text-xs sm:text-sm">
                {rubric.title}
              </span>

              {isSimulatorMode ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min={0}
                    max={rubric.maxMark}
                    value={rubric.mark}
                    onChange={(e) =>
                      handleUpdateSor(rubric.id, 'mark', Number(e.target.value))
                    }
                    className="h-7 w-14 text-center text-xs p-1"
                  />
                  <span className="text-muted-foreground">/</span>
                  <Input
                    type="number"
                    min={1}
                    value={rubric.maxMark}
                    onChange={(e) =>
                      handleUpdateSor(rubric.id, 'maxMark', Number(e.target.value))
                    }
                    className="h-7 w-14 text-center text-xs p-1"
                  />
                  {sorItems.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteSor(rubric.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-red-500"
                    >
                      <Trash size={14} />
                    </Button>
                  )}
                </div>
              ) : (
                <span className="font-medium">
                  {rubric.mark}/{rubric.maxMark}
                </span>
              )}
            </div>
          ))}
        </div>

        {isSimulatorMode && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddSor}
            className="w-full text-xs"
          >
            <Plus size={14} className="mr-1" /> Добавить СОР
          </Button>
        )}
      </div>

      {/* СОЧ Section */}
      <div className="space-y-2 mt-2">
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <span className="font-semibold text-foreground">СОЧ (50%)</span>
          <span>
            {activeResult.sochMark}/{activeResult.sochMaxMark} —{' '}
            <strong className="text-foreground">{activeResult.sochScore}%</strong>
          </span>
        </div>

        {(isSimulatorMode ? sochItems : realSochItems).length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {(isSimulatorMode ? sochItems : realSochItems).map((rubric) => (
              <div
                key={rubric.id}
                className="flex items-center justify-between rounded border p-2 text-sm"
              >
                <span className="max-w-[55%] truncate text-xs sm:text-sm">
                  {rubric.title}
                </span>

                {isSimulatorMode ? (
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={0}
                      max={rubric.maxMark}
                      value={rubric.mark}
                      onChange={(e) =>
                        handleUpdateSoch(rubric.id, 'mark', Number(e.target.value))
                      }
                      className="h-7 w-14 text-center text-xs p-1"
                    />
                    <span className="text-muted-foreground">/</span>
                    <Input
                      type="number"
                      min={1}
                      value={rubric.maxMark}
                      onChange={(e) =>
                        handleUpdateSoch(rubric.id, 'maxMark', Number(e.target.value))
                      }
                      className="h-7 w-14 text-center text-xs p-1"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteSoch(rubric.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-red-500"
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                ) : (
                  <span className="font-medium">
                    {rubric.mark}/{rubric.maxMark}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">СОЧ отсутствует</p>
        )}

        {isSimulatorMode && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddSoch}
            className="w-full text-xs"
          >
            <Plus size={14} className="mr-1" /> Добавить СОЧ
          </Button>
        )}
      </div>
    </div>
  )
}

export default HypotheticalRubricCalculator
