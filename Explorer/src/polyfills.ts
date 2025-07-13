import 'zone.js';  // Angular zone.js obično ide u polyfills
(window as any).global = window;  // polyfill za global objekat (SockJS i sl.)