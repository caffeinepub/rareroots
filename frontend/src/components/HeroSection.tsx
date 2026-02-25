import React from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[520px] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/assets/generated/hero-banner.dim_1440x600.png"
          alt="Artisan crafting"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest/85 via-forest/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="h-4 w-4 text-terracotta-light" />
            <span className="text-sm font-medium text-cream/80 uppercase tracking-widest">
              Direct from the Source
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-cream leading-tight mb-4">
            Rare Finds,<br />
            <span className="text-terracotta-light">Real Stories</span>
          </h1>
          <p className="text-cream/85 text-lg mb-8 leading-relaxed">
            Discover unique regional products crafted by artisan producers. Hear their stories, watch them create, and buy directly — no middlemen.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-terracotta hover:bg-terracotta-dark text-primary-foreground border-0 shadow-artisan">
              <Link to="/products">
                Explore Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-cream/60 text-cream hover:bg-cream/10 hover:text-cream">
              <Link to="/live-sessions">
                Watch Live Sessions
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
