import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    RUNTIME: z.enum(['edge', 'node']).default('node'),
  },

  client: {
    NEXT_PUBLIC_CONTACT_LINK: z.string().optional(),
    NEXT_PUBLIC_REPO_LINK: z.string().optional(),
    NEXT_PUBLIC_DONATE_LINK: z.string().optional(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    RUNTIME: process.env.RUNTIME || 'node',
    NEXT_PUBLIC_CONTACT_LINK:
      process.env.NEXT_PUBLIC_CONTACT_LINK || 'https://github.com/bnlonyso',
    NEXT_PUBLIC_REPO_LINK:
      process.env.NEXT_PUBLIC_REPO_LINK || 'https://github.com/bnlonyso/crashcop',
    NEXT_PUBLIC_DONATE_LINK:
      process.env.NEXT_PUBLIC_DONATE_LINK || 'https://github.com/bnlonyso/crashcop',
  },

  skipValidation: true,
  emptyStringAsUndefined: true,
})
