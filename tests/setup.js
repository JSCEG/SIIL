/**
 * Jest Setup File
 * Mocks browser APIs for testing vanilla JavaScript
 */

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

global.localStorage = localStorageMock;

// Mock IndexedDB (basic implementation)
global.indexedDB = {
  open: () => ({
    onsuccess: null,
    onerror: null,
    result: {
      createObjectStore: () => ({}),
      transaction: () => ({
        objectStore: () => ({
          add: () => ({ onsuccess: null, onerror: null }),
          get: () => ({ onsuccess: null, onerror: null }),
          put: () => ({ onsuccess: null, onerror: null }),
          delete: () => ({ onsuccess: null, onerror: null })
        })
      })
    }
  })
};

// Mock Geolocation API
global.navigator = {
  ...global.navigator,
  geolocation: {
    getCurrentPosition: (success, error) => {
      // Mock successful geolocation
      success({
        coords: {
          latitude: 29.0729,
          longitude: -110.9559,
          altitude: 200,
          accuracy: 10
        },
        timestamp: Date.now()
      });
    },
    watchPosition: () => 1,
    clearWatch: () => {}
  },
  onLine: true
};

// Mock fetch API
global.fetch = async (url, options) => {
  return {
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => '',
    blob: async () => new Blob()
  };
};

// Mock Blob
if (typeof Blob === 'undefined') {
  global.Blob = class Blob {
    constructor(parts, options) {
      this.parts = parts;
      this.options = options;
    }
  };
}

// Mock File
if (typeof File === 'undefined') {
  global.File = class File extends Blob {
    constructor(parts, name, options) {
      super(parts, options);
      this.name = name;
      this.lastModified = Date.now();
    }
  };
}

// Mock FileReader
if (typeof FileReader === 'undefined') {
  global.FileReader = class FileReader {
    readAsDataURL() {
      setTimeout(() => {
        this.onload({ target: { result: 'data:image/png;base64,mock' } });
      }, 0);
    }
    readAsText() {
      setTimeout(() => {
        this.onload({ target: { result: 'mock text' } });
      }, 0);
    }
  };
}

// Mock console methods for cleaner test output (optional)
// Uncomment if you want to suppress console logs during tests
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };
