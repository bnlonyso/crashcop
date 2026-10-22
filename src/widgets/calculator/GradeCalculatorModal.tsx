'use client'

import React, { useState, useMemo } from 'react'
import ResponsiveModal from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Calculator,
  Plus,
  Trash,
  ArrowCounterClockwise,
  Check,
} from '@phosphor-icons/react'
import {
  AssessmentItem,
  calculatePercentage,
  formatPercentage,
} from '@/lib/gradeCalculator'

const GradeCalculatorModal: React.FC = () => {
  const [sorList, setSorList] = useState<AssessmentItem[]>([
    { id: 'sor-1', title: 'СОР 1', mark: 17, maxMark: 20 },
    { id: 'sor-2', title: 'СОР 2', mark: 18, maxMark: 20 },
  ])

  const [hasSoch, setHasSoch] = useState(true)
  const [soch, setSoch] = useState<AssessmentItem>({
    id: 'soch-main',
    title: 'СОЧ',
    mark: 34,
    maxMark: 40,
  })

  const result = useMemo(() => {
    return calculatePercentage(sorList, hasSoch ? [soch] : [], hasSoch)
  }, [sorList, soch, hasSoch])

  const handleUpdateSor = (id: string, field: 'mark' | 'maxMark', value: number) => {
    setSorList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    )
  }

  const handleAddSor = () => {
    setSorList((prev) => [
      ...prev,
      {
        id: `sor-${Date.now()}`,
        title: `СОР ${prev.length + 1}`,
        mark: 15,
        maxMark: 20,
      },
    ])
  }

  const handleDeleteSor = (id: string) => {
    if (sorList.length <= 1) return
    setSorList((prev) => prev.filter((item) => item.id !== id))
  }

  const handleReset = () => {
    setSorList([
      { id: 'sor-1', title: 'СОР 1', mark: 17, maxMark: 20 },
      { id: 'sor-2', title: 'СОР 2', mark: 18, maxMark: 20 },
    ])
    setHasSoch(true)
    setSoch({
      id: 'soch-main',
      title: 'СОЧ',
      mark: 34,
      maxMark: 40,
    })
  }

  return (
    <ResponsiveModal
      trigger={
        <Button
          variant="outline"
          className="flex w-full items-center justify-center gap-2 border-dashed py-5 hover:border-primary hover:text-primary sm:w-auto"
        >
          <Calculator size={20} className="text-primary" />
          <span className="font-semibold">Калькулятор процента (симулятор)</span>
        </Button>
      }
      title={
        <div className="flex items-center gap-2 text-2xl font-black">
          <Calculator size={28} className="text-primary" />
          <span>Калькулятор процентов НИШ</span>
        </div>
      }
      description="Укажите гипотетические баллы за СОР и СОЧ, чтобы точно узнать итоговый процент и оценку."
      close={<Button variant="outline">Закрыть</Button>}
    >
      <div className="flex flex-col gap-4 py-2 max-h-[70vh] overflow-y-auto px-1">
        {/* Results summary card */}
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">
                Итоговый процент
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight">
                  {formatPercentage(result.totalPercentage)}%
                </span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                  style={{ backgroundColor: result.markColor }}
                >
                  Оценка {result.mark}
                </span>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowCounterClockwise size={14} className="mr-1" />
              Сброс
            </Button>
          </div>

          <Progress
            value={result.totalPercentage}
            className="mt-3 h-2"
            color={result.markColor}
          />

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded bg-secondary/50 p-2">
              <span className="text-muted-foreground">Вклад СОР: </span>
              <strong className="text-foreground">{formatPercentage(result.sorScore)}%</strong>{' '}
              <span className="text-muted-foreground">({result.sorMark}/{result.sorMaxMark})</span>
            </div>
            <div className="rounded bg-secondary/50 p-2">
              <span className="text-muted-foreground">Вклад СОЧ: </span>
              <strong className="text-foreground">{formatPercentage(result.sochScore)}%</strong>{' '}
              {hasSoch && (
                <span className="text-muted-foreground">({result.sochMark}/{result.sochMaxMark})</span>
              )}
            </div>
          </div>

          {/* Advice */}
          {hasSoch && result.pointsNeededFor5 !== null && result.pointsNeededFor5 !== undefined && (
            <div className="mt-3 rounded-lg border border-green-500/30 bg-green-500/10 p-2.5 text-xs text-foreground">
              🎯 Чтобы получить <strong className="text-green-500 font-bold">5 (85%)</strong>, на СОЧ нужно набрать минимум:{' '}
              <strong className="font-extrabold text-green-600 dark:text-green-400">
                {result.pointsNeededFor5} из {result.sochMaxMark}
              </strong>{' '}
              баллов
            </div>
          )}
          {hasSoch && result.pointsNeededFor5 === null && result.pointsNeededFor4 !== null && result.pointsNeededFor4 !== undefined && (
            <div className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2.5 text-xs text-foreground">
              🎯 Чтобы получить <strong className="text-yellow-500 font-bold">4 (65%)</strong>, на СОЧ нужно набрать минимум:{' '}
              <strong className="font-extrabold text-yellow-600 dark:text-yellow-400">
                {result.pointsNeededFor4} из {result.sochMaxMark}
              </strong>{' '}
              баллов
            </div>
          )}
        </div>

        {/* СОР Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold">Баллы за СОР</span>
            <span className="text-xs text-muted-foreground">
              Вес: {hasSoch ? '50%' : '100%'}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {sorList.map((sor, index) => (
              <div
                key={sor.id}
                className="flex items-center justify-between gap-2 rounded-lg border bg-background p-2.5"
              >
                <span className="text-sm font-medium">{sor.title}</span>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Балл:</span>
                    <Input
                      type="number"
                      min={0}
                      max={sor.maxMark}
                      value={sor.mark}
                      onChange={(e) =>
                        handleUpdateSor(sor.id, 'mark', Number(e.target.value))
                      }
                      className="h-8 w-16 text-center text-sm"
                    />
                  </div>

                  <span className="text-muted-foreground">/</span>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Макс:</span>
                    <Input
                      type="number"
                      min={1}
                      value={sor.maxMark}
                      onChange={(e) =>
                        handleUpdateSor(sor.id, 'maxMark', Number(e.target.value))
                      }
                      className="h-8 w-16 text-center text-sm"
                    />
                  </div>

                  {sorList.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteSor(sor.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                    >
                      <Trash size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleAddSor}
            className="w-full text-xs font-semibold"
          >
            <Plus size={14} className="mr-1" /> Добавить СОР
          </Button>
        </div>

        {/* СОЧ Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold">Баллы за СОЧ</span>
            <Button
              size="sm"
              variant={hasSoch ? 'secondary' : 'outline'}
              onClick={() => setHasSoch((prev) => !prev)}
              className="h-6 text-xs"
            >
              {hasSoch ? 'Включён (50%)' : 'Отключён (Без СОЧ)'}
            </Button>
          </div>

          {hasSoch && (
            <div className="flex items-center justify-between gap-2 rounded-lg border bg-background p-2.5">
              <span className="text-sm font-medium">СОЧ</span>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Балл:</span>
                  <Input
                    type="number"
                    min={0}
                    max={soch.maxMark}
                    value={soch.mark}
                    onChange={(e) =>
                      setSoch((prev) => ({ ...prev, mark: Number(e.target.value) }))
                    }
                    className="h-8 w-16 text-center text-sm"
                  />
                </div>

                <span className="text-muted-foreground">/</span>

                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Макс:</span>
                  <Input
                    type="number"
                    min={1}
                    value={soch.maxMark}
                    onChange={(e) =>
                      setSoch((prev) => ({ ...prev, maxMark: Number(e.target.value) }))
                    }
                    className="h-8 w-16 text-center text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default GradeCalculatorModal
