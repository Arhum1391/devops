"use client";

import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

const CustomButton: React.FC<Props> = ({ className = '', children, ...props }) => {
  const base =
    'inline-flex items-center justify-center cursor-pointer rounded-full text-sm transition-opacity disabled:opacity-50';

  return (
    <button {...props} className={`${base} ${className}`.trim()}>
      {children}
    </button>
  );
};

export default CustomButton;
