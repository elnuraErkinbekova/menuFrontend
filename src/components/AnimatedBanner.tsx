import React, { useState, useEffect, useRef } from 'react';
import './AnimatedBanner.css';

interface Banner {
  id: number;
  type: 'text-reveal' | 'product-showcase' | 'bonus-wheel';
  text?: string;
  productImage?: string;
  floatingItems?: string[];
  subtitle?: string;
  bonusText?: string;
  bonusPercentage?: string;
}

interface AnimatedBannerProps {
  banners?: Banner[];
  autoPlayInterval?: number;
}

const defaultBanners: Banner[] = [
  { 
    id: 1, 
    type: 'bonus-wheel',
    bonusText: "get up to",
    bonusPercentage: "100%"
  },
  { 
    id: 2, 
    type: 'product-showcase',
    text: "Hottest Drink of Month",
    subtitle: "Fruity",
    productImage: "src/assets/featured-drink.png",
    floatingItems: [
      "src/assets/apple-slice-1.png",
      "src/assets/apple-slice-2.png",
      "src/assets/apple-slice-3.png"
    ]
  },
  { id: 3, type: 'text-reveal', text: "Order Now & Enjoy" }
];

export default function AnimatedBanner({ 
  banners = defaultBanners,
  autoPlayInterval = 8000
}: AnimatedBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [currentSlide, autoPlayInterval]);

  useEffect(() => {
    setIsAnimating(false);
    const timeout = setTimeout(() => {
      setIsAnimating(true);
    }, 50);

    return () => clearTimeout(timeout);
  }, [currentSlide]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const currentBanner = banners[currentSlide];

  return (
    <div className="animated-banner-container">
      <button 
        className="banner-nav-btn banner-nav-prev" 
        onClick={handlePrev}
        aria-label="Previous banner"
      >
        ‹
      </button>
      
      <button 
        className="banner-nav-btn banner-nav-next" 
        onClick={handleNext}
        aria-label="Next banner"
      >
        ›
      </button>

      <div className="banner-indicators">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`banner-indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {currentBanner.type === 'text-reveal' && (
        <TextRevealAnimation 
          text={currentBanner.text || ''} 
          isActive={isAnimating} 
        />
      )}

      {currentBanner.type === 'product-showcase' && (
        <ProductShowcaseAnimation 
          text={currentBanner.text || ''}
          subtitle={currentBanner.subtitle}
          productImage={currentBanner.productImage || ''}
          floatingItems={currentBanner.floatingItems || []}
          isActive={isAnimating}
        />
      )}

      {currentBanner.type === 'bonus-wheel' && (
        <BonusWheelAnimation
          bonusText={currentBanner.bonusText || 'get up to'}
          bonusPercentage={currentBanner.bonusPercentage || '100%'}
          isActive={isAnimating}
        />
      )}
    </div>
  );
}

// Text Reveal Animation Component (Original geometric animation)
function TextRevealAnimation({ text, isActive }: { text: string; isActive: boolean }) {
  return (
    <div className={`animation text-reveal-animation ${isActive ? 'active' : ''}`}>
      <div className="animation_title01_wrap">
        <h2 className="animation_title01">
          {text.split('').map((char, index) => (
            <span key={index} style={{ animationDelay: `${0.2 + index * 0.05}s, ${3.6 + index * 0.05}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h2>
      </div>

      {/* All the geometric background layers */}
      <div className="animation_bg01"></div>
      <div className="animation_bg02 animation_common_bg01"></div>
      <div className="animation_bg03 animation_common_bg01"></div>
      <div className="animation_bg04 animation_common_bg01"></div>
      <div className="animation_bg05 animation_common_bg01"></div>
      <div className="animation_bg06 animation_common_bg02"></div>
      <div className="animation_bg07 animation_common_bg02"></div>
      <div className="animation_bg08 animation_common_bg02"></div>
      <div className="animation_bg09 animation_common_bg02"></div>
      <div className="animation_bg10 animation_common_bg03"></div>
      <div className="animation_bg11 animation_common_bg04"></div>
      <div className="animation_bg12 animation_common_bg03"></div>
      <div className="animation_bg13 animation_common_bg04"></div>
      <div className="animation_bg14 animation_common_bg03"></div>
      <div className="animation_bg15 animation_common_bg04"></div>
      <div className="animation_bg16 animation_common_bg03"></div>
      <div className="animation_bg17 animation_common_bg04"></div>
      <div className="animation_bg18 animation_common_bg05"></div>
      <div className="animation_bg19 animation_common_bg05"></div>
      <div className="animation_bg20 animation_common_bg05"></div>
      <div className="animation_bg21 animation_common_bg05"></div>
      <div className="animation_bg22 animation_common_bg05"></div>
      <div className="animation_bg23 animation_common_bg06"></div>
      <div className="animation_bg24 animation_common_bg06"></div>
      <div className="animation_bg25 animation_common_bg06"></div>
      <div className="animation_bg26 animation_common_bg06"></div>
      <div className="animation_bg27 animation_common_bg07"></div>
      <div className="animation_bg28 animation_common_bg07"></div>
      <div className="animation_bg29 animation_common_bg07"></div>
      <div className="animation_bg30 animation_common_bg07"></div>
      <div className="animation_bg31 animation_common_bg07"></div>
      <div className="animation_bg32 animation_common_bg08"></div>
      <div className="animation_bg33 animation_common_bg08"></div>
      <div className="animation_bg34 animation_common_bg08"></div>
      <div className="animation_bg35 animation_common_bg08"></div>
      <div className="animation_bg36 animation_common_bg09"></div>
      <div className="animation_bg37 animation_common_bg10"></div>
      <div className="animation_bg38 animation_common_bg09"></div>
      <div className="animation_bg39 animation_common_bg10"></div>
      <div className="animation_bg40 animation_common_bg09"></div>
      <div className="animation_bg41 animation_common_bg10"></div>
      <div className="animation_bg42 animation_common_bg09"></div>
      <div className="animation_bg43 animation_common_bg10"></div>
    </div>
  );
}

// Product Showcase Animation Component (NEW!)
function ProductShowcaseAnimation({ 
  text, 
  subtitle,
  productImage, 
  floatingItems, 
  isActive 
}: { 
  text: string; 
  subtitle?: string;
  productImage: string; 
  floatingItems: string[]; 
  isActive: boolean;
}) {
  return (
    <div className={`animation product-showcase-animation ${isActive ? 'active' : ''}`}>
      {/* Gradient Background */}
      <div className="product-showcase-bg"></div>

      {/* Subtitle at top */}
      {subtitle && (
        <div className="product-subtitle">
          {subtitle}
        </div>
      )}

      {/* Main Product Title */}
      <div className="product-title-wrap">
        <h2 className="product-title">
          {text.split('').map((char, index) => (
            <span key={index}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h2>
      </div>

      {/* Featured Product in Center */}
      <div className="product-main">
        <img src={productImage} alt="Featured product" />
      </div>

      {/* Floating Items Around Product */}
      <div className="floating-items">
        {floatingItems.map((item, index) => (
          <div 
            key={index} 
            className={`floating-item floating-item-${index + 1}`}
          >
            <img src={item} alt={`Floating item ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Bonus Wheel Animation Component (NEW!)
function BonusWheelAnimation({
  bonusText,
  bonusPercentage,
  isActive
}: {
  bonusText: string;
  bonusPercentage: string;
  isActive: boolean;
}) {
  return (
    <div className={`animation bonus-wheel-animation ${isActive ? 'active' : ''}`}>
      {/* Black Circle Background */}
      <svg className="wheel-background" viewBox="0 0 540 540" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M420 270C420 352.843 352.843 420 270 420C187.157 420 120 352.843 120 270C120 187.157 187.157 120 270 120C352.843 120 420 187.157 420 270Z"
          fill="black"
        />
      </svg>

      {/* Rotating Text Circle 1 - Game Text */}
      <svg className="wheel-text wheel-text-1" viewBox="0 0 540 540" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          id="circle1"
          d="M440 270C440 363.888 363.888 440 270 440C176.112 440 100 363.888 100 270C100 176.112 176.112 100 270 100C363.888 100 440 176.112 440 270Z"
          strokeWidth="40"
        />
        <text>
          <textPath alignmentBaseline="middle" href="#circle1" stroke="none" fill="#000">
            PLAY • OUR NEW GAME • AND GET • A CHANCE TO • HAVE FREE FOOD • PLAY • OUR NEW GAME • AND GET • A CHANCE TO • HAVE FREE FOOD •
          </textPath>
        </text>
      </svg>

      {/* Rotating Text Circle 2 - Percentages (Reverse) */}
      <svg className="wheel-text wheel-text-2" viewBox="0 0 540 540" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          id="circle2"
          stroke="#000"
          d="M480 270C480 385.98 385.98 480 270 480C154.02 480 60 385.98 60 270C60 154.02 154.02 60 270 60C385.98 60 480 154.02 480 270Z"
          strokeWidth="40"
        />
        <text>
          <textPath alignmentBaseline="middle" href="#circle2" stroke="none" fill="#fff">
            10% 70% 35% 25% 55% 80% 15% 15% 80% 10% 70% 35% 25% 5% 80% 15% 5% 80% 15% 10% 70% 35% 25% 55% 80% 15% 15% 80% 10% 70% 35% 25% 5% 80% 15% 5% 80% 15% 80% 15%
          </textPath>
        </text>
      </svg>

      {/* Rotating Text Circle 3 - Dollar Signs */}
      <svg className="wheel-text wheel-text-3" viewBox="0 0 540 540" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          id="circle3"
          d="M520 270C520 408.071 408.071 520 270 520C131.929 520 20 408.071 20 270C20 131.929 131.929 20 270 20C408.071 20 520 131.929 520 270Z"
          strokeWidth="40"
        />
        <text>
          <textPath alignmentBaseline="middle" href="#circle3" stroke="none" fill="#000">
            $ $ $ $$ $ $ $$ $ $ $ $ $ $ $ $$ $ $ $ $ $$ $ $ $ $ $$ $ $ $ $ $$ $ $ $ $ $$ $ $ $$ $$ $ $ $ $$ $ $ $$ $ $ $ $ $ $ $ $$ $ $ $ $ $$ $ $ $ $ $$ $ $ $ $ $$ $ $ $ $ $$ $ $ $$ $$ $ $$ $$ $ $ $ $$ $ $ $$ $ $ $ $ $ $ $ $$ $ $ $ $ $$ $ $ $ $ $$ $ $ $ $ $$ $ $ $ $ $$ $ $ $$ $
          </textPath>
        </text>
      </svg>

      {/* Center Content */}
      <div className="wheel-content">
        <div className="wheel-text-main">{bonusText}</div>
        <div className="wheel-percentage">{bonusPercentage}</div>
        <div className="wheel-btn">Play Now</div>
      </div>
    </div>
  );
}