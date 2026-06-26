import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VideoHero, CapabilitiesStrip, LandingCta } from "@/components/VideoHero";
import { SITE } from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="landing-hero">
          <div className="container-page">
            <p className="eyebrow mb-4">Demo · Tienda agéntica</p>
            <h1 className="section-title max-w-4xl">
              ¿Y si tu tienda entendiera lo que quieres y navegara por ti?
            </h1>
            <p className="section-copy mt-6">
              {SITE.name} es una demo de compra asistida por voz: un asistente que conoce el
              catálogo, resalta productos, te lleva a donde necesitas y mete cosas al carrito
              mientras habla contigo.
            </p>
            <LandingCta />
            <VideoHero />
            <CapabilitiesStrip />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
