import { Hono } from 'hono'
import { authMiddleware } from '@/app/api/[[...route]]/route'
import { decode } from '@/lib/token/jwt'
import { Userinfo } from '@/shared/types'
import { getAdditionalUserInfo } from '@/features/getAdditionalUserInfo'
import { Session } from '@/lib/token/resolver'
import { getJournal } from '@/features/getJournal'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { getJournalElement } from '@/features/getJournalElement'
import { isAxiosError } from 'axios'
import { getReports } from '@/features/getReports'

const app = new Hono<{
  Variables: {
    session: Session
  }
}>()

// Fast in-memory cache to eliminate repeated 2-4s NIS microservice latency
type CacheEntry<T> = { data: T; expiresAt: number }
const serverCache = new Map<string, CacheEntry<unknown>>()

const getCached = <T>(key: string): T | null => {
  const entry = serverCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    serverCache.delete(key)
    return null
  }
  return entry.data as T
}

const setCached = <T>(key: string, data: T, ttlMs: number = 60000): void => {
  // Keep cache size bounded
  if (serverCache.size > 500) {
    const oldestKey = serverCache.keys().next().value
    if (oldestKey) serverCache.delete(oldestKey)
  }
  serverCache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

app.use(async (c, next) => authMiddleware(c, next))

app.get('/contingent', async (c) => {
  const session = c.get('session')
  const cacheKey = `contingent:${session.accessToken.slice(-24)}`
  const cached = getCached<object>(cacheKey)
  if (cached) return c.json(cached)

  const rawUserInfo = await decode<{ UserInfo: string }>(
    session.accessToken,
  )

  const { FirstName, SecondName } = JSON.parse(rawUserInfo.UserInfo) as Userinfo

  const data = await getAdditionalUserInfo(session.accessToken)

  const result = {
    ...data,
    firstName: FirstName,
    lastName: SecondName,
  }

  setCached(cacheKey, result, 10 * 60 * 1000) // 10 minutes

  return c.json(result)
})

app.get('/journal', async (c) => {
  const session = c.get('session')
  const cacheKey = `journal:${session.city}:${session.accessToken.slice(-24)}`
  const cached = getCached<object>(cacheKey)
  if (cached) return c.json(cached)

  const journal = await getJournal(session.accessToken, session.city)
  setCached(cacheKey, journal, 60 * 1000) // 60 seconds

  return c.json(journal)
})

app.get('/journal/:subject', async (c) => {
  const session = c.get('session')
  const subjectId = c.req.param('subject')
  const quarter = z.coerce
    .number()
    .min(1)
    .max(4)
    .safeParse(c.req.query('quarter'))

  if (!quarter.success) {
    throw new HTTPException(400, {
      res: Response.json({
        message: 'Bad request',
        cause: 'Quarter index (quarter search param) is required',
      }),
    })
  }

  const cacheKey = `rubric:${session.city}:${session.accessToken.slice(-24)}:${subjectId}:${quarter.data}`
  const cached = getCached<object>(cacheKey)
  if (cached) return c.json(cached)

  try {
    const data = await getJournalElement(
      session.accessToken,
      session.city,
      subjectId,
      quarter.data,
    )

    setCached(cacheKey, data, 60 * 1000) // 60 seconds

    return c.json(data)
  } catch (e) {
    if (
      isAxiosError(e) &&
      e.response?.data.message.startsWith('предмет не найден')
    ) {
      throw new HTTPException(404, {
        res: Response.json({
          message: 'Not found',
          cause: 'Subject with id ' + subjectId + ' not found',
        }),
      })
    } else
      throw new HTTPException(503, {
        res: Response.json(
          {
            message: 'Service unavailable',
            cause: 'AEO NIS microservices are currently unavailable / down',
          },
          {
            status: 503,
          },
        ),
      })
  }
})

app.get('/reports', async (c) => {
  const { accessToken } = c.get('session')
  const cacheKey = `reports:${accessToken.slice(-24)}`
  const cached = getCached<object>(cacheKey)
  if (cached) return c.json(cached)

  try {
    const reports = await getReports(accessToken)
    setCached(cacheKey, reports, 2 * 60 * 1000) // 2 minutes
    return c.json(reports)
  } catch (e) {
    console.log(e)

    throw new HTTPException(503, {
      res: Response.json(
        {
          message: 'Service unavailable',
          cause: 'AEO NIS microservices are currently unavailable / down',
        },
        {
          status: 503,
        },
      ),
    })
  }
})

export default app
