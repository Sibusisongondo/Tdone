import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import { 
  BookOpen, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Loader2,
  Smartphone,
  Monitor,
  X
} from 'lucide-react';

// Use CDN worker URL
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface FlipBookViewerProps {
  fileUrl: string;
  onLoadSuccess?: ({ numPages }: { numPages: number }) => void;
  onLoadError?: (error: Error) => void;
  onClose?: () => void; // Optional close handler for navigation back
}

const FlipBookViewer: React.FC<FlipBookViewerProps> = ({ 
  fileUrl, 
  onLoadSuccess, 
  onLoadError,
  onClose
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // Detect mobile device and set initial scale
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      // Set fullscreen optimized scale
      setScale(Math.min(1.5, window.innerWidth / 600));
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    // Prevent body scroll for fullscreen experience
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
      if (e.key === 'ArrowLeft') {
        goToPrevPage();
      } else if (e.key === 'ArrowRight') {
        goToNextPage();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [onClose]);

  const documentOptions = React.useMemo(() => ({
    cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
    cMapPacked: true,
  }), []);

  const handleDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }) => {
    setNumPages(nextNumPages);
    setLoading(false);
    setError(null);
    console.log('✅ PDF loaded successfully:', nextNumPages, 'pages');
    if (onLoadSuccess) {
      onLoadSuccess({ numPages: nextNumPages });
    }
  };

  const handleDocumentLoadError = (error: Error) => {
    console.error('❌ PDF load error:', error);
    setLoading(false);
    setError(`Failed to load PDF: ${error.message}`);
    if (onLoadError) {
      onLoadError(error);
    }
  };

  const onDocumentLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const performPageFlip = (direction: 'next' | 'prev') => {
    if (isFlipping) return;
    
    const targetPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
    if (targetPage < 1 || targetPage > (numPages || 0)) return;
    
    setIsFlipping(true);
    setFlipDirection(direction);
    
    // Simple page change with animation
    setTimeout(() => {
      setCurrentPage(targetPage);
      
      // Complete the animation
      setTimeout(() => {
        setIsFlipping(false);
        setFlipDirection(null);
      }, 600);
    }, 300);
  };

  const goToNextPage = () => {
    if (currentPage < (numPages || 0)) {
      performPageFlip('next');
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      performPageFlip('prev');
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;

    // Only trigger if horizontal swipe is more significant than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe left - next page
        goToNextPage();
      } else {
        // Swipe right - previous page
        goToPrevPage();
      }
    }

    touchStartX.current = 0;
    touchStartY.current = 0;
  };

  // Click handlers for desktop (left/right side clicking)
  const handlePageClick = (e: React.MouseEvent) => {
    if (isMobile || isFlipping) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = e.clientX - rect.left;
    const containerWidth = rect.width;
    
    if (clickX < containerWidth / 2) {
      goToPrevPage();
    } else {
      goToNextPage();
    }
  };

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  const handleReset = () => {
    setScale(Math.min(1.5, window.innerWidth / 600));
    setCurrentPage(1);
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pageNum = parseInt(e.target.value);
    if (pageNum >= 1 && pageNum <= (numPages || 0)) {
      setCurrentPage(pageNum);
    }
  };

  if (!fileUrl) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-white mx-auto mb-4" />
          <p className="text-white">No file available for this magazine.</p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .page-container {
          position: relative;
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform-origin: center center;
        }
        
        .pdf-page {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3), 0 4px 15px rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #333;
          background: white;
          transition: all 0.3s ease;
          max-width: 100%;
          height: auto;
        }
        
        .page-container.flipping {
          opacity: 0.7;
          transform: scale(0.95);
        }
        
        .page-container.flipping.flip-next {
          transform: scale(0.95) rotateY(-3deg);
        }
        
        .page-container.flipping.flip-prev {
          transform: scale(0.95) rotateY(3deg);
        }
        
        /* Enhanced hover effect for desktop */
        @media (min-width: 768px) {
          .page-container:hover .pdf-page {
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 6px 20px rgba(0, 0, 0, 0.25);
            transform: translateY(-3px);
          }
        }
        
        /* Mobile optimizations */
        @media (max-width: 767px) {
          .page-container.flipping {
            transform: scale(0.98);
          }
          
          .page-container.flipping.flip-next,
          .page-container.flipping.flip-prev {
            transform: scale(0.98) rotateY(0deg);
          }
        }
        
        /* Page loading animation */
        .page-container:not(.flipping) {
          animation: page-appear 0.5s ease-out;
        }
        
        @keyframes page-appear {
          from {
            opacity: 0;
            transform: scale(0.98) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      {/* Always Fullscreen Layout */}
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 text-white p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg sm:text-xl font-semibold">Magazine Viewer</h2>
            <div className="text-sm text-gray-300">
              Page {currentPage} of {numPages || '?'}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Navigation Controls */}
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1 || isFlipping}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            
            <button
              onClick={goToNextPage}
              disabled={currentPage >= (numPages || 0) || isFlipping}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Page Input */}
            <div className="hidden sm:flex items-center gap-2 ml-4">
              <span className="text-sm">Go to:</span>
              <input
                type="number"
                value={currentPage}
                onChange={handlePageInputChange}
                min={1}
                max={numPages || 1}
                className="w-16 px-2 py-1 text-center text-black border rounded text-sm"
              />
            </div>

            <div className="w-px h-6 bg-gray-600 mx-2"></div>

            {/* Zoom Controls */}
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            
            <span className="text-white min-w-16 text-center text-sm">
              {Math.round(scale * 100)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <button
              onClick={handleReset}
              className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Close Button (if onClose provided) */}
            {onClose && (
              <>
                <div className="w-px h-6 bg-gray-600 mx-2"></div>
                <button
                  onClick={onClose}
                  className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  title="Close Viewer (Esc)"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div 
          ref={containerRef}
          className="flex-1 bg-gray-800 overflow-auto flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handlePageClick}
          style={{ cursor: isMobile ? 'default' : 'pointer' }}
        >
          <div className="flex items-center justify-center h-full w-full p-4">
            <Document
              file={fileUrl}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={handleDocumentLoadError}
              onLoadStart={onDocumentLoadStart}
              options={documentOptions}
              loading={
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 text-white mx-auto mb-4 animate-spin" />
                    <p className="text-white">Loading magazine...</p>
                  </div>
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center p-8">
                  <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                  <h3 className="text-lg font-semibold text-red-400 text-center mb-2">
                    Failed to load magazine
                  </h3>
                  <p className="text-gray-300 text-center mb-4 max-w-md">
                    {error || 'The PDF file could not be loaded.'}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              }
            >
              {numPages && (
                <div className="relative">
                  <div 
                    className={`
                      page-container
                      ${isFlipping ? 'flipping' : ''}
                      ${flipDirection === 'next' ? 'flip-next' : ''}
                      ${flipDirection === 'prev' ? 'flip-prev' : ''}
                    `}
                  >
                    <Page 
                      pageNumber={currentPage} 
                      scale={scale}
                      className="pdf-page"
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  </div>
                </div>
              )}
            </Document>

            {/* Click zones for desktop */}
            {!isMobile && (
              <>
                <div className="absolute left-0 top-16 w-1/3 h-full z-20 cursor-w-resize opacity-0 hover:bg-blue-500 hover:opacity-10 transition-opacity"></div>
                <div className="absolute right-0 top-16 w-1/3 h-full z-20 cursor-e-resize opacity-0 hover:bg-blue-500 hover:opacity-10 transition-opacity"></div>
              </>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gray-900 text-gray-300 px-4 py-2 text-xs text-center">
          <div className="flex items-center justify-center gap-4">
            {isMobile ? (
              <>
                <Smartphone className="h-3 w-3" />
                <span>Swipe to navigate pages</span>
              </>
            ) : (
              <>
                <Monitor className="h-3 w-3" />
                <span>Click sides to navigate • Use arrow keys</span>
              </>
            )}
            {onClose && <span>• Press ESC to exit</span>}
          </div>
        </div>
      </div>
    </>
  );
};

export default FlipBookViewer;