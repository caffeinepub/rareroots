import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ to: "/home" });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden"
      style={{
        backgroundImage: "url('/assets/generated/splash-bg.dim_1080x1920.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-earthBrown/70" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
        <img
          src="/assets/generated/logo-wordmark.dim_400x120.png"
          alt="SamriddhiSrot"
          className="w-64 md:w-80 object-contain drop-shadow-lg"
        />

        <p className="font-playfair italic text-sandGold text-xl md:text-2xl leading-relaxed">
          Own the Story Behind What You Wear
        </p>

        {/* Spinner */}
        <div className="mt-4 w-10 h-10 border-4 border-sandGold/30 border-t-earthBrown rounded-full animate-spin" />
      </div>
    </div>
  );
}
