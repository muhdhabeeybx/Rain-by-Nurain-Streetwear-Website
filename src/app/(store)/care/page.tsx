import type { Metadata } from "next";
import { CareGuide } from "@/components/store/care-guide";
import { InfoPage } from "@/components/store/info-page";
import { banners } from "@/config/imagery";

export const metadata: Metadata = {
  title: "Garment care",
  description: "How to wash, dry and store your Rain by Nurain pieces so prints and fabric last.",
  alternates: { canonical: "/care" },
};

export default function CarePage() {
  return (
    <InfoPage
      eyebrow="Help"
      title="Garment care"
      intro="A little care keeps your pieces looking new. Prints especially last longer when they're washed and ironed inside out."
      banner={banners.care}
    >
      <div className="not-prose">
        <CareGuide />
      </div>
    </InfoPage>
  );
}
