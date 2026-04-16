import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import Sidebar from './components/dashboard/Sidebar'
import PulseRing from './components/ui/PulseRing'

// Lazy-load pages for code-splitting
const Home = lazy(() => import('./pages/Home'))
const Pricing = lazy(() => import('./pages/Pricing'))
const About = lazy(() => import('./pages/About'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Flows = lazy(() => import('./pages/Flows'))
const Diagnose = lazy(() => import('./pages/Diagnose'))
const Heal = lazy(() => import('./pages/Heal'))
const Connect = lazy(() => import('./pages/Connect'))
const Settings = lazy(() => import('./pages/Settings'))

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <PulseRing label="Scanning signals..." size="lg" />
    </div>
  )
}

/** Layout for authenticated dashboard pages */
function DashboardLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <main className="md:ml-16 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<PulseRing label="Loading intelligence..." className="py-32" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  )
}

/** Route guard: redirects to /login if not authenticated */
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <DashboardLayout />
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />

        {/* Protected dashboard routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/flows" element={<Flows />} />
          <Route path="/diagnose" element={<Diagnose />} />
          <Route path="/heal" element={<Heal />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
