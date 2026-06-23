// Minimal inline SVG icon set for RTM OS navigation
import React from "react";

interface IconProps {
  className?: string;
}

export const IconDashboard = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z"/>
  </svg>
);

export const IconBuilding = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
  </svg>
);

export const IconTrending = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
  </svg>
);

export const IconCreditCard = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
  </svg>
);

export const IconFile = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
  </svg>
);

export const IconPalette = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 012 2v1a4 4 0 01-4 4H7zm0 0V9"/>
  </svg>
);

export const IconSearch = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
);

export const IconTarget = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <circle cx="12"cy="12"r="10"strokeWidth={1.75} />
    <circle cx="12"cy="12"r="6"strokeWidth={1.75} />
    <circle cx="12"cy="12"r="2"strokeWidth={1.75} />
  </svg>
);

export const IconBarChart = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
  </svg>
);

export const IconStar = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
  </svg>
);

export const IconShield = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
  </svg>
);

export const IconSettings = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

export const IconBell = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
  </svg>
);

export const IconMenu = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
);

export const IconX = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
  </svg>
);

export const IconUsers = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

export const IconClipboard = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
  </svg>
);

export const IconCheckSquare = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
  </svg>
);

export const IconChevronDown = ({ className }: IconProps) => (
  <svg className={className} fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M19 9l-7 7-7-7"/>
  </svg>
);
