// SVG-иконки в виде строк 
const line = (paths, size = 16) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

export const icons = {
  grip: line('<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>'),
  minus: line('<path d="M5 12h14"/>'),
  plus: line('<path d="M12 5v14M5 12h14"/>'),
  close: line('<path d="M18 6 6 18M6 6l12 12"/>'),
  left: line('<path d="m15 18-6-6 6-6"/>'),
  right: line('<path d="m9 18 6-6-6-6"/>'),
  up: line('<path d="m17 11-5-5-5 5M17 18l-5-5-5 5"/>', 12),
  phone: line('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>', 14),

  sun: line('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', 28),
  cloud: line('<path d="M17.5 18H9a6 6 0 1 1 5.7-7.9h2.8a4 4 0 1 1 0 7.9z"/>', 28),
  rain: line('<path d="M17.5 15H8a6 6 0 1 1 5.7-7.9h.3a4 4 0 0 1 3.5 7.9z"/><path d="M8 19v2M12 19v2M16 19v2"/>', 28),
  snow: line('<path d="M17.5 15H8a6 6 0 1 1 5.7-7.9h.3a4 4 0 0 1 3.5 7.9z"/><path d="M8 19h.01M12 21h.01M16 19h.01"/>', 28),

  // логотипы сервисов связи
  zoom: `<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#2D8CFF"/>
      <rect x="6" y="11" width="14" height="10" rx="3" fill="#fff"/>
      <path d="M21 14.5 26 11v10l-5-3.5z" fill="#fff"/>
    </svg>`,
  meet: `<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#fff" stroke="#e6e8f5"/>
      <path d="M6 14 10 10v4z" fill="#EA4335"/>
      <path d="M10 10h8a2 2 0 0 1 2 2v2H10z" fill="#FFBA00"/>
      <path d="M6 14h4v8H8a2 2 0 0 1-2-2z" fill="#2684FC"/>
      <path d="M10 14h10v6a2 2 0 0 1-2 2h-8z" fill="#00AC47"/>
      <path d="M20 14 26 10v12l-6-4z" fill="#00832D"/>
    </svg>`,
  telegram: `<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#2AABEE"/>
      <path d="M8 15.5 22 10c.7-.3 1.3.2 1.1 1.2l-2.4 11.2c-.2.8-.7 1-1.4.6l-3.7-2.7-1.8 1.7c-.2.2-.4.4-.8.4l.3-3.8 6.9-6.2c.3-.3-.1-.4-.5-.2l-8.5 5.4-3.7-1.1c-.8-.3-.8-.8.2-1.1z" fill="#fff"/>
    </svg>`,
};
