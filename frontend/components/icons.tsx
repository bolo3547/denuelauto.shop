import React from 'react';

export const IconInventory = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={`${className} text-primary`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="3" y="7" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.25" />
    <rect x="10" y="7" width="11" height="10" rx="1" stroke="currentColor" strokeWidth="1.25" />
  </svg>
);

export const IconLeads = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={`${className} text-primary`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4 13h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 18h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconPayments = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={`${className} text-primary`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconAgents = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={`${className} text-primary`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 20c0-3 3-5 8-5s8 2 8 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconExport = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={`${className} text-primary`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 7v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 11l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconBuyer = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={`${className} text-primary`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 20a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconPhotos = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={`${className} text-primary`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="9.5" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M21 19l-5-5-4 4-3-3-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// NOTE: No default export; use named icon exports instead.
