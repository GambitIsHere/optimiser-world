import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './lib/AuthContext'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/ui/Layout'
import ErrorBoundary from './components/ui/ErrorBoundary'

// Eagerly load the landing page (first paint)
import Home from './pages/Home'

// Lazy-load everything else — each becomes its own chunk
const Browse = lazy(() => import('./pages/Browse'))
const Category = lazy(() => import('./pages/Category'))
const ItemDetail = lazy(() => import('./pages/ItemDetail'))
const Submit = lazy(() => import('./pages/Submit'))
const Profile = lazy(() => import('./pages/Profile'))
const Collections = lazy(() => import('./pages/Collections'))
const CollectionDetail = lazy(() => import('./pages/CollectionDetail'))
const Trending = lazy(() => import('./pages/Trending'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))
const Search = lazy(() => import('./pages/Search'))
const Flows = lazy(() => import('./pages/Flows'))
const Diagnose = lazy(() => import('./pages/Diagnose'))
const Connect = lazy(() => import('./pages/Connect'))
const Heal = lazy(() => import('./pages/Heal'))
const About = lazy(() => import('./pages/About'))
const Login = lazy(() => import('./pages/Login'))
const Pricing = lazy(() => import('./pages/Pricing'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-mint/30 border-t-mint rounded-full animate-spin" />
        <span className="text-white/40 text-sm">Loading...</span>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/browse/:category" element={<Category />} />
              <Route path="/item/:id" element={<ItemDetail />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/user/:username" element={<Profile />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/collection/:id" element={<CollectionDetail />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/flows" element={<Flows />} />
              <Route path="/diagnose" element={<Diagnose />} />
              <Route path="/connect" element={<Connect />} />
              <Route path="/heal" element={<Heal />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            </Routes>
          </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
