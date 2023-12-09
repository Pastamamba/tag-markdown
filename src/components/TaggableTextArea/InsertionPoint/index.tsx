import React from 'react';

interface InsertionPointProps {
  position: {
    x: number;
    y: number;
  };
}

const InsertionPoint: React.FC<InsertionPointProps> = ({ position }) => {
  const { x, y } = position;

  return (
    <div
      className="w-px h-6 fixed top-0 left-0 bg-blue-500 duration-[0.05s]"
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`
      }}
    />
  );
};

export default InsertionPoint;
