const HeroIllustration = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 560 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Soft pink circle backdrop */}
      <circle cx="380" cy="220" r="180" fill="#FEE2E2" opacity="0.45" />

      {/* Floor line shadow */}
      <ellipse cx="290" cy="478" rx="240" ry="8" fill="#0a0a0a" opacity="0.06" />

      {/* Body / Torso (white t-shirt with line art) */}
      <g stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="#FFFFFF">
        {/* Torso */}
        <path d="M150 470 L150 360 C150 320 175 295 220 290 L335 290 C380 295 400 320 400 360 L405 470 Z" />
        {/* Neck */}
        <path d="M255 295 L255 270 Q255 265 260 263 L295 263 Q300 265 300 270 L300 295" fill="#FFFFFF" />
        {/* Sleeve fold */}
        <path d="M165 330 Q150 340 150 360" fill="none" />
        <path d="M390 330 Q405 340 405 360" fill="none" />
      </g>

      {/* Head + Hair (curly) */}
      <g stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* Hair back */}
        <path
          d="M215 175 Q205 130 235 110 Q245 95 270 92 Q295 80 325 92 Q355 90 365 120 Q380 135 370 175 Q365 195 360 205"
          fill="#0a0a0a"
        />
        {/* Curl bumps on top */}
        <path d="M225 130 Q220 115 235 110" fill="#0a0a0a" stroke="#0a0a0a" />
        <path d="M250 105 Q255 92 270 92" fill="#0a0a0a" />
        <path d="M295 90 Q310 82 320 92" fill="#0a0a0a" />
        <path d="M340 95 Q355 95 360 110" fill="#0a0a0a" />
        {/* Face */}
        <path
          d="M232 175 Q228 215 240 240 Q255 270 290 270 Q325 270 340 240 Q352 215 348 175 Q345 155 290 152 Q235 155 232 175 Z"
          fill="#FFFFFF"
        />
        {/* Hair front fringe */}
        <path
          d="M235 175 Q240 145 270 142 Q305 138 345 152 Q355 158 348 175"
          fill="#0a0a0a"
        />
        <path d="M250 165 Q260 150 280 150" fill="#0a0a0a" />
        <path d="M300 150 Q320 150 330 165" fill="#0a0a0a" />
        {/* Ear */}
        <path d="M230 205 Q222 205 222 215 Q222 225 230 225" fill="#FFFFFF" />
        {/* Eyebrows */}
        <path d="M252 198 Q258 195 268 198" />
        <path d="M312 198 Q318 195 328 198" />
        {/* Eyes */}
        <circle cx="260" cy="210" r="2.5" fill="#0a0a0a" />
        <circle cx="320" cy="210" r="2.5" fill="#0a0a0a" />
        {/* Nose */}
        <path d="M289 218 L285 235 Q285 240 290 240" />
        {/* Smile */}
        <path d="M275 250 Q290 258 305 250" />
      </g>

      {/* Laptop */}
      <g>
        {/* Laptop base (front of keyboard) */}
        <path
          d="M110 470 L490 470 L505 490 L95 490 Z"
          fill="#FFFFFF"
          stroke="#0a0a0a"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Trackpad notch */}
        <rect x="270" y="475" width="60" height="4" rx="2" fill="#0a0a0a" opacity="0.4" />
        {/* Laptop screen */}
        <path
          d="M150 470 L450 470 L430 340 L170 340 Z"
          fill="#FFFFFF"
          stroke="#0a0a0a"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Inner screen */}
        <path
          d="M165 460 L435 460 L418 350 L182 350 Z"
          fill="#FAFAFA"
          stroke="#0a0a0a"
          strokeWidth="2"
        />
        {/* Apple-style logo / cursor mark on lid */}
        <g transform="translate(290 395)">
          <path d="M3 -7 L2 -3" stroke="#ef2a2a" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 -6 L6 -2" stroke="#ef2a2a" strokeWidth="2" strokeLinecap="round" />
          <path d="M-2 -6 L0 -2" stroke="#ef2a2a" strokeWidth="2" strokeLinecap="round" />
          <path d="M0 0 L13 7 L7 9 L4 16 L0 0 Z" fill="#ef2a2a" stroke="#ef2a2a" strokeWidth="1" strokeLinejoin="round" />
        </g>
      </g>

      {/* Arms reaching to laptop */}
      <g stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="#FFFFFF">
        {/* Left arm */}
        <path d="M170 340 Q180 380 200 410 Q215 430 235 440 L260 445 Q275 446 278 438" />
        {/* Right arm */}
        <path d="M390 340 Q380 380 360 410 Q345 430 325 440 L300 445 Q285 446 282 438" />
        {/* Hands at laptop */}
        <path d="M260 445 Q275 442 285 445 Q295 448 300 445" fill="#FFFFFF" />
      </g>

      {/* Coffee mug with cursor logo */}
      <g>
        <path
          d="M455 415 L455 470 Q455 480 465 480 L500 480 Q510 480 510 470 L510 415 Z"
          fill="#0a0a0a"
          stroke="#0a0a0a"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Mug handle */}
        <path
          d="M510 430 Q525 432 525 445 Q525 458 510 460"
          fill="none"
          stroke="#0a0a0a"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Cursor on mug */}
        <g transform="translate(475 430)">
          <path d="M3 -3 L2 1" stroke="#ef2a2a" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 -2 L6 2" stroke="#ef2a2a" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M-2 -2 L0 2" stroke="#ef2a2a" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M0 4 L11 9 L6 11 L4 16 L0 4 Z" fill="#ef2a2a" />
        </g>
      </g>

      {/* Click sparks near head */}
      <g stroke="#ef2a2a" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M390 110 L395 95" />
        <path d="M408 120 L420 115" />
        <path d="M398 135 L412 135" />
      </g>
    </svg>
  );
};

export default HeroIllustration;
