// components/Logo.js
import React from "react";

export default function Logo({ size = 48, withText = false, textClass = "" }) {
  return (
    <div className="flex items-center gap-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
        width={size}
        height={size}
        className="flex-shrink-0"
      >
        {/* Background Circle — Soft Sky White */}
        <circle
          cx="250"
          cy="250"
          r="230"
          fill="#F8FAFC"
          stroke="#E2E8F0"
          strokeWidth="8"
        />
        
        {/* Outer Arrowhead / Stealth Shape — Deep Navy */}
        <path
          d="M 250,70 L 410,380 C 370,350 310,335 250,335 C 190,335 130,350 90,380 Z"
          fill="#0B2545"
        />
        
        {/* Inner Curved Wing — Aero Cyan */}
        <path
          d="M 130,335 C 180,305 220,295 250,295 C 280,295 320,305 370,335 C 330,315 280,305 250,305 C 220,305 170,315 130,335 Z"
          fill="#00A8E8"
        />
      </svg>
      
      {withText && (
        <span className={`font-bold tracking-tight ${textClass}`}>
          <span className="text-jtNavy">Jahaz</span>
          <span className="text-jtCyan">Ticket</span>
        </span>
      )}
    </div>
  );
}
