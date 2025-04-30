import * as React from 'react';

interface DndProviderProps {
  children: React.ReactNode;
}

// Simple mock for DndProvider in tests
export const DndProvider: React.FC<DndProviderProps> = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};

export default {
  DndProvider
};
