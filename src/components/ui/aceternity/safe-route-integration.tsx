import React from 'react';
import { SafeAceternityWrapper, AceternityRouter, useSafetyMonitoring } from './safety-system';
import { useFeatureFlag } from '@/components/feature-flags/FeatureFlag';
import { cn } from '@/lib/utils';

/**
 * Safe Route Integration Examples
 * 
 * Demonstrates how to integrate Aceternity components safely
 * with routing, lazy loading, and feature flag protection
 */

/**
 * Enhanced Home Page with Safe Aceternity Integration
 */
export const SafeHomePage: React.FC = () => {
  const phase31Enabled = useFeatureFlag('phase3.1');
  const phase32Enabled = useFeatureFlag('phase3.2');
  const { reportError, reportPerformanceIssue } = useSafetyMonitoring();

  return (
    <AceternityRouter 
      phase31Enabled={phase31Enabled}
      phase32Enabled={phase32Enabled}
    >
      {(components) => (
        <div className="min-h-screen">
          {/* Hero Section with Safe Parallax */}
          {components.HeroParallax ? (
            <SafeAceternityWrapper
              componentName="HeroParallax"
              featureFlag="phase3.2"
              onError={(error) => reportError('HeroParallax', error)}
              className="min-h-screen"
            >
              <components.HeroParallax
                images={[
                  { src: '/api/placeholder/800/600', alt: 'Wedding venue 1' },
                  { src: '/api/placeholder/800/600', alt: 'Wedding venue 2' },
                  { src: '/api/placeholder/800/600', alt: 'Wedding venue 3' }
                ]}
                coupleNames={{ bride: "Sarah", groom: "Michael" }}
                weddingDate="June 15th, 2024"
                title="Our Wedding Day"
                subtitle="Join us for a celebration of love"
              />
            </SafeAceternityWrapper>
          ) : (
            <SafeStaticHero />
          )}

          {/* Info Cards with Safe 3D Effects */}
          <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Wedding Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {weddingInfo.map((info, index) => (
                  <SafeInfoCard
                    key={index}
                    info={info}
                    Card3D={components.Card3D}
                    onError={(error) => reportError('InfoCard', error)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* RSVP Section with Safe Sparkles */}
          <section className="py-16 bg-gradient-to-br from-pink-50 to-purple-50">
            <div className="max-w-4xl mx-auto text-center px-6">
              {components.Sparkles ? (
                <SafeAceternityWrapper
                  componentName="SparklesRSVP"
                  featureFlag="phase3.2"
                  onError={(error) => reportError('SparklesRSVP', error)}
                >
                  <components.Sparkles
                    mouseBehavior="ambient"
                    density="sparse"
                    trigger="always"
                    count={12}
                    className="relative"
                  >
                    <RSVPContent TextGenerate={components.TextGenerate} />
                  </components.Sparkles>
                </SafeAceternityWrapper>
              ) : (
                <RSVPContent TextGenerate={components.TextGenerate} />
              )}
            </div>
          </section>
        </div>
      )}
    </AceternityRouter>
  );
};

/**
 * Safe Info Card with conditional 3D effects
 */
interface SafeInfoCardProps {
  info: {
    title: string;
    time: string;
    description: string;
    icon: string;
  };
  Card3D?: React.ComponentType<any>;
  onError: (error: Error) => void;
}

const SafeInfoCard: React.FC<SafeInfoCardProps> = ({ info, Card3D, onError }) => {
  const CardComponent = Card3D ? (
    <SafeAceternityWrapper
      componentName="InfoCard3D"
      featureFlag="phase3.2"
      onError={onError}
      fallback={<StaticInfoCard info={info} />}
    >
      <Card3D
        theme="romantic"
        enableGlow={true}
        rotationRange={8}
        className="h-full"
      >
        <InfoCardContent info={info} />
      </Card3D>
    </SafeAceternityWrapper>
  ) : (
    <StaticInfoCard info={info} />
  );

  return CardComponent;
};

/**
 * Static fallback info card
 */
const StaticInfoCard: React.FC<{ info: any }> = ({ info }) => (
  <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
    <InfoCardContent info={info} />
  </div>
);

/**
 * Reusable info card content
 */
const InfoCardContent: React.FC<{ info: any }> = ({ info }) => (
  <div className="text-center">
    <div className="text-4xl mb-3">{info.icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{info.title}</h3>
    <p className="text-lg font-medium text-purple-600 mb-2">{info.time}</p>
    <p className="text-gray-600">{info.description}</p>
  </div>
);

/**
 * RSVP Content with safe text generation
 */
const RSVPContent: React.FC<{ TextGenerate?: React.ComponentType<any> }> = ({ TextGenerate }) => (
  <div>
    {TextGenerate ? (
      <SafeAceternityWrapper
        componentName="RSVPTextGenerate"
        featureFlag="phase3.1"
        onError={(error) => console.warn('RSVP text animation failed:', error)}
        fallback={<h2 className="text-4xl font-bold text-gray-800 mb-6">Please RSVP</h2>}
      >
        <TextGenerate
          text="Please RSVP by April 15th"
          className="text-4xl font-bold text-gray-800 mb-6"
          wedding={true}
          duration={1.0}
        />
      </SafeAceternityWrapper>
    ) : (
      <h2 className="text-4xl font-bold text-gray-800 mb-6">Please RSVP by April 15th</h2>
    )}
    
    <p className="text-lg text-gray-600 mb-8">
      We can't wait to celebrate with you! Please let us know if you'll be joining us.
    </p>
    
    <button className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200">
      RSVP Now
    </button>
  </div>
);

/**
 * Safe static hero fallback
 */
const SafeStaticHero: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center relative overflow-hidden">
    {/* Background pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
    </div>
    
    <div className="text-center z-10 px-6">
      <h1 className="text-4xl md:text-6xl lg:text-8xl font-light text-gray-800 mb-4">
        <span className="text-pink-600">Sarah</span>
        <span className="text-gray-600 mx-4">&</span>
        <span className="text-purple-600">Michael</span>
      </h1>
      
      <h2 className="text-2xl md:text-4xl lg:text-5xl font-light text-gray-700 mb-6">
        Our Wedding Day
      </h2>
      
      <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-8">
        June 15th, 2024
      </p>
      
      <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
        Join us for a celebration of love
      </p>
    </div>
  </div>
);

/**
 * Safe Gallery Page with conditional parallax
 */
export const SafeGalleryPage: React.FC = () => {
  const phase32Enabled = useFeatureFlag('phase3.2');
  const { reportError } = useSafetyMonitoring();

  return (
    <AceternityRouter 
      phase31Enabled={true}
      phase32Enabled={phase32Enabled}
    >
      {(components) => (
        <div className="min-h-screen">
          {components.HeroParallax ? (
            <SafeAceternityWrapper
              componentName="GalleryHero"
              featureFlag="phase3.2"
              onError={(error) => reportError('GalleryHero', error)}
            >
              <components.HeroParallax
                images={galleryImages}
                coupleNames={{ bride: "Sarah", groom: "Michael" }}
                title="Our Photo Gallery"
                subtitle="Memories from our engagement and pre-wedding events"
                parallaxIntensity={120}
              />
            </SafeAceternityWrapper>
          ) : (
            <SafeStaticGalleryHero />
          )}
          
          {/* Gallery Grid */}
          <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryImages.map((image, index) => (
                  <SafeGalleryItem
                    key={index}
                    image={image}
                    index={index}
                    GlareCard={components.GlareCard}
                    onError={(error) => reportError('GalleryItem', error)}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </AceternityRouter>
  );
};

/**
 * Safe gallery item with conditional glare effects
 */
interface SafeGalleryItemProps {
  image: { src: string; alt: string };
  index: number;
  GlareCard?: React.ComponentType<any>;
  onError: (error: Error) => void;
}

const SafeGalleryItem: React.FC<SafeGalleryItemProps> = ({ image, index, GlareCard, onError }) => {
  const content = (
    <div className="relative group cursor-pointer">
      <img 
        src={image.src} 
        alt={image.alt}
        className="w-full h-64 object-cover rounded-lg"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors rounded-lg" />
    </div>
  );

  return GlareCard ? (
    <SafeAceternityWrapper
      componentName="GalleryGlareCard"
      featureFlag="phase3.1"
      onError={onError}
      fallback={<div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">{content}</div>}
    >
      <GlareCard
        glareColor="rgba(255, 215, 0, 0.15)"
        rotationRange={5}
        className="overflow-hidden"
      >
        {content}
      </GlareCard>
    </SafeAceternityWrapper>
  ) : (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 hover:scale-105 transition-transform">
      {content}
    </div>
  );
};

/**
 * Safe static gallery hero
 */
const SafeStaticGalleryHero: React.FC = () => (
  <div className="min-h-[60vh] bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
    <div className="text-center px-6">
      <h1 className="text-4xl md:text-6xl font-light text-gray-800 mb-4">
        Our Photo Gallery
      </h1>
      <p className="text-lg md:text-xl text-gray-600">
        Memories from our engagement and pre-wedding events
      </p>
    </div>
  </div>
);

// Sample data
const weddingInfo = [
  {
    title: "Ceremony",
    time: "4:00 PM",
    description: "Join us for our wedding ceremony",
    icon: "💒"
  },
  {
    title: "Reception",
    time: "6:00 PM",
    description: "Dinner, dancing, and celebration",
    icon: "🎉"
  },
  {
    title: "Photos",
    time: "5:00 PM",
    description: "Group photos with family and friends",
    icon: "📸"
  }
];

const galleryImages = Array.from({ length: 9 }, (_, i) => ({
  src: `/api/placeholder/400/300?random=${i}`,
  alt: `Wedding photo ${i + 1}`
}));

export default {
  SafeHomePage,
  SafeGalleryPage,
  SafeInfoCard,
  StaticInfoCard,
  SafeStaticHero,
  SafeGalleryItem
};