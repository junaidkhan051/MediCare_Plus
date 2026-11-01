import React, { useState } from 'react';
import { Stethoscope, Building2, Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackType?: 'doctor' | 'facility' | 'general';
  doctorSpecialty?: string;
  className?: string;
  containerClassName?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackType = 'general',
  doctorSpecialty,
  className = '',
  containerClassName = '',
  loading = 'lazy',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // If no src is provided or error occurred, show styled medical fallback
  if (!src || hasError) {
    if (fallbackType === 'doctor') {
      return (
        <div
          className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-slate-100 to-teal-50 text-[#124E78] select-none p-3 text-center ${containerClassName}`}
          role="img"
          aria-label={alt}
        >
          <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-blue-100 flex items-center justify-center mb-1 text-[#124E78]">
            <Stethoscope className="w-5 h-5 text-teal-600" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 line-clamp-1">{alt}</span>
          {doctorSpecialty && (
            <span className="text-[10px] text-teal-700 font-medium line-clamp-1">{doctorSpecialty}</span>
          )}
        </div>
      );
    }

    if (fallbackType === 'facility') {
      return (
        <div
          className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 text-[#124E78] select-none p-4 text-center ${containerClassName}`}
          role="img"
          aria-label={alt}
        >
          <Building2 className="w-8 h-8 text-teal-600 mb-2" />
          <span className="text-xs font-bold text-slate-800">{alt}</span>
          <span className="text-[11px] text-slate-500">MediCare Plus Diagnostic Wing</span>
        </div>
      );
    }

    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 select-none ${containerClassName}`}
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="w-6 h-6 text-slate-300" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden w-full h-full ${containerClassName}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center z-10">
          <Stethoscope className="w-5 h-5 text-slate-400 opacity-40 animate-bounce" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        {...rest}
      />
    </div>
  );
};
