import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import GoalChips from "@/components/GoalChips";
import JourneySteps from "@/components/JourneySteps";
import Footer from "../components/Footer";
import Plans from "@/components/plans";
import CTA from "@/components/CTA";
export default function Home() {
return (
<>
  <Navbar />
  <Hero />
  <GoalChips />
  <JourneySteps />
  <Plans />
  <CTA />
  <Footer />
</>
  );
}