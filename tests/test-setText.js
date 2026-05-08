// Test for setTextImpl
import { setTextImpl } from '../src/1.0.1/index.js';

const mockEl = {
  textContent: '',
  __dompp_state: undefined
};

console.log('Testing setTextImpl...');

try {
  setTextImpl.call(mockEl, 'Hello World');
  if (mockEl.textContent === 'Hello World') {
    console.log('✓ setTextImpl basic test passed');
  } else {
    console.log('✗ setTextImpl basic test failed');
  }
} catch (e) {
  console.log('✗ setTextImpl basic test error:', e.message);
}

// Test with function (reactive)
mockEl.textContent = '';
try {
  setTextImpl.call(mockEl, () => 'Reactive Text');
  if (mockEl.textContent === 'Reactive Text') {
    console.log('✓ setTextImpl reactive test passed');
  } else {
    console.log('✗ setTextImpl reactive test failed');
  }
} catch (e) {
  console.log('✗ setTextImpl reactive test error:', e.message);
}