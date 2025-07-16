import React, { useState } from 'react';
import { 
  Phase31GlareCard, 
  Phase31TextGenerate, 
  Phase31AnimatedModal,
  VenueGlareCard,
  WeddingAnnouncementText,
  RSVPModal 
} from './phase3-core';
import { FeatureFlag } from '@/components/feature-flags/FeatureFlag';
import { AceternityPerformanceMonitor, BundleSizeAnalyzer } from './performance-monitor';

/**
 * Phase 3.1 Implementation Examples
 * 
 * These examples demonstrate proper usage of Aceternity components
 * wrapped with FeatureFlag "phase3.1" for safe deployment.
 */

/**
 * Example 1: Enhanced Venue Card
 * Replaces existing VenueCard with Aceternity GlareCard
 */
export const EnhancedVenueShowcase: React.FC<{
  venue: {
    name: string;
    image: string;
    description: string;
    capacity: number;
    price: string;
  }
}> = ({ venue }) => {
  return (
    <VenueGlareCard className="w-full max-w-md">
      <div className="relative">
        <img 
          src={venue.image} 
          alt={venue.name}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="p-6 bg-white/90 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{venue.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{venue.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Capacity: {venue.capacity}</span>
            <span className="text-lg font-bold text-purple-600">{venue.price}</span>
          </div>
        </div>
      </div>
    </VenueGlareCard>
  );
};

/**
 * Example 2: Wedding Hero Section with Text Animation
 * Enhances existing HeroSection with Aceternity TextGenerate
 */
export const EnhancedHeroSection: React.FC<{
  coupleName: string;
  weddingDate: string;
  location: string;
}> = ({ coupleName, weddingDate, location }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
      <div className="text-center z-10">
        <WeddingAnnouncementText 
          text={coupleName}
          className="mb-4"
        />
        
        <Phase31TextGenerate
          text={`Join us on ${weddingDate}`}
          className="text-xl md:text-2xl text-gray-700 mb-2"
          wedding={true}
          duration={1.0}
          staggerDelay={0.06}
        />
        
        <Phase31TextGenerate
          text={`at ${location}`}
          className="text-lg md:text-xl text-gray-600"
          wedding={true}
          duration={0.8}
          staggerDelay={0.04}
        />
      </div>
    </div>
  );
};

/**
 * Example 3: Enhanced RSVP Modal
 * Replaces SimpleRSVPPopup with Aceternity AnimatedModal
 */
export const EnhancedRSVPForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    attending: '',
    dietary: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle RSVP submission
    
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
      >
        RSVP Now
      </button>

      <RSVPModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Will you be attending?
            </label>
            <select
              required
              value={formData.attending}
              onChange={(e) => setFormData(prev => ({ ...prev, attending: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Please select</option>
              <option value="yes">Yes, I'll be there!</option>
              <option value="no">Sorry, can't make it</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dietary Requirements
            </label>
            <input
              type="text"
              value={formData.dietary}
              onChange={(e) => setFormData(prev => ({ ...prev, dietary: e.target.value }))}
              placeholder="Any allergies or special requirements?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message to the couple
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Send your wishes and excitement!"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Send RSVP
            </button>
          </div>
        </form>
      </RSVPModal>
    </>
  );
};

/**
 * Example 4: Enhanced Info Cards Section
 * Replaces existing InfoCards with Aceternity GlareCard
 */
export const EnhancedInfoCards: React.FC = () => {
  const infoCards = [
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {infoCards.map((card, index) => (
        <Phase31GlareCard 
          key={index}
          className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6 shadow-lg"
          glareColor="rgba(255, 215, 0, 0.15)"
        >
          <div className="text-center">
            <div className="text-4xl mb-3">{card.icon}</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h3>
            <p className="text-lg font-medium text-purple-600 mb-2">{card.time}</p>
            <p className="text-gray-600">{card.description}</p>
          </div>
        </Phase31GlareCard>
      ))}
    </div>
  );
};

/**
 * Example 5: Performance Test Page
 * Demonstrates multiple components working together with performance monitoring
 */
export const Phase31TestPage: React.FC = () => {
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  return (
    <AceternityPerformanceMonitor enabled={true}>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <WeddingAnnouncementText text="Sarah & Michael" />
            <Phase31TextGenerate 
              text="Phase 3.1 Aceternity Integration Test"
              className="text-lg text-gray-600 mt-4"
            />
          </div>

          {/* Performance Controls */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowAnalyzer(!showAnalyzer)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {showAnalyzer ? 'Hide' : 'Show'} Bundle Analyzer
            </button>
          </div>

          {showAnalyzer && <BundleSizeAnalyzer />}

          {/* Component Examples */}
          <EnhancedInfoCards />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <EnhancedVenueShowcase 
              venue={{
                name: "Garden Pavilion",
                image: "/api/placeholder/400/300",
                description: "Beautiful outdoor venue with garden views",
                capacity: 150,
                price: "$3,500"
              }}
            />
            
            <EnhancedVenueShowcase 
              venue={{
                name: "Grand Ballroom", 
                image: "/api/placeholder/400/300",
                description: "Elegant indoor space for larger celebrations",
                capacity: 300,
                price: "$5,500"
              }}
            />
          </div>

          <div className="text-center">
            <EnhancedRSVPForm />
          </div>

          {/* Performance Notes */}
          <FeatureFlag name="phase3.1">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-900 mb-2">Phase 3.1 Performance Targets</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>✅ Target: 60fps on mobile devices</li>
                <li>✅ Target: Bundle delta &lt;50KB</li>
                <li>✅ Feature flag protection enabled</li>
                <li>✅ Graceful fallbacks implemented</li>
                <li>✅ Mobile optimizations active</li>
              </ul>
            </div>
          </FeatureFlag>
          
        </div>
      </div>
    </AceternityPerformanceMonitor>
  );
};

export default {
  EnhancedVenueShowcase,
  EnhancedHeroSection,
  EnhancedRSVPForm,
  EnhancedInfoCards,
  Phase31TestPage
};