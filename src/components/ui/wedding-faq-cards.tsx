import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, MapPin, Camera, Gift, Users, Calendar } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  views: number;
}

const categoryIcons = {
  venue: MapPin,
  transport: Users,
  accommodation: Gift,
  photography: Camera,
  schedule: Calendar,
  general: Heart,
};

export const WeddingFAQCards = ({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: {
  items: FAQItem[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  useEffect(() => {
    addAnimation();
  }, []);
  
  const [start, setStart] = useState(false);
  
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }
  
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        );
      }
    }
  };
  
  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "30s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "60s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "120s");
      }
    }
  };

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-wedding-navy mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get quick answers to common questions about our special day
        </p>
      </div>
      
      <div
        ref={containerRef}
        className={cn(
          "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
          className
        )}
      >
        <ul
          ref={scrollerRef}
          className={cn(
            "flex min-w-full shrink-0 gap-6 py-4 w-max flex-nowrap",
            start && "animate-scroll",
            pauseOnHover && "hover:[animation-play-state:paused]"
          )}
        >
          {items.map((item, idx) => {
            const IconComponent = categoryIcons[item.category as keyof typeof categoryIcons] || Heart;
            
            return (
              <motion.li
                key={`${item.id}-${idx}`}
                className="w-[320px] max-w-full relative rounded-2xl flex-shrink-0 overflow-hidden group cursor-pointer"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Aurora background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/80 via-purple-50/80 to-pink-100/80" />
                
                {/* Glass morphism overlay */}
                <div className="absolute inset-0 bg-white/20 backdrop-blur-md border border-white/30" />
                
                {/* Content */}
                <div className="relative z-10 p-6 h-full">
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-wedding-navy/10 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-wedding-navy" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-wedding-navy/70 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Heart className="w-3 h-3" />
                        <span>{item.views} views</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Question */}
                  <h3 className="font-semibold text-wedding-navy mb-3 line-clamp-2 text-lg leading-tight">
                    {item.question}
                  </h3>
                  
                  {/* Answer preview */}
                  <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                    {item.answer}
                  </p>
                  
                  {/* Hover indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-8 h-8 rounded-full bg-wedding-navy/10 flex items-center justify-center">
                      <span className="text-wedding-navy text-xs font-bold">→</span>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-wedding-gold/30 rounded-full" />
                <div className="absolute bottom-2 left-2 w-1 h-1 bg-wedding-navy/20 rounded-full" />
                
                {/* Glass reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50" />
              </motion.li>
            );
          })}
        </ul>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="h-4 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};