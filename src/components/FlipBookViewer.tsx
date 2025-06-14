
import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, AlertCircle, ExternalLink, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

interface FlipBookViewerProps {
  fileUrl: string;
  onLoadSuccess?: ({ numPages }: { numPages: number }) => void;
  onLoadError?: (error: Error) => void;
}

const FlipBookViewer: React.FC<FlipBookViewerProps> = ({
  fileUrl,
  onLoadSuccess,
  onLoadError
}) => {
  const flipbookRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');

  console.log('FlipBookViewer - Rendering with fileUrl:', fileUrl);
  console.log('FlipBookViewer - flipbookRef.current:', flipbookRef.current);

  useEffect(() => {
    console.log('FlipBookViewer useEffect triggered');
    console.log('fileUrl:', fileUrl);
    console.log('flipbookRef.current:', flipbookRef.current);
    
    if (!fileUrl) {
      console.log('No fileUrl provided');
      setIsLoading(false);
      return;
    }

    const initializeFlipBook = async () => {
      try {
        console.log('Starting FlipBook initialization...');
        setIsLoading(true);
        setHasError(false);
        setLoadingMessage('Loading jQuery...');

        // Load jQuery if not present
        if (typeof window.$ === 'undefined') {
          console.log('Loading jQuery...');
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js');
          console.log('✅ jQuery loaded');
        } else {
          console.log('jQuery already available');
        }

        setLoadingMessage('Loading Turn.js...');

        // Load Turn.js if not present
        if (!window.$.fn || !window.$.fn.turn) {
          console.log('Loading Turn.js...');
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/turn.js/4.1.0/turn.min.js');
          console.log('✅ Turn.js loaded');
        } else {
          console.log('Turn.js already available');
        }

        setLoadingMessage('Creating flipbook pages...');

        // Create demo pages
        const demoPages = 10;
        setNumPages(demoPages);

        if (flipbookRef.current) {
          // Clear existing content
          flipbookRef.current.innerHTML = '';
          
          // Create pages
          for (let i = 1; i <= demoPages; i++) {
            const page = document.createElement('div');
            page.className = 'page';
            page.style.cssText = `
              width: 400px;
              height: 300px;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: system-ui, -apple-system, sans-serif;
              color: #334155;
              border: 1px solid #cbd5e1;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              position: relative;
            `;
            
            page.innerHTML = `
              <div style="text-align: center; padding: 20px;">
                <div style="font-size: 32px; margin-bottom: 15px;">📖</div>
                <div style="font-weight: 600; font-size: 18px; margin-bottom: 8px;">Page ${i}</div>
                <div style="font-size: 12px; opacity: 0.7; margin-bottom: 15px;">Demo Magazine Content</div>
                <div style="font-size: 10px; opacity: 0.5; position: absolute; bottom: 8px; right: 12px;">${i}</div>
              </div>
            `;
            
            flipbookRef.current.appendChild(page);
          }

          setLoadingMessage('Initializing Turn.js...');

          // Wait a moment for DOM to be ready
          await new Promise(resolve => setTimeout(resolve, 200));

          console.log('Initializing Turn.js with jQuery:', typeof window.$);
          
          // Initialize Turn.js
          window.$(flipbookRef.current).turn({
            width: 800,
            height: 300,
            autoCenter: true,
            gradients: true,
            elevation: 50,
            display: 'double',
            when: {
              turned: function(event: any, page: number) {
                console.log('Page turned to:', page);
                setCurrentPage(page);
              },
              start: function() {
                console.log('Turn.js initialization complete');
              }
            }
          });

          console.log('✅ FlipBook initialized successfully');
          setIsLoading(false);
          
          if (onLoadSuccess) {
            onLoadSuccess({ numPages: demoPages });
          }
        }

      } catch (error) {
        console.error('❌ FlipBook initialization error:', error);
        setHasError(true);
        setIsLoading(false);
        setLoadingMessage('Failed to load');
        
        if (onLoadError) {
          onLoadError(error as Error);
        }
      }
    };

    // Small delay to ensure DOM is ready, then initialize
    const timeoutId = setTimeout(() => {
      if (flipbookRef.current) {
        console.log('DOM is ready, starting initialization');
        initializeFlipBook();
      } else {
        console.log('flipbookRef.current is null, waiting...');
        // Try again after a longer delay
        setTimeout(() => {
          if (flipbookRef.current) {
            initializeFlipBook();
          }
        }, 500);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (flipbookRef.current && window.$ && window.$.fn && window.$.fn.turn) {
        try {
          window.$(flipbookRef.current).turn('destroy');
        } catch (e) {
          console.warn('Cleanup warning:', e);
        }
      }
    };
  }, [fileUrl, onLoadSuccess, onLoadError]);

  // Helper function to load scripts
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    // Update scale when it changes
    if (flipbookRef.current && window.$ && !isLoading) {
      window.$(flipbookRef.current).css({
        transform: `scale(${scale})`,
        transformOrigin: 'center top'
      });
    }
  }, [scale, isLoading]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  const goToNextPage = () => {
    if (flipbookRef.current && window.$ && window.$.fn.turn) {
      window.$(flipbookRef.current).turn('next');
    }
  };

  const goToPrevPage = () => {
    if (flipbookRef.current && window.$ && window.$.fn.turn) {
      window.$(flipbookRef.current).turn('previous');
    }
  };

  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No file available for flipbook.</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-8">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-destructive text-center mb-2">
          Failed to load flipbook
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Could not initialize the flipbook viewer. Try refreshing the page.
        </p>
        <Button 
          variant="outline"
          onClick={() => window.open(fileUrl, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Original File
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">{loadingMessage}</p>
          <div className="mt-2 text-xs text-muted-foreground opacity-70">
            Setting up flipbook viewer...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={currentPage <= 1}>
            ← Previous
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Page {currentPage} of {numPages}
          </span>
          <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage >= numPages}>
            Next →
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetZoom}>
            {Math.round(scale * 100)}%
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* FlipBook Container */}
      <div className="flex justify-center p-8 bg-gray-50 min-h-[400px]">
        <div 
          ref={flipbookRef}
          id="flipbook"
          className="flipbook"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center top',
            transition: 'transform 0.3s ease'
          }}
        />
      </div>

      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          📖 Click on page corners to flip pages, or use the navigation controls above. 
          This demo shows the flipbook functionality - in production, actual PDF pages would be displayed.
        </p>
      </div>
    </div>
  );
};

export default FlipBookViewer;
