import { useNavigate } from "@tanstack/react-router";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "220px" }}>
      <img
        src="/assets/generated/hero-banner.dim_1440x600.png"
        alt="Hero Banner"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-earthBrown/80 via-earthBrown/40 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center px-6">
        <h1 className="font-playfair text-ivoryCream text-2xl font-bold leading-tight mb-1">
          Discover Rare
          <br />
          <span className="text-sandGold italic">Artisan Crafts</span>
        </h1>
        <p className="font-roboto text-ivoryCream/90 text-sm mb-4">
          Direct from India's master weavers
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => navigate({ to: "/products" })}
            className="bg-sandGold text-earthBrown font-poppins font-semibold text-xs px-4 py-2 rounded-full hover:bg-sandGold/90 transition-colors"
          >
            Shop Now
          </button>
          <button
            onClick={() => navigate({ to: "/live-sessions" })}
            className="border border-ivoryCream text-ivoryCream font-poppins text-xs px-4 py-2 rounded-full hover:bg-ivoryCream/10 transition-colors"
          >
            Watch Live
          </button>
        </div>
      </div>
    </div>
  );
}
