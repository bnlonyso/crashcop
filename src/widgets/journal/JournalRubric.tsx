import React, { FC } from 'react'
import { useRubric } from '@/lib/hooks/useRubric'
import { LinkBreak, Spinner } from '@phosphor-icons/react'
import HypotheticalRubricCalculator from '@/widgets/journal/HypotheticalRubricCalculator'

type JournalRubricProps = {
  subject: string
  quarter: number
}

const JournalRubric: FC<JournalRubricProps> = ({ subject, quarter }) => {
  const { data, isLoading, isError } = useRubric(subject, quarter)

  if (isLoading)
    return (
      <div className="h-48 w-full">
        <div className="relative top-1/2 mx-auto h-fit w-fit -translate-y-1/2 transform">
          <Spinner
            size={28}
            className="animate-spin-slow text-muted-foreground"
          />
        </div>
      </div>
    )

  if (isError) {
    return (
      <div className="h-64 w-full">
        <div className="items center relative top-1/2 mx-auto h-fit w-fit -translate-y-1/2 transform text-center">
          <LinkBreak size={72} className="mx-auto text-red-600" />
          <h2 className="scroll-m-20 text-2xl font-semibold sm:text-3xl">
            Неизвестная ошибка
          </h2>
          <p className="mt-1 text-[14px] leading-5 text-muted-foreground sm:text-[17px]">
            Не удалось получить подробные данные о предмете. Вероятно, СУШ
            вашего филиала НИШ сейчас не работает.
          </p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { sumChapterCriteria = [], sumQuarterCriteria = [] } = data

  return (
    <HypotheticalRubricCalculator
      initialSor={sumChapterCriteria}
      initialSoch={sumQuarterCriteria}
    />
  )
}

export default JournalRubric
