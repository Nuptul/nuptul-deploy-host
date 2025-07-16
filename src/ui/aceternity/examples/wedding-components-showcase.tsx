import React, { useState } from 'react';
import { HeroParallax, Sparkles, Card3D } from '../index';
import type { ParallaxImage } from '../hero-parallax';

/**
 * Wedding Components Showcase - Examples of advanced Aceternity UI components
 * 
 * This file demonstrates the three new components:
 * 1. HeroParallax - Parallax hero section for wedding venues
 * 2. Sparkles - Animated sparkle effects for romantic interactions
 * 3. Card3D - 3D cards with tilt and hover effects
 */

// Sample wedding venue images for HeroParallax
const weddingVenueImages: ParallaxImage[] = [
  {
    src: "/src/assets/wedding-hero.jpg",
    alt: "Elegant wedding ceremony venue",
    className: "object-cover"
  },
  {
    src: "/src/assets/wedding-background.jpg", 
    alt: "Beautiful wedding reception hall",
    className: "object-cover"
  },
  // Add more images as needed - these will work with any image URLs
  {
    src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    alt: "Outdoor wedding venue",
    className: "object-cover"
  },
  {
    src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    alt: "Garden wedding ceremony",
    className: "object-cover"
  },
  {
    src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    alt: "Luxury wedding reception",
    className: "object-cover"
  }
];

const WeddingComponentsShowcase: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <div className="w-full">
      {/* HeroParallax Example */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-wedding-navy">
          HeroParallax Component
        </h2>
        <div className="relative">
          <HeroParallax
            images={weddingVenueImages}
            coupleNames={{
              bride: "Sarah",
              groom: "Michael"
            }}
            weddingDate="June 15th, 2024"
            title="Together Forever"
            subtitle="Join us as we celebrate our love story with family and friends at the most magical day of our lives."
            theme="romantic"
            parallaxIntensity={150}
            enableBlur={true}
            className="rounded-lg overflow-hidden"
          >
            {/* Custom content can go here */}
            <div className="flex gap-4 justify-center mt-8">
              <button className="px-8 py-3 bg-white/20 backdrop-blur-md rounded-full text-white font-medium hover:bg-white/30 transition-all duration-300">
                RSVP Now
              </button>
              <button className="px-8 py-3 border border-white/30 rounded-full text-white font-medium hover:bg-white/10 transition-all duration-300">
                View Gallery
              </button>
            </div>
          </HeroParallax>
        </div>
      </section>

      {/* Sparkles Examples */}
      <section className="mb-16 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-8 text-wedding-navy">
          Sparkles Component Examples
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Ambient Sparkles */}
          <div className="relative">
            <h3 className="text-xl font-semibold mb-4 text-center">Ambient Sparkles</h3>
            <Sparkles
              count={15}
              mouseBehavior="ambient"
              theme="romantic"
              animationSpeed="medium"
              density="normal"
              className="h-64 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-200/30"
            >
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-gray-600 font-medium">
                  Continuous romantic sparkles
                </p>
              </div>
            </Sparkles>
          </div>

          {/* Mouse Follow Sparkles */}
          <div className="relative">
            <h3 className="text-xl font-semibold mb-4 text-center">Mouse Follow</h3>
            <Sparkles
              count={25}
              mouseBehavior="follow"
              theme="elegant"
              animationSpeed="fast"
              trigger="hover"
              className="h-64 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200/30"
            >
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-gray-600 font-medium">
                  Hover to see sparkles follow your mouse
                </p>
              </div>
            </Sparkles>
          </div>

          {/* Click Burst Sparkles */}
          <div className="relative">
            <h3 className="text-xl font-semibold mb-4 text-center">Click Burst</h3>
            <Sparkles
              count={30}
              mouseBehavior="burst"
              theme="modern"
              animationSpeed="fast"
              trigger="click"
              burstIntensity={15}
              className="h-64 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200/30 cursor-pointer"
            >
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-gray-600 font-medium">
                  Click anywhere for sparkle burst
                </p>
              </div>
            </Sparkles>
          </div>
        </div>
      </section>

      {/* Card3D Examples */}
      <section className="mb-16 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-8 text-wedding-navy">
          Card3D Component Examples
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Romantic Wedding Card */}
          <Card3D
            theme="romantic"
            rotationRange={12}
            glareIntensity={0.4}
            enableGlow={true}
            glassmorphism={true}
            scaleOnHover={1.08}
            onHover={() => setActiveCard('romantic')}
            onLeave={() => setActiveCard(null)}
            className="h-80"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">💕</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Our Love Story</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                From our first meeting to this magical day, every moment has been a beautiful chapter in our love story.
              </p>
              {activeCard === 'romantic' && (
                <div className="mt-4 text-pink-600 text-xs font-medium">
                  ✨ Romantic theme active
                </div>
              )}
            </div>
          </Card3D>

          {/* Elegant Venue Card */}
          <Card3D
            theme="elegant"
            rotationRange={15}
            glareIntensity={0.2}
            enableGlow={true}
            glassmorphism={true}
            scaleOnHover={1.06}
            onHover={() => setActiveCard('elegant')}
            onLeave={() => setActiveCard(null)}
            className="h-80"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏛️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Elegant Venue</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                A sophisticated setting with timeless architecture, perfect for an elegant celebration of love.
              </p>
              {activeCard === 'elegant' && (
                <div className="mt-4 text-gray-600 text-xs font-medium">
                  ✨ Elegant theme active
                </div>
              )}
            </div>
          </Card3D>

          {/* Modern RSVP Card */}
          <Card3D
            theme="modern"
            rotationRange={18}
            glareIntensity={0.3}
            enableGlow={true}
            glassmorphism={false}
            scaleOnHover={1.1}
            onHover={() => setActiveCard('modern')}
            onLeave={() => setActiveCard(null)}
            onClick={() => alert('RSVP functionality would go here!')}
            className="h-80"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">RSVP Today</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Let us know if you'll be joining us for our special day. Your presence means the world to us.
              </p>
              {activeCard === 'modern' && (
                <div className="mt-4 text-blue-600 text-xs font-medium">
                  ✨ Modern theme active - Click me!
                </div>
              )}
            </div>
          </Card3D>
        </div>
      </section>

      {/* Combined Example */}
      <section className="mb-16 max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-8 text-wedding-navy">
          Combined Effects
        </h2>
        
        <Sparkles
          count={20}
          mouseBehavior="trail"
          theme="romantic"
          animationSpeed="medium"
          trigger="hover"
          className="p-8 rounded-xl bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50"
        >
          <Card3D
            theme="romantic"
            rotationRange={10}
            glareIntensity={0.3}
            enableGlow={true}
            glassmorphism={true}
            className="max-w-md mx-auto"
          >
            <div className="text-center space-y-6 p-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Sarah & Michael
              </h3>
              <p className="text-gray-600">
                Hover over this area to see sparkles follow your mouse while the card tilts in 3D space!
              </p>
              <div className="text-sm text-gray-500">
                Perfect for interactive wedding invitations
              </div>
            </div>
          </Card3D>
        </Sparkles>
      </section>

      {/* Usage Examples */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-wedding-navy">
          Implementation Examples
        </h2>
        
        <div className="bg-gray-50 rounded-xl p-6 space-y-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">HeroParallax Usage:</h4>
            <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`import { HeroParallax } from '@/ui/aceternity';

<HeroParallax
  images={venueImages}
  coupleNames={{ bride: "Sarah", groom: "Michael" }}
  weddingDate="June 15th, 2024"
  theme="romantic"
  parallaxIntensity={150}
/>`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Sparkles Usage:</h4>
            <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`import { Sparkles } from '@/ui/aceternity';

<Sparkles
  count={25}
  mouseBehavior="follow"
  theme="romantic"
  trigger="hover"
>
  {/* Your content here */}
</Sparkles>`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Card3D Usage:</h4>
            <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`import { Card3D } from '@/ui/aceternity';

<Card3D
  theme="romantic"
  rotationRange={15}
  glareIntensity={0.3}
  enableGlow={true}
  glassmorphism={true}
>
  {/* Your card content */}
</Card3D>`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WeddingComponentsShowcase;