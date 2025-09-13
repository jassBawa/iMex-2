'use client';
import Header from '@/components/layout/Header';
import Assets from '@/components/trading/Assets';
import PriceChart from '@/components/trading/PriceChart';
import TradingPanel from '@/components/trading/TradingPanel';
import Orders from '@/components/trading/UserOrders';
import MobileTradingDrawer from '@/components/trading/MobileTradingDrawer';
import { useState, useRef, useCallback, useEffect } from 'react';

const Index = () => {
  const [leftPanelWidth, setLeftPanelWidth] = useState(20); // Percentage for Assets
  const [rightPanelWidth, setRightPanelWidth] = useState(25); // Percentage for TradingPanel
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const leftSliderRef = useRef<HTMLDivElement>(null);
  const rightSliderRef = useRef<HTMLDivElement>(null);

  const handleLeftMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingLeft(true);
  }, []);

  const handleRightMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingRight(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingLeft && !isDraggingRight) return;

      // Get the main container element
      const mainElement = document.querySelector('main');
      if (!mainElement) return;

      const containerRect = mainElement.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;

      if (isDraggingLeft) {
        // Calculate new width for Assets panel (from left edge)
        const newLeftWidth = (mouseX / containerWidth) * 100;

        // Set minimum and maximum constraints
        const minWidth = 15; // 15% minimum
        const maxWidth = 35; // 35% maximum

        if (newLeftWidth >= minWidth && newLeftWidth <= maxWidth) {
          setLeftPanelWidth(newLeftWidth);
        }
      }

      if (isDraggingRight) {
        // Calculate new width for Trading panel (from right edge)
        const newRightWidth =
          ((containerWidth - mouseX) / containerWidth) * 100;

        // Set minimum and maximum constraints
        const minWidth = 15; // 15% minimum
        const maxWidth = 35; // 35% maximum

        if (newRightWidth >= minWidth && newRightWidth <= maxWidth) {
          setRightPanelWidth(newRightWidth);
        }
      }
    },
    [isDraggingLeft, isDraggingRight]
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingLeft(false);
    setIsDraggingRight(false);
  }, []);

  // Add event listeners for mouse events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [handleMouseMove, handleMouseUp]);

  // Trigger chart resize when panel widths change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Small delay to ensure DOM has updated with new widths
      const timeoutId = setTimeout(() => {
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
      }, 10);

      return () => clearTimeout(timeoutId);
    }
  }, [leftPanelWidth, rightPanelWidth]);

  return (
    <div className="min-h-screen bg-background mb-24">
      <Header />
      <main className="mx-auto p-6">
        <div className="space-y-4 lg:space-y-0 mb-6">
          {/* Desktop Layout */}
          <div
            className={`hidden lg:flex h-[600px] gap-1 ${isDraggingLeft || isDraggingRight ? 'select-none' : ''}`}
          >
            {/* Assets Panel */}
            <div
              className="flex-shrink-0 overflow-hidden"
              style={{ width: `${leftPanelWidth}%` }}
            >
              <Assets />
            </div>

            {/* Resizable Slider - Left */}
            <div
              className={`w-1 cursor-col-resize transition-colors relative group flex-shrink-0 ${
                isDraggingLeft ? 'bg-primary' : 'bg-border hover:bg-primary/50'
              }`}
              onMouseDown={handleLeftMouseDown}
              ref={leftSliderRef}
              title="Drag to resize Assets panel"
            >
              <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize">
                <div
                  className={`w-3 h-full transition-colors ${
                    isDraggingLeft
                      ? 'bg-primary/20'
                      : 'bg-transparent hover:bg-primary/10'
                  }`}
                ></div>
              </div>
            </div>

            {/* Price Chart */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <PriceChart />
            </div>

            {/* Resizable Slider - Right */}
            <div
              className={`w-1 cursor-col-resize transition-colors relative group flex-shrink-0 ${
                isDraggingRight ? 'bg-primary' : 'bg-border hover:bg-primary/50'
              }`}
              onMouseDown={handleRightMouseDown}
              ref={rightSliderRef}
              title="Drag to resize Trading panel"
            >
              <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize">
                <div
                  className={`w-3 h-full transition-colors ${
                    isDraggingRight
                      ? 'bg-primary/20'
                      : 'bg-transparent hover:bg-primary/10'
                  }`}
                ></div>
              </div>
            </div>

            {/* Trading Panel */}
            <div
              className="flex-shrink-0 overflow-hidden"
              style={{ width: `${rightPanelWidth}%` }}
            >
              <TradingPanel />
            </div>
          </div>

          {/* Mobile/Tablet Layout */}
          <div className="lg:hidden space-y-4">
            <Assets />
            <PriceChart />
          </div>
        </div>

        <div className="mt-6">
          <Orders />
        </div>
      </main>

      {/* Mobile Trading Drawer */}
      <MobileTradingDrawer />
    </div>
  );
};

export default Index;
