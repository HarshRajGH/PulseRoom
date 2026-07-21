import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from '@/store/store'
import { ThemeProvider } from '@/app/ThemeProvider'
import { AuthProvider } from '@/app/AuthProvider'
import { SocketProvider } from '@/app/SocketProvider'
import App from '@/app/App'
import PageLoader from '@/components/ui/PageLoader'
import '@/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <App />
              </Suspense>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: '#211D2E',
                    color: '#F7F5FA',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    fontSize: '14px',
                  },
                }}
              />
            </BrowserRouter>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
