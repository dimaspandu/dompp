export const SVG_NS = 'http://www.w3.org/2000/svg';
export const svgOnlyTags = new Set(['svg','circle','path','rect','line','polyline','polygon','ellipse','g','defs','use','symbol','text','tspan','textPath','image','foreignObject','mask','clipPath','pattern','linearGradient','radialGradient','stop','filter','feGaussianBlur','feColorMatrix','animate','animateTransform','animateMotion','marker','view','switch']);
export const HTTP_PROTOCOLS = new Set(['http:','https:']);
export const LINK_PROTOCOLS = new Set(['http:','https:','mailto:','tel:']);
export const URL_ATTRIBUTES = new Set(['href','xlink:href','src','action','formaction','poster','cite','background','data','manifest','codebase','longdesc','profile','usemap']);
export const URL_LIST_ATTRIBUTES = new Set(['srcset','imagesrcset']);