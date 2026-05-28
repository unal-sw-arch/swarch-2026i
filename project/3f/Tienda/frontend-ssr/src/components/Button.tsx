"use client";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
}

export default function Button({ 
  children, 
  className = "", 
  variant = 'primary',
  ...rest 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 active:scale-95";
  
  const variants = {
    primary: "bg-yellow-400 text-white hover:bg-yellow-500 hover:shadow-elevation-2 hover:translate-y-[-2px] active:bg-yellow-600",
    secondary: "bg-white text-gray-800 border-2 border-yellow-400 hover:bg-yellow-50 hover:shadow-elevation-2",
    tertiary: "bg-transparent text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700",
  };

  return (
    <button 
      {...rest} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
    > 
      {children} 
    </button>
  );
}
