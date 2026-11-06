import { installBuilders } from './install/install-builders.js';
import { elementBuilder } from './builders/elementBuilder.js';
import { componentBuilder } from './builders/componentBuilder.js';

export { elementBuilder, componentBuilder };
export { ElementBuilder } from './builders/elementBuilder.js';
export { ComponentBuilder } from './builders/componentBuilder.js';

if (typeof window !== 'undefined') {
  installBuilders();
  window.elementBuilder = document.elementBuilder;
  window.componentBuilder = document.componentBuilder;
}
