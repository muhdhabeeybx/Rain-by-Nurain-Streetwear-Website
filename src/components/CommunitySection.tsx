import { Button } from "./ui/button";
import { Instagram } from "lucide-react";

export function CommunitySection() {
  return (
    <section className="bg-black text-white py-24">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Community CTA */}
        <div className="mb-8">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Join the Tribe
          </h2>
          <p className="text-lg lg:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Connect with a global community of creators, hustlers, and dreamers. 
            Share your story, inspire others, and be part of something bigger.
          </p>
          <Button
            size="lg"
            onClick={() =>
              window.open("https://www.instagram.com/rainbynurain", "_blank")
            }
            className="bg-black text-white hover:bg-gray-100 font-normal tracking-wide px-4 py-6 text-sm uppercase mx-auto mobile-keep-center transition-all duration-200 flex items-center gap-3"
          >
            <Instagram className="w-5 h-5" />
            Join on Instagram
          </Button>
        </div>
      </div>
    </section>
  );
}
