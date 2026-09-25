import Link from "next/link";
import { Compass } from "lucide-react";

interface EduCompassBrandProps {
  className?: string;
  descriptor?: boolean;
}

export default function EduCompassBrand({
  className = "",
  descriptor = false,
}: EduCompassBrandProps) {
  return (
    <Link href="/" className={`educompass-brand ${className}`.trim()} aria-label="EduCompass home">
      <span className="educompass-brand-mark" aria-hidden="true">
        <Compass size={17} strokeWidth={1.8} />
      </span>
      <span className="educompass-brand-copy">
        <span className="educompass-brand-wordmark">EduCompass</span>
        {descriptor && (
          <span className="educompass-brand-descriptor">Smart engineering admissions</span>
        )}
      </span>
    </Link>
  );
}
