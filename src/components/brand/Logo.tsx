import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({ className = "", variant = "dark", size = "md" }: LogoProps) {
  const isLight = variant === "light";
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };
  const titleSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };
  const taglineSizes = {
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-xs",
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-3 group ${className}`}>
      {/* Original BMC Shield & Wheel Mark */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          {/* Outer Shield Hexagon */}
          <path
            d="M22 2L40 9V23C40 33.5 32.5 40 22 43C11.5 40 4 33.5 4 23V9L22 2Z"
            fill="#0F172A"
            stroke="#E05A1B"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Inner Precision Steering / Cog Silhouette */}
          <circle cx="22" cy="22" r="10" stroke="#E05A1B" strokeWidth="2" strokeDasharray="3 2" />
          <circle cx="22" cy="22" r="5" fill="#E05A1B" />
          {/* Automotive Dynamics Chevron */}
          <path d="M16 22H28M22 16V28" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex flex-col leading-tight">
        <span
          className={`font-black tracking-wider uppercase ${titleSizes[size]} ${
            isLight ? "text-white" : "text-slate-900 group-hover:text-[#E05A1B] transition-colors"
          }`}
        >
          Bharat <span className="text-[#E05A1B]">Motor</span> Club
        </span>
        <span
          className={`font-semibold tracking-widest uppercase text-slate-400 ${taglineSizes[size]}`}
        >
          One Club. Every Automotive Need.
        </span>
      </div>
    </Link>
  );
}

