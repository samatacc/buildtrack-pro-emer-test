'use client';

import React from 'react';
import { DndProvider as ReactDndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

interface DndProviderProps {
  children: React.ReactNode;
}

/**
 * DnD Provider
 * 
 * Wraps the application with React DnD functionality
 * Automatically detects touch devices and uses the appropriate backend
 * Enhances the dashboard customization experience in BuildTrack Pro
 */
export const DndProvider: React.FC<DndProviderProps> = ({ children }) => {
  // Detect if we're on a touch device
  const isTouchDevice = typeof window !== 'undefined' && (
    'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
  
  // Choose backend based on device type
  const backend = isTouchDevice ? TouchBackend : HTML5Backend;
  
  // Touch backend options
  const touchBackendOptions = {
    enableMouseEvents: true,
    enableTouchEvents: true,
    delayTouchStart: 150, // Delay in ms to differentiate between tap and drag
  };
  
  return (
    <ReactDndProvider backend={backend} options={isTouchDevice ? touchBackendOptions : undefined}>
      {children}
    </ReactDndProvider>
  );
};

export default DndProvider;
