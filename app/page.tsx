import { Section } from "@/app/components/ui/Section";
import { HeroSection } from "@/app/components/ui/HeroSection";
import { LogoStrip } from "@/app/components/ui/LogoStrip";
import { TestimonialCarousel } from "@/app/components/ui/TestimonialCarousel";
import { MetricsDisplay } from "@/app/components/ui/MetricsDisplay";
import { TrustBadges } from "@/app/components/ui/TrustBadges";
import { TabPanel } from "@/app/components/ui/TabPanel";
import { ROICalculator } from "@/app/components/ui/ROICalculator";
import { DemoPreview } from "@/app/components/ui/DemoPreview";
import { NewsletterSignup } from "@/app/components/ui/NewsletterSignup";
import { Grid } from "@/app/components/ui/Grid";
import { FeatureCard } from "@/app/components/ui/FeatureCard";
import { CTASection } from "@/app/components/ui/CTASection";
import {
  clientLogos,
  testimonials,
  metrics,
  trustBadges,
  featureTabs,
  demoHotspots,
} from "@/app/data/homepage";

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <HeroSection
        title="Transform Your Construction Management"
        subtitle="Streamline projects, boost efficiency, and deliver results with the most comprehensive construction management platform."
        primaryCta={{ text: "Start Free Trial", href: "/register" }}
        secondaryCta={{ text: "Schedule Demo", href: "/demo" }}
        backgroundImage="/images/hero-bg.jpg"
      />

      {/* Client Logo Strip */}
      <LogoStrip
        title="Trusted by leading construction companies"
        logos={clientLogos}
      />

      {/* Core Metrics */}
      <Section className="bg-gray-50">
        <MetricsDisplay metrics={metrics} />
      </Section>

      {/* Testimonials */}
      <Section>
        <TestimonialCarousel testimonials={testimonials} />
      </Section>

      {/* Trust Badges */}
      <Section className="bg-gray-50">
        <TrustBadges badges={trustBadges} />
      </Section>

      {/* Feature Tabs Section */}
      <Section>
        <TabPanel tabs={featureTabs} />
        <Grid>
          {featureTabs[0].content.features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </Grid>
      </Section>

      {/* Interactive Demo Section */}
      <Section className="bg-gray-50">
        <DemoPreview
          imageUrl="/images/demo-preview.png"
          hotspots={demoHotspots}
        />
      </Section>

      {/* ROI Calculator Section */}
      <Section>
        <ROICalculator />
      </Section>

      {/* Newsletter Signup */}
      <Section className="bg-gray-50">
        <NewsletterSignup />
      </Section>

      {/* Final CTA Section */}
      <CTASection>
        <h2 className="text-3xl font-bold text-[rgb(24,62,105)] mb-4">
          Ready to Transform Your Construction Management?
        </h2>
        <p className="text-lg mb-8">
          Join thousands of construction professionals who trust BuildTrack Pro
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/register"
            className="px-8 py-3 bg-[rgb(236,107,44)] text-white rounded-lg hover:bg-[rgb(24,62,105)] transition-colors font-medium"
          >
            Start Free Trial
          </a>
          <a
            href="/demo"
            className="px-8 py-3 text-[rgb(24,62,105)] border-2 border-[rgb(24,62,105)] rounded-lg hover:bg-[rgb(24,62,105)] hover:text-white transition-colors font-medium"
          >
            Schedule Demo
          </a>
        </div>
      </CTASection>
    </main>
  );
}
