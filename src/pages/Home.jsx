import SEO from '../components/ui/SEO'
import HeroSection from '../components/landing/HeroSection'
import SocialProof from '../components/landing/SocialProof'
import StatsStrip from '../components/landing/StatsStrip'
import ThreeStepFlow from '../components/landing/ThreeStepFlow'
import ComparisonTable from '../components/landing/ComparisonTable'
import TestimonialCards from '../components/landing/TestimonialCards'
import MarketplaceBridge from '../components/landing/MarketplaceBridge'
import FeaturedCards from '../components/landing/FeaturedCards'
import CategoryGrid from '../components/landing/CategoryGrid'
import PricingCards from '../components/landing/PricingCards'
import FinalCTA from '../components/landing/FinalCTA'
import Footer from '../components/landing/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-bg">
      <SEO path="/" />
      {/* Product intelligence story */}
      <HeroSection />
      <SocialProof />
      <StatsStrip />
      <ThreeStepFlow />
      <ComparisonTable />
      <TestimonialCards />

      {/* Marketplace showcase */}
      <MarketplaceBridge />
      <FeaturedCards />
      <CategoryGrid />

      {/* Conversion */}
      <PricingCards />
      <FinalCTA />
      <Footer />
    </div>
  )
}
