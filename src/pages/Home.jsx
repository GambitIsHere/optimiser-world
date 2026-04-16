import HeroSection from '../components/landing/HeroSection'
import SocialProof from '../components/landing/SocialProof'
import ThreeStepFlow from '../components/landing/ThreeStepFlow'
import ComparisonTable from '../components/landing/ComparisonTable'
import TestimonialCards from '../components/landing/TestimonialCards'
import PricingCards from '../components/landing/PricingCards'
import Footer from '../components/landing/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-bg">
      <HeroSection />
      <SocialProof />
      <ThreeStepFlow />
      <ComparisonTable />
      <TestimonialCards />
      <PricingCards />
      <Footer />
    </div>
  )
}
