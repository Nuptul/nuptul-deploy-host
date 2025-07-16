import React, { useState } from 'react';
import { HeroParallax, Sparkles, Card3D } from '../index';
import type { ParallaxImage } from '../hero-parallax';

/**
 * Complete Wedding Page Demo
 * 
 * This demonstrates how to combine all three new Aceternity components
 * to create a complete wedding page experience with advanced interactions.
 */

const WeddingPageDemo: React.FC = () => {
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [showRSVP, setShowRSVP] = useState(false);

  // Sample wedding venue images
  const venueImages: ParallaxImage[] = [
    {
      src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
      alt: "Elegant outdoor wedding ceremony",
      className: "object-cover"
    },
    {
      src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
      alt: "Beautiful garden reception",
      className: "object-cover"
    },
    {
      src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
      alt: "Luxury ballroom setting",
      className: "object-cover"
    }
  ];

  const vendors = [
    {
      id: 'photographer',
      name: 'Elite Wedding Photography',
      description: 'Capturing your precious moments with artistic flair',
      icon: '📸',
      theme: 'romantic' as const
    },
    {
      id: 'florist',
      name: 'Bloom & Blossom',
      description: 'Exquisite floral arrangements for your special day',
      icon: '🌸',
      theme: 'elegant' as const
    },
    {
      id: 'catering',
      name: 'Gourmet Wedding Catering',
      description: 'Culinary excellence for an unforgettable experience',
      icon: '🍽️',
      theme: 'modern' as const
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section with Parallax */}
      <HeroParallax
        images={venueImages}
        coupleNames={{
          bride: "Isabella",
          groom: "Alexander"
        }}
        weddingDate="September 22nd, 2024"
        title="A Love Story Begins"
        subtitle="Join us as we celebrate the beginning of our forever journey together, surrounded by the beauty of nature and the warmth of our loved ones."
        theme="romantic"
        parallaxIntensity={180}
        enableBlur={true}
        className="mb-0"
      >
        {/* Hero CTA Buttons with Sparkle Effects */}
        <Sparkles
          count={15}
          mouseBehavior="follow"
          theme="romantic"
          trigger="hover"
          animationSpeed="medium"
          className="inline-block"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={() => setShowRSVP(true)}
              className="px-8 py-4 bg-white/20 backdrop-blur-md rounded-full text-white font-medium hover:bg-white/30 transition-all duration-300 border border-white/20"
            >
              RSVP Today ✨
            </button>
            <button className="px-8 py-4 border border-white/30 rounded-full text-white font-medium hover:bg-white/10 transition-all duration-300">
              View Our Story
            </button>
          </div>
        </Sparkles>
      </HeroParallax>

      {/* Vendor Selection Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Our Trusted Wedding Partners
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've carefully selected the finest vendors to make your wedding day absolutely perfect
            </p>
          </div>

          {/* Vendor Cards with 3D Effects and Sparkles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {vendors.map((vendor) => (
              <Sparkles
                key={vendor.id}
                count={selectedVendor === vendor.id ? 20 : 8}
                mouseBehavior="ambient"
                theme={vendor.theme}
                trigger="hover"
                animationSpeed="medium"
                density={selectedVendor === vendor.id ? "dense" : "sparse"}
                className="h-full"
              >
                <Card3D
                  theme={vendor.theme}
                  rotationRange={12}
                  glareIntensity={0.3}
                  enableGlow={true}
                  glassmorphism={true}
                  scaleOnHover={1.08}
                  onHover={() => setSelectedVendor(vendor.id)}
                  onLeave={() => setSelectedVendor(null)}
                  onClick={() => alert(`Learn more about ${vendor.name}`)}
                  className="h-80"
                >
                  <div className="text-center space-y-6 p-6">
                    <div className="text-5xl mb-4">{vendor.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {vendor.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {vendor.description}
                    </p>
                    {selectedVendor === vendor.id && (
                      <div className="mt-6">
                        <div className="text-sm font-medium text-purple-600">
                          ✨ Click to learn more
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {vendor.theme} theme active
                        </div>
                      </div>
                    )}
                  </div>
                </Card3D>
              </Sparkles>
            ))}
          </div>
        </div>
      </section>

      {/* RSVP Section with Combined Effects */}
      {showRSVP && (
        <section className="py-20 px-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="max-w-4xl mx-auto">
            <Sparkles
              count={30}
              mouseBehavior="burst"
              theme="romantic"
              trigger="click"
              burstIntensity={20}
              animationSpeed="fast"
              className="p-8 rounded-2xl"
            >
              <Card3D
                theme="romantic"
                rotationRange={8}
                glareIntensity={0.4}
                enableGlow={true}
                glassmorphism={true}
                scaleOnHover={1.05}
                className="max-w-2xl mx-auto"
              >
                <div className="text-center space-y-8 p-8">
                  <h2 className="text-3xl font-bold text-gray-800">
                    We Can't Wait to Celebrate With You! 💕
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Please confirm your attendance so we can prepare for the most magical day of our lives.
                  </p>
                  
                  <div className="space-y-4">
                    <button 
                      className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                      onClick={() => alert('RSVP Yes!')}
                    >
                      Yes, I'll be there! ✨
                    </button>
                    <button 
                      className="w-full py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all duration-300"
                      onClick={() => alert('RSVP No')}
                    >
                      Sorry, I can't make it
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-500 mt-6">
                    Click anywhere for sparkle burst effect! ✨
                  </div>
                  
                  <button
                    onClick={() => setShowRSVP(false)}
                    className="text-sm text-gray-400 underline hover:text-gray-600"
                  >
                    Close RSVP
                  </button>
                </div>
              </Card3D>
            </Sparkles>
          </div>
        </section>
      )}

      {/* Wedding Timeline Section with Trail Sparkles */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Wedding Day Timeline
            </h2>
            <p className="text-lg text-gray-600">
              Move your mouse around to see magical sparkle trails
            </p>
          </div>

          <Sparkles
            count={25}
            mouseBehavior="trail"
            theme="elegant"
            trigger="hover"
            animationSpeed="medium"
            density="normal"
            className="p-8 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50"
          >
            <div className="space-y-8">
              {[
                { time: "3:00 PM", event: "Ceremony Begins", icon: "💒" },
                { time: "4:00 PM", event: "Cocktail Hour", icon: "🥂" },
                { time: "6:00 PM", event: "Reception & Dinner", icon: "🍽️" },
                { time: "8:00 PM", event: "First Dance", icon: "💃" },
                { time: "9:00 PM", event: "Dancing & Celebration", icon: "🎉" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-6 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <div className="text-xl font-semibold text-gray-800">{item.event}</div>
                    <div className="text-gray-600">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Sparkles>
        </div>
      </section>

      {/* Performance Note */}
      <section className="py-12 px-6 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Component Features Showcase
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="bg-white p-6 rounded-lg">
              <h4 className="font-semibold text-purple-600 mb-2">HeroParallax</h4>
              <p className="text-gray-600">Multi-layer parallax scrolling with wedding venue images and elegant typography overlays</p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h4 className="font-semibold text-pink-600 mb-2">Sparkles</h4>
              <p className="text-gray-600">Interactive sparkle effects with multiple behaviors: ambient, follow, burst, and trail</p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h4 className="font-semibold text-blue-600 mb-2">Card3D</h4>
              <p className="text-gray-600">3D tilt cards with glare effects, glow, and glassmorphism integration</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WeddingPageDemo;