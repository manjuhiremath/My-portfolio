'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * AdUnit component handles the initialization of Google AdSense ads.
 * It uses a highly resilient strategy to avoid width errors and duplicate pushes.
 */
export default function AdUnit({ 
  slot, 
  format = 'auto', 
  responsive = 'true', 
  style = { display: 'block' },
  layout = '',
  className = ''
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const adRef = useRef(null);
  const containerRef = useRef(null);
  const hasPushed = useRef(false);
  
  // Unique key based on URL and slot to force a clean remount on navigation
  const adKey = `${pathname}-${searchParams?.toString() || ''}-${slot}`;

  useEffect(() => {
    // Reset the push tracker when the component mounts or adKey changes
    hasPushed.current = false;
    
    let observer;
    
    const initializeAd = () => {
      // Prevent double-pushing for the same component instance
      if (hasPushed.current) return;

      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          const adElement = adRef.current;
          const container = containerRef.current;
          
          // CRITICAL: Ensure container has actual rendered width before pushing
          // This fixes the "Invalid responsive width: 0" error
          if (container && container.clientWidth > 0) {
            if (adElement && 
                !adElement.hasAttribute('data-adsbygoogle-status') && 
                adElement.getAttribute('data-ad-status') !== 'filled') {
              
              hasPushed.current = true;
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
          }
        }
      } catch (err) {
        if (err.message?.includes('already have ads')) {
          hasPushed.current = true;
          return;
        }
        console.error('AdSense error:', err);
      }
    };

    // Use ResizeObserver to wait for the container to have a non-zero width
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          if (entry.contentRect.width > 0) {
            // Container has width, wait for next frame to ensure paint
            window.requestAnimationFrame(() => {
              initializeAd();
            });
          }
        }
      });

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }
    } else {
      // Fallback for environments without ResizeObserver
      const timer = setTimeout(initializeAd, 1000);
      return () => clearTimeout(timer);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [adKey]); 

  return (
    <div 
      key={adKey} 
      ref={containerRef}
      className={`ad-container my-8 overflow-hidden flex justify-center w-full min-w-[250px] min-h-[280px] ${className}`}
      style={{ width: '100%', display: 'block' }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ ...style, width: '100%', height: 'auto' }}
        data-ad-client="ca-pub-6030791027461493"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
        {...(layout ? { 'data-ad-layout': layout } : {})}
      />
    </div>
  );
}
