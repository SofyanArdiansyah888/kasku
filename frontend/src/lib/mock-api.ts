import type { User, UserRole, UserStatus, CreateUserInput } from '../schemas/user.schema'

const delay = (ms = 800) => new Promise<void>((resolve) => setTimeout(resolve, ms))

let users: User[] = [
  {
    id: '1',
    name: 'Admin Utama',
    email: 'admin@core.id',
    role: 'Superadmin',
    status: 'Aktif',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Budi Santoso',
    email: 'budi@core.id',
    role: 'Editor',
    status: 'Nonaktif',
    createdAt: '2025-02-15T00:00:00Z',
  },
  {
    id: '3',
    name: 'Siti Aminah',
    email: 'siti@core.id',
    role: 'Viewer',
    status: 'Aktif',
    createdAt: '2025-03-10T00:00:00Z',
  },
  {
    id: '4',
    name: 'Rudi Hermawan',
    email: 'rudi@core.id',
    role: 'Editor',
    status: 'Aktif',
    createdAt: '2025-04-05T00:00:00Z',
  },
  {
    id: '5',
    name: 'Dewi Lestari',
    email: 'dewi@core.id',
    role: 'Viewer',
    status: 'Nonaktif',
    createdAt: '2025-05-20T00:00:00Z',
  },
  {
    id: '6',
    name: 'Hendra Wijaya',
    email: 'hendra@core.id',
    role: 'Editor',
    status: 'Aktif',
    createdAt: '2025-06-01T00:00:00Z',
  },
]

const MOCK_CREDENTIALS = {
  email: 'admin@core.id',
  password: 'password123',
}

export const mockApi = {
  auth: {
    login: async (email: string, password: string): Promise<{ user: User }> => {
      await delay()
      if (
        email !== MOCK_CREDENTIALS.email ||
        password !== MOCK_CREDENTIALS.password
      ) {
        throw new Error('Email atau password salah')
      }
      const user = users.find((u) => u.email === email)!
      return { user }
    },

    register: async (
      name: string,
      email: string,
      _password: string,
    ): Promise<{ user: User }> => {
      await delay()
      if (users.find((u) => u.email === email)) {
        throw new Error('Email sudah terdaftar')
      }
      const newUser: User = {
        id: String(Date.now()),
        name,
        email,
        role: 'Viewer',
        status: 'Aktif',
        createdAt: new Date().toISOString(),
      }
      users.push(newUser)
      return { user: newUser }
    },
  },

  users: {
    list: async (): Promise<User[]> => {
      await delay()
      return [...users]
    },

    getById: async (id: string): Promise<User> => {
      await delay(400)
      const user = users.find((u) => u.id === id)
      if (!user) throw new Error('Pengguna tidak ditemukan')
      return { ...user }
    },

    create: async (
      data: CreateUserInput,
    ): Promise<User> => {
      await delay()
      if (users.find((u) => u.email === data.email)) {
        throw new Error('Email sudah terdaftar')
      }
      const newUser: User = {
        id: String(Date.now()),
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        status: data.status as UserStatus,
        createdAt: new Date().toISOString(),
      }
      users.push(newUser)
      return newUser
    },

    update: async (id: string, data: Partial<CreateUserInput>): Promise<User> => {
      await delay()
      const idx = users.findIndex((u) => u.id === id)
      if (idx === -1) throw new Error('Pengguna tidak ditemukan')
      users[idx] = { ...users[idx], ...data }
      return { ...users[idx] }
    },

    delete: async (id: string): Promise<void> => {
      await delay()
      const idx = users.findIndex((u) => u.id === id)
      if (idx === -1) throw new Error('Pengguna tidak ditemukan')
      users.splice(idx, 1)
    },
  },

  dashboard: {
    recentActivity: async () => {
      await delay(600)
      return [
        {
          id: '1',
          message: 'Budi Santoso dinonaktifkan',
          time: '2 menit lalu',
          color: '#dc2626',
        },
        {
          id: '2',
          message: 'Siti Aminah ditambahkan sebagai Viewer',
          time: '14 menit lalu',
          color: '#22c55e',
        },
        {
          id: '3',
          message: 'Role Hendra Wijaya diubah ke Editor',
          time: '1 jam lalu',
          color: '#f59e0b',
        },
        {
          id: '4',
          message: 'Admin Utama login dari IP baru',
          time: '3 jam lalu',
          color: '#8b5cf6',
        },
        {
          id: '5',
          message: 'Dewi Lestari mengubah kata sandi',
          time: 'Kemarin',
          color: '#6b7280',
        },
      ]
    },
  },
}
