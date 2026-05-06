"use client";

import React, { useEffect } from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

const CustomInput: React.FC<Props> = ({ className = '', ...props }) => {
  const base =
    'w-full h-10 border border-white/30 rounded-lg px-4 bg-transparent text-white/60 placeholder-white/30 text-sm font-normal gilroy-medium outline-none focus:border-white/30 focus:ring-0 focus:outline-none';

  useEffect(() => {
    // Add styles to handle focus and autofill
    const styleId = 'custom-input-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .custom-input-focus-remove:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        .custom-input-focus-remove:-webkit-autofill,
        .custom-input-focus-remove:-webkit-autofill:hover,
        .custom-input-focus-remove:-webkit-autofill:focus,
        .custom-input-focus-remove:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px transparent inset !important;
          box-shadow: 0 0 0 30px transparent inset !important;
          background-color: transparent !important;
          background-image: none !important;
          -webkit-text-fill-color: rgba(255, 255, 255, 0.6) !important;
          color: rgba(255, 255, 255, 0.6) !important;
          transition: background-color 5000s ease-in-out 0s, background-image 5000s ease-in-out 0s !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <input 
      {...props} 
      className={`${base} custom-input-focus-remove ${className}`}
      style={{
        ...props.style,
        outline: 'none',
      }}
      onFocus={(e) => {
        e.target.style.outline = 'none';
        e.target.style.boxShadow = 'none';
        if (props.onFocus) {
          props.onFocus(e);
        }
      }}
    />
  );
};

export default CustomInput;
