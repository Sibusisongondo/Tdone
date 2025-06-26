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
  Maximize,
  Minimize,
  X
} from 'lucide-react';

// Use CDN worker URL
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // Detect mobile device and container width
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Set responsive scale based on container width
  useEffect(() => {
    if (containerWidth > 0) {
      if (isFullscreen) {
        // Fullscreen: maximize the scale for better viewing
        setScale(Math.min(1.5, window.innerWidth / 600));
      } else if (isMobile) {
        // Mobile: fit to container width with some padding
        setScale(Math.min(1.0, (containerWidth - 32) / 600));
      } else {
        // Desktop: standard scale
        setScale(Math.min(1.2, containerWidth / 800));
      }
    }
  }, [containerWidth, isMobile, isFullscreen]);

  // Handle escape key for fullscreen exit
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
      if (isFullscreen) {
        if (e.key === 'ArrowLeft') {
          goToPrevPage();
        } else if (e.key === 'ArrowRight') {
          goToNextPage();
        }
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

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
    if (isFullscreen) {
      setScale(Math.min(1.5, window.innerWidth / 600));
    } else if (isMobile) {
      setScale(Math.min(1.0, (containerWidth - 32) / 600));
    } else {
      setScale(Math.min(1.2, containerWidth / 800));
    }
    setCurrentPage(1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pageNum = parseInt(e.target.value);
    if (pageNum >= 1 && pageNum <= (numPages || 0)) {
      setCurrentPage(pageNum);
    }
  };

  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No file available for this magazine.</p>
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
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08);
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #e5e5e5;
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
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
          }
          
          .pdf-page {
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12), 0 3px 10px rgba(0, 0, 0, 0.08);
          }
        }
        
        /* Mobile optimizations */
        @media (max-width: 767px) {
          .pdf-page {
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08), 0 1px 6px rgba(0, 0, 0, 0.06);
            border-radius: 4px;
          }
          
          .page-container {
            transition: all 0.4s ease-in-out;
          }
          
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
        
        /* Responsive text sizing */
        @media (max-width: 640px) {
          .text-xs { font-size: 0.7rem; }
          .text-sm { font-size: 0.8rem; }
        }
      `}</style>

      <div className="w-full bg-white border rounded-lg overflow-hidden shadow-sm">
        {/* PDF Viewer - Main Content */}
        <div 
          ref={containerRef}
          className="relative flex justify-center bg-gradient-to-b from-gray-50 to-gray-100 overflow-auto"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handlePageClick}
          style={{ 
            cursor: isMobile ? 'default' : 'pointer',
            minHeight: isMobile ? '60vh' : '70vh',
            maxHeight: isMobile ? '60vh' : '80vh'
          }}
        >
          {/* Book Base Shadow */}
          <div className="absolute top-4 left-4 right-4 bottom-2 bg-black opacity-5 blur-sm transform translate-y-2 rounded-lg"></div>
          
          <div className="flex items-center justify-center p-2 sm:p-4">
            <Document
              file={fileUrl}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={handleDocumentLoadError}
              onLoadStart={onDocumentLoadStart}
              options={documentOptions}
              loading={
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600 text-sm sm:text-base">Loading magazine...</p>
                  </div>
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center p-4 sm:p-8">
                  <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-500 mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-red-600 text-center mb-2">
                    Failed to load magazine
                  </h3>
                  <p className="text-gray-600 text-center text-sm sm:text-base mb-4 max-w-md">
                    {error || 'The PDF file could not be loaded. Please check if the file exists and is accessible.'}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm sm:text-base"
                  >
                    Retry
                  </button>
                </div>
              }
            >
              {numPages && (
                <div className="relative">
                  {/* Single Page with Animation */}
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
                      width={isMobile ? Math.min(containerWidth - 32, 400) : undefined}
                    />
                  </div>
                </div>
              )}
            </Document>

            {/* Click zones for desktop */}
            {!isMobile && (
              <>
                <div className="absolute left-0 top-0 w-1/2 h-full z-20 cursor-w-resize opacity-0 hover:bg-blue-100 hover:opacity-5 transition-opacity"></div>
                <div className="absolute right-0 top-0 w-1/2 h-full z-20 cursor-e-resize opacity-0 hover:bg-blue-100 hover:opacity-5 transition-opacity"></div>
              </>
            )}
          </div>
        </div>

        {/* Controls - Moved to Bottom */}
        <div className="border-t bg-gray-50">
          {/* Page Navigation */}
          <div className="flex items-center justify-between p-3 sm:p-4">
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1 || isFlipping}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors text-sm sm:text-base"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <input
                type="number"
                value={currentPage}
                onChange={handlePageInputChange}
                min={1}
                max={numPages || 1}
                className="w-12 sm:w-16 px-1 sm:px-2 py-1 text-center border rounded text-xs sm:text-sm"
              />
              <span className="text-gray-600">of {numPages || '?'}</span>
            </div>
            
            <button
              onClick={goToNextPage}
              disabled={currentPage >= (numPages || 0) || isFlipping}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>

          {/* Zoom and Info Controls */}
          <div className="flex items-center justify-between px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {isMobile ? (
                <>
                  <Smartphone className="h-3 w-3" />
                  <span className="hidden sm:inline">Swipe to flip</span>
                  <span className="sm:hidden">Swipe</span>
                </>
              ) : (
                <>
                  <Monitor className="h-3 w-3" />
                  <span className="hidden sm:inline">Click sides to flip</span>
                  <span className="sm:hidden">Click</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleZoomOut}
                className="flex items-center gap-1 p-1 sm:px-2 sm:py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              
              <span className="text-xs sm:text-sm text-gray-600 min-w-12 sm:min-w-16 text-center">
                {Math.round(scale * 100)}%
              </span>
              
              <button
                onClick={handleZoomIn}
                className="flex items-center gap-1 p-1 sm:px-2 sm:py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              
              <button
                onClick={handleReset}
                className="flex items-center gap-1 p-1 sm:px-2 sm:py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors ml-1 sm:ml-2"
              >
                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1 p-1 sm:px-2 sm:py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ml-1 sm:ml-2"
                title="Toggle Fullscreen"
              >
                <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Fullscreen</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        {(loading || error) && (
          <div className="px-4 py-2 bg-gray-50 border-t text-xs sm:text-sm">
            {loading && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                Loading PDF...
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Fullscreen Header */}
          <div className="bg-gray-900 text-white p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold">Magazine Viewer</h2>
              <div className="text-sm text-gray-300">
                Page {currentPage} of {numPages || '?'}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Fullscreen Navigation Controls */}
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

              <div className="w-px h-6 bg-gray-600 mx-2"></div>

              {/* Exit Fullscreen */}
              <button
                onClick={exitFullscreen}
                className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                title="Exit Fullscreen (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Fullscreen Content */}
          <div className="flex-1 bg-gray-800 overflow-auto flex items-center justify-center">
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
                  </div>
                }
              >
                {numPages && (
                  <div className="relative">
                    <div 
                      className={`
                        page-container fullscreen-page
                        ${isFlipping ? 'flipping' : ''}
                        ${flipDirection === 'next' ? 'flip-next' : ''}
                        ${flipDirection === 'prev' ? 'flip-prev' : ''}
                      `}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                      onClick={handlePageClick}
                      style={{ cursor: isMobile ? 'default' : 'pointer' }}
                    >
                      <Page 
                        pageNumber={currentPage} 
                        scale={scale}
                        className="pdf-page fullscreen-pdf-page"
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                      />
                    </div>
                  </div>
                )}
              </Document>

              {/* Fullscreen Click zones for desktop */}
              {!isMobile && (
                <>
                  <div className="absolute left-0 top-16 w-1/3 h-full z-20 cursor-w-resize opacity-0 hover:bg-blue-500 hover:opacity-10 transition-opacity"></div>
                  <div className="absolute right-0 top-16 w-1/3 h-full z-20 cursor-e-resize opacity-0 hover:bg-blue-500 hover:opacity-10 transition-opacity"></div>
                </>
              )}
            </div>
          </div>

          {/* Fullscreen Footer Info */}
          <div className="bg-gray-900 text-gray-300 px-4 py-2 text-xs text-center">
            <span className="hidden sm:inline">Use arrow keys to navigate • </span>
            <span className="sm:hidden">Swipe to navigate • </span>
            Press ESC to exit fullscreen
          </div>
        </div>
      )}
    </>
  );
};

export default FlipBookViewer;