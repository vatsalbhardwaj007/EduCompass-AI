import EduCompassBrand from "@/components/EduCompassBrand";

interface EduCompassLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function EduCompassLogo({
  className = "",
  size = "md",
}: EduCompassLogoProps) {
  return (
    <EduCompassBrand
      className={`educompass-brand--${size} ${className}`}
      descriptor={size !== "sm"}
    />
  );
}
