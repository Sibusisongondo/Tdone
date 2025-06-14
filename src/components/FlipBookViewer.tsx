
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
  const [loadingMessage, setLoadingMessage] = useState('Loading flipbook...');

  console.log('FlipBookViewer - Rendering with fileUrl:', fileUrl);

  useEffect(() => {
    if (!fileUrl || !flipbookRef.current) return;

    const loadFlipBook = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        setLoadingMessage('Loading jQuery...');

        // Check if jQuery is already loaded
        if (!window.$ && !window.jQuery) {
          console.log('Loading jQuery...');
          const jqueryScript = document.createElement('script');
          jqueryScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js';
          jqueryScript.crossOrigin = 'anonymous';
          document.head.appendChild(jqueryScript);
          
          await new Promise((resolve, reject) => {
            jqueryScript.onload = () => {
              console.log('✅ jQuery loaded successfully');
              resolve(true);
            };
            jqueryScript.onerror = () => {
              console.error('❌ Failed to load jQuery');
              reject(new Error('Failed to load jQuery'));
            };
          });
        }

        setLoadingMessage('Loading Turn.js...');

        // Check if Turn.js is already loaded
        if (!window.$.fn.turn) {
          console.log('Loading Turn.js...');
          const turnScript = document.createElement('script');
          turnScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/turn.js/4.1.0/turn.min.js';
          turnScript.crossOrigin = 'anonymous';
          document.head.appendChild(turnScript);

          await new Promise((resolve, reject) => {
            turnScript.onload = () => {
              console.log('✅ Turn.js loaded successfully');
              resolve(true);
            };
            turnScript.onerror = () => {
              console.error('❌ Failed to load Turn.js');
              reject(new Error('Failed to load Turn.js'));
            };
          });
        }

        setLoadingMessage('Initializing flipbook...');

        // For this demo, we'll create a simple flipbook with placeholder pages
        // In a real implementation, you'd convert PDF pages to images first
        const demoPages = 12; // Simulate a 12-page magazine
        setNumPages(demoPages);

        // Create flipbook HTML
        if (flipbookRef.current) {
          console.log('Creating flipbook pages...');
          flipbookRef.current.innerHTML = '';
          
          for (let i = 1; i <= demoPages; i++) {
            const page = document.createElement('div');
            page.className = 'page';
            page.style.cssText = `
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              color: #333;
              border: 1px solid #ddd;
              position: relative;
            `;
            page.innerHTML = `
              <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">📖</div>
                <div style="font-weight: bold; margin-bottom: 10px;">Page ${i}</div>
                <div style="font-size: 14px; margin-top: 10px; opacity: 0.7;">
                  ${fileUrl ? 'PDF Content Preview' : 'Demo Content'}
                </div>
                <div style="position: absolute; bottom: 10px; right: 10px; font-size: 12px; opacity: 0.5;">
                  ${i}
                </div>
              </div>
            `;
            flipbookRef.current.appendChild(page);
          }

          console.log('Initializing Turn.js...');
          
          // Initialize Turn.js with error handling
          try {
            window.$(flipbookRef.current).turn({
              width: 800,
              height: 600,
              autoCenter: true,
              gradients: true,
              elevation: 50,
              display: 'double',
              when: {
                turned: function(event: any, page: number) {
                  console.log('Turned to page:', page);
                  setCurrentPage(page);
                },
                start: function(event: any, pageObject: any) {
                  console.log('Turn.js started successfully');
                }
              }
            });

            // Apply initial scale
            window.$(flipbookRef.current).css({
              transform: `scale(${scale})`,
              transformOrigin: 'center top'
            });

            console.log('✅ FlipBook initialized successfully');
            setIsLoading(false);
            
            if (onLoadSuccess) {
              onLoadSuccess({ numPages: demoPages });
            }
          } catch (turnError) {
            console.error('❌ Turn.js initialization error:', turnError);
            throw new Error('Failed to initialize Turn.js');
          }
        }

      } catch (error) {
        console.error('❌ FlipBook initialization error:', error);
        setHasError(true);
        setIsLoading(false);
        
        if (onLoadError) {
          onLoadError(error as Error);
        }
      }
    };

    // Add a small delay to ensure the DOM is ready
    const timeoutId = setTimeout(loadFlipBook, 100);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      if (flipbookRef.current && window.$ && window.$.fn.turn) {
        try {
          window.$(flipbookRef.current).turn('destroy');
        } catch (e) {
          console.warn('Cleanup warning:', e);
        }
      }
    };
  }, [fileUrl, onLoadSuccess, onLoadError]);

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
          The flipbook could not be displayed. This might be due to network issues or library loading problems.
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
          <div className="mt-4 text-xs text-muted-foreground">
            This may take a few moments while we load the required libraries...
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
      <div className="flex justify-center p-8 bg-gray-100 min-h-[700px]">
        <div 
          ref={flipbookRef}
          id="flipbook"
          className="flipbook"
          style={{
            transformOrigin: 'center top',
            transition: 'transform 0.3s ease'
          }}
        />
      </div>

      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          📖 Click on the corners of pages to flip them, or use the navigation controls above. 
          This is a demo flipbook - in production, PDF pages would be converted to images for display.
        </p>
      </div>
    </div>
  );
};

export default FlipBookViewer;
