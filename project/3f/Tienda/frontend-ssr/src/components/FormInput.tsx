"use client";
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  textarea?: boolean;
  value?: any;
  label?: string;
}

export default function FormInput({ 
  textarea = false, 
  className = "", 
  label,
  ...rest 
}: any) {
  const baseStyles = "w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white transition-all duration-200 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 focus:shadow-elevation-1 placeholder:text-gray-400 text-gray-800";
  
  const inputElement = textarea ? (
    <textarea 
      {...rest} 
      className={`${baseStyles} resize-vertical min-h-[120px] ${className}`} 
    />
  ) : (
    <input 
      {...rest} 
      className={`${baseStyles} ${className}`} 
    />
  );

  if (label) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        {inputElement}
      </div>
    );
  }

  return inputElement;
}
