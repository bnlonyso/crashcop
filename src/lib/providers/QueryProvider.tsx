'use client'

import React, { FC, PropsWithChildren, useState } from 'react'
import { QueryClient } from '@tanstack/react-query'
import { IDBQueryPersistor } from '@/lib/utils'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useRouter } from 'next-nprogress-bar'

const QueryProvider: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter()

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 1000 * 60 * 5, // 5 mins fresh - instant switching
            gcTime: 1000 * 60 * 60 * 24, // 24 hours in cache
            refetchInterval: 1000 * 60 * 5, // 5 mins auto refetch
            throwOnError: (error) => {
              if (error.message === 'UNAUTHORIZED') {
                queryClient.removeQueries()
                router.push('/login')
              }

              return false
            },
          },
        },
      }),
  )

  const persister = IDBQueryPersistor()

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}

export default QueryProvider
