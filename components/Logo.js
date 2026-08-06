import React from "react";

/**
 * Logo component – displays a custom SVG airplane icon with an optional,
 * distinctively-styled "JahazTicket" wordmark (two-tone + accent swoosh
 * echoing the icon's wing curve, so the brand mark reads as one unit).
 *
 * @param {number|string} size - Numeric pixel size, or "default" (48) / "large" (64)
 * @param {boolean} withText - Whether to show the "JahazTicket" wordmark
 * @param {string} textClass - Additional Tailwind classes for the text (overrides auto)
 */
export default function Logo({ size = "default", withText = false, textClass = "", invert = false }) {
  let svgSize = 48;
  let defaultTextClass = "text-lg";

  if (typeof size === "number") {
    svgSize = size;
  } else if (size === "large") {
    svgSize = 64;
    defaultTextClass = "text-2xl";
  } else {
    svgSize = 48;
    defaultTextClass = "text-lg";
  }

  const finalTextClass = textClass || defaultTextClass;

  return (
    <div className="flex items-center gap-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
        width={svgSize}
        height={svgSize}
        className="flex-shrink-0"
      >
        <circle cx="250" cy="250" r="230" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="8" />
        <path
          d="M 250,70 L 410,380 C 370,350 310,335 250,335 C 190,335 130,350 90,380 Z"
          fill="#0B2545"
        />
        <path
          d="M 130,335 C 180,305 220,295 250,295 C 280,295 320,305 370,335 C 330,315 280,305 250,305 C 220,305 170,315 130,335 Z"
          fill="#00A8E8"
        />
      </svg>

      {withText && (
        <div className="flex flex-col leading-none">
          <span className={`font-display font-extrabold tracking-tight ${finalTextClass}`}>
            <span className={invert ? "text-white" : "text-jtNavy"}>Jahaz</span>
            <span className="text-jtCyan">Ticket</span>
          </span>
          {/* Accent swoosh — echoes the icon's wing curve, ties the wordmark to the mark */}
          <svg
            viewBox="0 0 120 10"
            className="w-full mt-0.5"
            style={{ height: 4 }}
            preserveAspectRatio="none"
          >
            <path d="M0,2 Q60,10 120,2" fill="none" stroke="#00A8E8" strokeWidth="2" />
          </svg>
        </div>
      )}
    </div>
  );
}
