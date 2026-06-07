---
name: zod
description: Zod schema patterns for this starter kit. Use when defining schemas, validating form input, inferring TypeScript types, or parsing API responses. Triggers on tasks involving zod, z.object, z.infer, safeParse, or form validation.
---

# Zod — Starter Kit Patterns

## Schema Definition

```ts
import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(64),
  email: z.string().email('Email tidak valid'),
  role: z.enum(['Superadmin', 'Editor', 'Viewer']),
  status: z.enum(['Aktif', 'Nonaktif']),
})
```

## Type Inference

```ts
type UserInput = z.infer<typeof userSchema>
// → { name: string; email: string; role: 'Superadmin'|'Editor'|'Viewer'; status: 'Aktif'|'Nonaktif' }
```

## Schema Composition

```ts
// Partial for update (all fields optional)
const updateUserSchema = userSchema.partial()

// Extend schema
const createUserSchema = userSchema.extend({
  password: z.string().min(8),
})

// Pick specific fields
const loginSchema = userSchema.pick({ email: true })
```

## Cross-Field Validation (`.refine`)

```ts
const registerSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'], // which field gets the error
  })
```

## Form Validation Pattern (safeParse)

Used in all forms in this starter kit — validate on submit, extract errors per field:

```tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  const result = userSchema.safeParse({ name, email, role, status })

  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    result.error.errors.forEach((err) => {
      if (err.path[0]) fieldErrors[String(err.path[0])] = err.message
    })
    setErrors(fieldErrors)
    return
  }

  // result.data is fully typed and validated
  await createUser(result.data)
}
```

## API Response Parsing

Validate API responses at runtime to catch backend changes early:

```ts
const usersResponseSchema = z.array(userSchema.extend({ id: z.string(), createdAt: z.string() }))

const rawData = await fetch('/api/users').then((r) => r.json())
const result = usersResponseSchema.safeParse(rawData)

if (!result.success) {
  console.error('Unexpected API shape:', result.error.flatten())
  throw new Error('Invalid API response')
}

const users = result.data // typed as User[]
```

## Enum Utilities

```ts
export const userRoles = ['Superadmin', 'Editor', 'Viewer'] as const
export type UserRole = (typeof userRoles)[number]

// Derive zod enum from const array
const roleEnum = z.enum(userRoles)
```

## Common Validators

```ts
z.string().url()                   // valid URL
z.string().regex(/^\d{16}$/)       // 16-digit string
z.number().int().min(0).max(100)   // integer 0–100
z.coerce.number()                  // auto-convert string → number
z.date()                           // Date object
z.string().datetime()              // ISO 8601 string
z.optional(z.string())             // string | undefined
z.nullable(z.string())             // string | null
```
