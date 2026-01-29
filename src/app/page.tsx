import dynamic from 'next/dynamic'
import { HeroCarousel } from "@/components/home/hero-carousel"
import { Skeleton } from "@/components/ui/skeleton"

// Lazy load heavy components below the fold to reduce initial bundle size
// and memory usage (Optimasi Payload & Memory)
const StrategicFeatures = dynamic(
  () => import("@/components/home/strategic-features").then(mod => mod.StrategicFeatures),
  {
    loading: () => <SectionSkeleton height="h-[600px]" />,
    ssr: true // Keep SSR for SEO but hydrate later
  }
)

const FeatureCatalogue = dynamic(
  () => import("@/components/home/feature-catalogue").then(mod => mod.FeatureCatalogue),
  { loading: () => <SectionSkeleton height="h-[400px]" /> }
)

const AdministrationHub = dynamic(
  () => import("@/components/home/administration-hub").then(mod => mod.AdministrationHub),
  { loading: () => <SectionSkeleton height="h-[300px]" /> }
)

const AiKesimpulanHub = dynamic(
  () => import("@/components/AiDecisionHub"),
  { loading: () => <SectionSkeleton height="h-[500px]" /> }
)

const ContactSection = dynamic(
  () => import("@/components/home/contact-section").then(mod => mod.ContactSection),
  { loading: () => <SectionSkeleton height="h-[400px]" /> }
)

// Reusable Skeleton Component for better UX during loading
function SectionSkeleton({ height }: { height: string }) {
  return (
    <div className={`w-full ${height} container mx-auto px-4 py-12 space-y-4`}>
      <Skeleton className="h-8 w-1/3 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Critical Rendering Path - Load Immediately */}
      <HeroCarousel />

      {/* Deferred Rendering - Load when needed/idle */}
      <FeatureCatalogue />

      <AdministrationHub />

      <section id="ai-kesimpulan">
        <AiKesimpulanHub />
      </section>

      {/* Strategic Recommendations Section */}
      <section id="rekomendasi-strategis">
        <StrategicFeatures />
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Tentang PRISMA RT 04</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Platform Realisasi Informasi, Sistem Manajemen & Administrasi (PRISMA) adalah inisiatif digital warga RT 04 Kemayoran untuk mewujudkan lingkungan yang guyub, transparan, dan aman. Kami berkomitmen memberikan pelayanan terbaik bagi seluruh warga.
          </p>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
