import LandingHeader from "@/components/landing/LandingHeader";
import LandingMotion from "@/components/landing/LandingMotion";
import ScrollLaptopExperience from "@/components/landing/ScrollLaptopExperience";
import {
  DecisionSection,
  DimensionsSection,
  FamiliesSection,
  FinalCtaSection,
  LandingFooter,
  MethodSection,
  PrincipleSection,
} from "@/components/landing/LandingSections";

export default function LandingPage() {
  return (
    <main className="landing-v2">
      <LandingHeader />
      <ScrollLaptopExperience />
      <LandingMotion>
        <DecisionSection />
        <MethodSection />
        <DimensionsSection />
        <FamiliesSection />
        <PrincipleSection />
        <FinalCtaSection />
        <LandingFooter />
      </LandingMotion>
    </main>
  );
}
