import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { Portfolio } from "@/components/landing/Portfolio";
import { Process } from "@/components/landing/Process";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  useScrollReveal();

  return (
    <>
      {/* SEO: H1 lives in <Hero>. Single H1 per page. */}
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Portfolio />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default Index;
