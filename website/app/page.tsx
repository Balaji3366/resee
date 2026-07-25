import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Stats from "../components/Stats";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";
import Dashboard from "../components/Dashboard";
import Plans from "@/components/plans";
import CTA from "@/components/CTA";
export default function Home() {
return (
<>
  <Navbar />
  <Hero />
  <Features />
  <Plans />
  <Stats />
  <Testimonials />
  <CTA />
  <Footer />
</>
  );
}