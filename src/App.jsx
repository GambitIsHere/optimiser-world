import { Routes, Route } from 'react-router-dom';
import TopNav from './components/layout/TopNav.jsx';
import Footer from './components/layout/Footer.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';

import Home from './pages/Home.jsx';
import Browse from './pages/Browse.jsx';
import Search from './pages/Search.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import Trending from './pages/Trending.jsx';
import Category from './pages/Category.jsx';
import Collections from './pages/Collections.jsx';
import CollectionDetail from './pages/CollectionDetail.jsx';
import Submit from './pages/Submit.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <TopNav />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/search" element={<Search />} />
            <Route path="/item/:slug" element={<ItemDetail />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/c/:slug" element={<Category />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collection/:slug" element={<CollectionDetail />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/u/:username" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}

function NotFound() {
  return (
    <div className="max-w-[800px] mx-auto px-6 lg:px-8 py-24 text-center">
      <div className="font-display text-[clamp(96px,16vw,180px)] leading-none mb-6 text-[#F54E00]">404</div>
      <h1 className="text-[32px] font-extrabold tracking-tight mb-4">
        That page isn't <span className="hl">indexed</span>.
      </h1>
      <p className="text-[15px] text-[#6B6E66] mb-8 max-w-[48ch] mx-auto">
        Try searching for what you wanted, or head back to the feed.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <a href="/browse" className="inline-flex items-center gap-2 font-semibold text-[14px] px-5 py-2.5 rounded-full bg-[#F54E00] text-white border border-[#151515] shadow-[3px_3px_0_#151515] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_#151515] transition">
          Browse the feed
        </a>
        <a href="/search" className="inline-flex items-center gap-2 font-semibold text-[14px] px-5 py-2.5 rounded-full bg-white border border-[#151515] shadow-[3px_3px_0_#151515] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_#151515] transition">
          Search
        </a>
      </div>
    </div>
  );
}
