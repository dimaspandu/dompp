import { HTTP_PROTOCOLS, LINK_PROTOCOLS, URL_ATTRIBUTES, URL_LIST_ATTRIBUTES } from './constants.js';

export function toJavaScriptStyleName(name) {
  return name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function validateURLAttribute(name, value) {
  const urls = URL_LIST_ATTRIBUTES.has(name)
    ? String(value).split(',').map((candidate) => candidate.trim().split(/\s+/, 1)[0])
    : [String(value)];
  const allowedProtocols = name === 'href' || name === 'xlink:href'
    ? LINK_PROTOCOLS
    : HTTP_PROTOCOLS;

  for (const urlValue of urls) {
    if (!urlValue) continue;
    const normalizedURL = urlValue.replace(/[\u0000-\u001f\u007f]/g, '');
    let protocol;
    try {
      protocol = new URL(normalizedURL, document.baseURI).protocol;
    } catch {
      throw new TypeError("Invalid URL value for the  attribute.");
    }
    if (!allowedProtocols.has(protocol)) {
      throw new TypeError("Unsafe URL protocol for the  attribute: ");
    }
  }
}

export function validateAttribute(name, value) {
  if (value === false || value == null) return;
  const normalizedName = String(name).toLowerCase();
  if (normalizedName.startsWith('on')) {
    throw new TypeError("Inline event attributes are disabled. Use setEvents() for .");
  }
  if (normalizedName === 'srcdoc') {
    throw new TypeError('The srcdoc attribute is disabled because it accepts HTML.');
  }
  if (normalizedName === 'style') {
    throw new TypeError('Use setStyles() instead of setting the style attribute.');
  }
  if (URL_ATTRIBUTES.has(normalizedName) || URL_LIST_ATTRIBUTES.has(normalizedName)) {
    validateURLAttribute(normalizedName, value);
  }
}
