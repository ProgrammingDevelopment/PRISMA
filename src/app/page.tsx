import { HeroCarousel } from "@/components/home/hero-carousel"
import { ContactSection } from "@/components/home/contact-section"
import { FeatureCatalogue } from "@/components/home/feature-catalogue"
import { AdministrationHub } from "@/components/home/administration-hub"
import AiDecisionHub from "@/components/AiDecisionHub"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroCarousel />

      <FeatureCatalogue />

      <AdministrationHub />

      <AiDecisionHub />

      {/* About Section - Keeping as requested but slightly modified to fit new flow if needed, 
           or just removing if the new sections replace it. The prompt asked to DESIGN the specific sections.
           I will keep a small About blurb if it fits, but the new sections cover most things.
           The 'Tentang Kami' is in the navbar. Let's keep a brief section.
       */}
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
