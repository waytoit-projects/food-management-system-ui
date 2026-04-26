import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    hotelName: "Grand Palace Hotel",
    offer: "Get Discount<br/>Voucher<br/>Up To 20%",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
    bg: "#f59e0b" // Orange
  },
  {
    id: 2,
    hotelName: "Ocean View Resort",
    offer: "Weekend Special<br/>30% Off<br/>Pizza",
    desc: "Savor our wood-fired pizzas with a magnificent ocean view.",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80",
    bg: "#ef4444" // Red
  },
  {
    id: 3,
    hotelName: "Spice Garden",
    offer: "Free Drink<br/>With Any<br/>Biryani",
    desc: "Authentic spices blended perfectly to give you the best taste.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80",
    bg: "#10b981" // Green
  },
  {
    id: 4,
    hotelName: "Sweet Treats",
    offer: "Buy 1 Get 1<br/>Free<br/>Dessert",
    desc: "Treat yourself to our premium selected sweets and cakes.",
    image: "https://images.unsplash.com/photo-1551024506-0baa27542c12?w=400&q=80",
    bg: "#8b5cf6" // Purple
  },
  {
    id: 5,
    hotelName: "Sunset Cafe",
    offer: "Morning<br/>Coffee<br/>Just ₹2",
    desc: "Start your day right with our freshly brewed organic coffee.",
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&q=80",
    bg: "#3b82f6" // Blue
  }
];

const Slider = () => {
  const [current, setCurrent] = useState(0);

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  return (
    <div style={{ position: 'relative', marginBottom: '1.5rem', width: '100%', overflow: 'hidden', borderRadius: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      
      {/* Slides Container */}
      <div style={{ 
        display: 'flex', 
        transition: 'transform 0.5s ease-in-out', 
        transform: `translateX(-${current * 100}%)`
      }}>
        {slides.map((slide) => (
          <div key={slide.id} style={{ 
            minWidth: '100%', 
            backgroundColor: slide.bg, 
            padding: '1.25rem 2.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            color: 'white',
            position: 'relative', 
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}>
            {/* Abstract Background Shapes */}
            <div style={{ position: 'absolute', right: '10%', top: '-50%', width: '300px', height: '300px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', right: '30%', bottom: '-50%', width: '200px', height: '200px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
            
            {/* Text Content */}
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '50%' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem', opacity: 0.9 }}>{slide.hotelName}</p>
              <h2 
                style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: '1.1', marginBottom: '0.4rem' }}
                dangerouslySetInnerHTML={{ __html: slide.offer }}
              />
              <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>{slide.desc}</p>
            </div>
            
            {/* Image */}
            <div style={{ position: 'relative', zIndex: 1, width: '140px', height: '140px' }}>
              <img 
                src={slide.image} 
                alt="Promo" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.25rem' }} 
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide} 
        style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.3)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, transition: 'background 0.2s' }}
      >
        <ChevronLeft size={20} />
      </button>
      <button 
        onClick={nextSlide} 
        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.3)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, transition: 'background 0.2s' }}
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots Indicator */}
      <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 2 }}>
        {slides.map((_, index) => (
          <div 
            key={index} 
            onClick={() => setCurrent(index)}
            style={{ 
              width: current === index ? '24px' : '8px', 
              height: '8px', 
              backgroundColor: current === index ? 'white' : 'rgba(255,255,255,0.5)', 
              borderRadius: '4px', 
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }} 
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;
