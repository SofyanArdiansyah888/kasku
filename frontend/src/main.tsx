import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider, defaultTheme } from '@adobe/react-spectrum'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { queryClient } from './lib/query-client'
import { router } from './router'
import './index.css'

function InnerApp() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}

function App() {
  return (
    <Provider theme={defaultTheme} colorScheme="light" locale="id-ID">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <InnerApp />
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
