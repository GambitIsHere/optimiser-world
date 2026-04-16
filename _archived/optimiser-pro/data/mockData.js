// Dashboard stats
export const DASHBOARD_STATS = {
  activeFlows: 12,
  issuesFound: 47,
  fixesShipped: 23,
  liftAchieved: '12.4%',
}

// Activity feed items
export const MOCK_ACTIVITY = [
  {
    id: 1,
    type: 'fix_merged',
    icon: 'GitMerge',
    message: 'Fix merged: Checkout button color contrast improved',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 2,
    type: 'issue_found',
    icon: 'AlertTriangle',
    message: 'Critical issue detected in payment form conversion',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 3,
    type: 'experiment_started',
    icon: 'Zap',
    message: 'A/B test started: New CTA button placement',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 4,
    type: 'integration',
    icon: 'Plug',
    message: 'GA4 analytics sync completed successfully',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 5,
    type: 'flow_discovered',
    icon: 'GitBranch',
    message: 'New conversion flow discovered: Mobile checkout',
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: 6,
    type: 'scan_complete',
    icon: 'CheckCircle2',
    message: 'AI scan complete: 3 new opportunities found',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
]

// User flows
export const MOCK_FLOWS = [
  {
    id: 'flow-checkout',
    name: 'Checkout Flow',
    completionRate: 68,
    totalVisitors: 24532,
    nodes: [
      {
        id: 'node-1',
        name: 'Product Page',
        visitors: 24532,
        conversion: 92,
        path: '/',
      },
      {
        id: 'node-2',
        name: 'Add to Cart',
        visitors: 22569,
        conversion: 85,
        path: '/products/:id',
      },
      {
        id: 'node-3',
        name: 'Cart Review',
        visitors: 19183,
        conversion: 78,
        path: '/cart',
      },
      {
        id: 'node-4',
        name: 'Payment',
        visitors: 14962,
        conversion: 68,
        path: '/checkout/payment',
      },
      {
        id: 'node-5',
        name: 'Order Complete',
        visitors: 10173,
        conversion: 100,
        path: '/order/success',
      },
    ],
  },
  {
    id: 'flow-signup',
    name: 'Sign Up Flow',
    completionRate: 54,
    totalVisitors: 8243,
    nodes: [
      {
        id: 'node-6',
        name: 'Landing Page',
        visitors: 8243,
        conversion: 78,
        path: '/pricing',
      },
      {
        id: 'node-7',
        name: 'Sign Up Form',
        visitors: 6429,
        conversion: 82,
        path: '/signup',
      },
      {
        id: 'node-8',
        name: 'Email Verification',
        visitors: 5272,
        conversion: 71,
        path: '/verify',
      },
      {
        id: 'node-9',
        name: 'Setup Profile',
        visitors: 3743,
        conversion: 54,
        path: '/onboarding',
      },
    ],
  },
  {
    id: 'flow-mobile',
    name: 'Mobile Checkout',
    completionRate: 61,
    totalVisitors: 12854,
    nodes: [
      {
        id: 'node-10',
        name: 'Mobile Menu',
        visitors: 12854,
        conversion: 88,
        path: '/',
      },
      {
        id: 'node-11',
        name: 'Product View',
        visitors: 11311,
        conversion: 80,
        path: '/products/:id',
      },
      {
        id: 'node-12',
        name: 'Mobile Checkout',
        visitors: 9049,
        conversion: 61,
        path: '/m/checkout',
      },
      {
        id: 'node-13',
        name: 'Confirmation',
        visitors: 5519,
        conversion: 100,
        path: '/order/success',
      },
    ],
  },
]

// Detected issues
export const MOCK_ISSUES = [
  {
    id: 'issue-1',
    title: 'Payment Form Abandonment Rate Too High',
    rootCause: 'Form requires 12 fields but most users abandon after field 5. Mobile users especially struggle with narrow input fields. Suggested solution: implement progressive disclosure to show only critical fields initially.',
    severity: 'critical',
    flow: 'Checkout Flow',
    affectedStep: 'Payment',
    estimatedImpact: 18500,
    impactUnit: 'EUR/month',
    aiConfidence: 94,
    metrics: {
      abandonmentRate: '32%',
      avgTimeOnStep: '4m 23s',
      mobileDropoff: '47%',
      formErrors: 156,
    },
  },
  {
    id: 'issue-2',
    title: 'Mobile Cart Review Friction',
    rootCause: 'Cart page is not optimized for mobile screens. Price calculation and shipping info is hidden below the fold. Users have to scroll significantly to see final price before proceeding.',
    severity: 'high',
    flow: 'Checkout Flow',
    affectedStep: 'Cart Review',
    estimatedImpact: 12300,
    impactUnit: 'EUR/month',
    aiConfidence: 87,
    metrics: {
      mobileConversion: '62%',
      scrollDepth: '58%',
      timeOnPage: '2m 14s',
      bounceRate: '18%',
    },
  },
  {
    id: 'issue-3',
    title: 'Email Verification Completion Low',
    rootCause: 'Verification email takes 2-5 minutes to arrive. Users navigate away thinking email is not sent. No confirmation message on form. Resend button not visible enough.',
    severity: 'high',
    flow: 'Sign Up Flow',
    affectedStep: 'Email Verification',
    estimatedImpact: 8900,
    impactUnit: 'EUR/month',
    aiConfidence: 91,
    metrics: {
      completionRate: '71%',
      avgWaitTime: '3m 22s',
      emailDelayComplaints: 43,
      resendClicks: 892,
    },
  },
  {
    id: 'issue-4',
    title: 'CTA Button Not Visible on Mobile',
    rootCause: 'Primary "Checkout" button is cut off on mobile landscape mode. Users have to scroll right to see it. Button color has insufficient contrast on dark backgrounds.',
    severity: 'critical',
    flow: 'Mobile Checkout',
    affectedStep: 'Product View',
    estimatedImpact: 15600,
    impactUnit: 'EUR/month',
    aiConfidence: 96,
    metrics: {
      landscapeMode: '24%',
      contrastScore: 3.2,
      ctaClickThrough: '71%',
      timeToClickOrScroll: '8.5s',
    },
  },
  {
    id: 'issue-5',
    title: 'Onboarding Profile Setup Incomplete',
    rootCause: 'Users find profile setup step confusing. Required fields are not clearly marked. No inline help text. Many users skip this step entirely.',
    severity: 'medium',
    flow: 'Sign Up Flow',
    affectedStep: 'Setup Profile',
    estimatedImpact: 4200,
    impactUnit: 'EUR/month',
    aiConfidence: 78,
    metrics: {
      skipRate: '46%',
      avgFieldsFilled: 3,
      avgTimeOnStep: '1m 45s',
      supportTickets: 124,
    },
  },
  {
    id: 'issue-6',
    title: 'Product Page Load Time Degradation',
    rootCause: 'High-resolution product images not optimized. Third-party tracking scripts block rendering. Lazy loading not implemented. Desktop users experience visible delay.',
    severity: 'medium',
    flow: 'Checkout Flow',
    affectedStep: 'Product Page',
    estimatedImpact: 6800,
    impactUnit: 'EUR/month',
    aiConfidence: 89,
    metrics: {
      avgLoadTime: '3.2s',
      imageSize: '4.8MB',
      coreWebVitals: 'Poor',
      bounceOnLoad: '12%',
    },
  },
]

// Connected integrations
export const MOCK_INTEGRATIONS = [
  {
    id: 'int-ga4',
    name: 'Google Analytics 4',
    icon: 'TrendingUp',
    status: 'connected',
    lastSync: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'int-posthog',
    name: 'PostHog',
    icon: 'Zap',
    status: 'connected',
    lastSync: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'int-vercel',
    name: 'Vercel',
    icon: 'GitBranch',
    status: 'connected',
    lastSync: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'int-segment',
    name: 'Segment',
    icon: 'Layers',
    status: 'connected',
    lastSync: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: 'int-mixpanel',
    name: 'Mixpanel',
    icon: 'BarChart3',
    status: 'available',
  },
  {
    id: 'int-amplitude',
    name: 'Amplitude',
    icon: 'Activity',
    status: 'available',
  },
  {
    id: 'int-hotjar',
    name: 'Hotjar',
    icon: 'Eye',
    status: 'available',
  },
  {
    id: 'int-intercom',
    name: 'Intercom',
    icon: 'MessageSquare',
    status: 'available',
  },
]

// Applied fixes
export const MOCK_FIXES = [
  {
    id: 'fix-1',
    type: 'code',
    title: 'Fix Payment Form Field Visibility',
    prNumber: 2847,
    status: 'merged',
    diff: `diff --git a/src/components/PaymentForm.jsx b/src/components/PaymentForm.jsx
index 1a2b3c4..5d6e7f8 100644
--- a/src/components/PaymentForm.jsx
+++ b/src/components/PaymentForm.jsx
@@ -12,7 +12,7 @@ export default function PaymentForm() {
   return (
     <form className="payment-form">
       <div className="form-grid">
-        <input type="text" placeholder="Full Name" required />
+        <input type="text" placeholder="Full Name" required className="col-span-2" />
         <input type="email" placeholder="Email" required />
         <input type="tel" placeholder="Phone" />`,
    liftMetric: 'conversion',
    measuredLift: '+8.3%',
    ciStatus: 'success',
  },
  {
    id: 'fix-2',
    type: 'funnel',
    title: 'A/B Test: Simplified Checkout Steps',
    experimentId: 3421,
    status: 'running',
    hypothesis: 'Users will convert at higher rates if we reduce checkout from 5 steps to 3 steps by combining address and shipping into one page.',
    liftMetric: 'conversion',
    predictedLift: '+12.5%',
  },
  {
    id: 'fix-3',
    type: 'code',
    title: 'Optimize Product Image Loading',
    prNumber: 2843,
    status: 'merged',
    diff: `diff --git a/src/components/ProductImage.jsx b/src/components/ProductImage.jsx
index 9a8b7c2..3f4e1d9 100644
--- a/src/components/ProductImage.jsx
+++ b/src/components/ProductImage.jsx
@@ -1,5 +1,6 @@
 import Image from 'next/image'
 export default function ProductImage({ src }) {
   return (
-    <img src={src} alt="product" />
+    <Image src={src} alt="product"
+      priority={true} sizes="(max-width: 768px) 100vw" />`,
    liftMetric: 'page speed',
    measuredLift: '+2.1s faster',
    ciStatus: 'success',
  },
  {
    id: 'fix-4',
    type: 'funnel',
    title: 'Test Email Verification Improvements',
    experimentId: 3419,
    status: 'completed',
    hypothesis: 'Adding a resend button and countdown timer will improve email verification completion rates by 15%.',
    liftMetric: 'completion',
    measuredLift: '+18.7%',
  },
  {
    id: 'fix-5',
    type: 'code',
    title: 'Improve Mobile CTA Button Visibility',
    prNumber: 2841,
    status: 'merged',
    diff: `diff --git a/src/components/ProductCard.jsx b/src/components/ProductCard.jsx
index 4d5c3e1..2f8a9b4 100644
--- a/src/components/ProductCard.jsx
+++ b/src/components/ProductCard.jsx
@@ -15,7 +15,7 @@ export default function ProductCard({ product }) {
-      <button className="cta-button text-sm">Add to Cart</button>
+      <button className="cta-button text-lg py-3 sticky bottom-0 w-full lg:static">
+        Add to Cart
+      </button>`,
    liftMetric: 'cta clicks',
    measuredLift: '+24.5%',
    ciStatus: 'success',
  },
  {
    id: 'fix-6',
    type: 'funnel',
    title: 'Profile Setup Field Reduction',
    experimentId: 3415,
    status: 'running',
    hypothesis: 'Reducing required profile fields from 8 to 4 will increase completion rate and reduce support tickets.',
    liftMetric: 'completion',
    predictedLift: '+22.3%',
  },
]
