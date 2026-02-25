import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      sessionStorage.setItem('splashShown', 'true');
      navigate({ to: '/' });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FFFFF0 0%, #FFFFF0 50%, #DAA520 100%)',
      }}
    >
      {/* Top 20% - Logo */}
      <div className="flex flex-col items-center justify-center" style={{ flex: '0 0 20%', paddingTop: '40px' }}>
        <div
          className="font-poppins font-bold text-center leading-tight"
          style={{ fontSize: '48px', color: '#8B4513' }}
        >
          समृद्धिस्रोत
        </div>
      </div>

      {/* Center 50% - Tagline */}
      <div className="flex flex-col items-center justify-center" style={{ flex: '0 0 50%' }}>
        <img
          src="/assets/generated/logo-mark.dim_256x256.png"
          alt="SamriddhiSrot"
          className="w-24 h-24 object-contain mb-6 opacity-80"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <p
          className="font-playfair italic text-center px-8"
          style={{ fontSize: '20px', color: '#DAA520' }}
        >
          "Rare Producers, Direct Connection"
        </p>
      </div>

      {/* Bottom 20% - Loader */}
      <div className="flex flex-col items-center justify-center gap-3 pb-12" style={{ flex: '0 0 20%' }}>
        <div
          className="w-10 h-10 rounded-full border-4 border-t-transparent spinner-cw"
          style={{ borderColor: '#8B4513', borderTopColor: 'transparent' }}
        />
        <p
          className="font-roboto text-center"
          style={{ fontSize: '14px', color: '#8B4513' }}
        >
          Connecting artisans...
        </p>
      </div>
    </div>
  );
}
