export function ScrollingTicker() {
  const messages = [
    "Rain by Nurain",
    "Left Home to Feed Home",
    "For the Hustlers",
    "For the Dreamers",
    "Wear the Movement",
  ];

  return (
    <div className="bg-black text-white py-[30px] overflow-hidden border-t border-b border-gray-800">
      <div className="whitespace-nowrap animate-marquee">
        <div className="inline-flex items-center space-x-12">
          {/* Repeat messages for continuous scroll */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="inline-flex items-center space-x-12">
              {messages.map((message, index) => (
                <span
                  key={index}
                  className="text-base md:text-lg font-semibold tracking-[0.15em] uppercase opacity-90 hover:opacity-100 transition-opacity duration-200"
                >
                  {message}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes marquee {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }

            .animate-marquee {
              display: inline-block;
              min-width: 200%;
              animation: marquee 40s linear infinite;
            }
          `,
        }}
      />
    </div>
  );
}
