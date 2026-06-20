import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';
  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md border border-gray-200
        ${paddingClasses[padding]}
        ${hoverClass}
        ${cursorClass}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;

// Made with Bob
