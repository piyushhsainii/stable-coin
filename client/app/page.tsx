import { ShaderBackground } from "@/components/shader-background";
import { MatrixBackground } from "@/components/matrix-background";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { HowItWorks } from "@/components/how-it-works";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen text-foreground">
      <ShaderBackground />
      <MatrixBackground />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Access the full protocol dashboard to deposit SOL, mint
              stablecoins, and participate in liquidations.
            </p>
            <Link href="/dashboard" className="z-50 absolute inset-0 ">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Launch Dashboard
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
