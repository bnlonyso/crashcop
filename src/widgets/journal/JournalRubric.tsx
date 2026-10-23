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
    // If the subject has no rubrics yet (0% or not entered in NIS for this quarter),
    // gracefully show the 0% rubric calculator state instead of a broken error screen
    return (
      <HypotheticalRubricCalculator
        initialSor={[]}
        initialSoch={[]}
      />
    )
  }

  const { sumChapterCriteria = [], sumQuarterCriteria = [] } = data || {}

  return (
    <HypotheticalRubricCalculator
      initialSor={sumChapterCriteria}
      initialSoch={sumQuarterCriteria}
    />
  )
}

export default JournalRubric
