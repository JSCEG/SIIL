/**
 * Example Test File
 * Demonstrates Jest configuration and browser API mocking
 */

import { describe, test, expect, beforeEach } from '@jest/globals';

describe('Jest Configuration', () => {
  test('should run basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should have access to Jest globals', () => {
    expect(describe).toBeDefined();
    expect(test).toBeDefined();
    expect(expect).toBeDefined();
  });
});

describe('Browser API Mocks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('localStorage', () => {
    test('should store and retrieve items', () => {
      localStorage.setItem('test', 'value');
      expect(localStorage.getItem('test')).toBe('value');
    });

    test('should remove items', () => {
      localStorage.setItem('test', 'value');
      localStorage.removeItem('test');
      expect(localStorage.getItem('test')).toBeNull();
    });

    test('should clear all items', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.clear();
      expect(localStorage.length).toBe(0);
    });
  });

  describe('Geolocation API', () => {
    test('should get current position', (done) => {
      navigator.geolocation.getCurrentPosition((position) => {
        expect(position.coords.latitude).toBeDefined();
        expect(position.coords.longitude).toBeDefined();
        expect(position.coords.altitude).toBeDefined();
        done();
      });
    });
  });

  describe('Fetch API', () => {
    test('should mock fetch', async () => {
      const response = await fetch('https://api.example.com/data');
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
    });
  });

  describe('File APIs', () => {
    test('should create Blob', () => {
      const blob = new Blob(['test'], { type: 'text/plain' });
      expect(blob).toBeDefined();
      expect(blob).toBeInstanceOf(Blob);
    });

    test('should create File', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      expect(file).toBeDefined();
      expect(file.name).toBe('test.txt');
    });
  });
});

describe('ES Modules Support', () => {
  test('should support import/export', async () => {
    // This test passing confirms ES modules are working
    const module = { default: 'test' };
    expect(module.default).toBe('test');
  });
});
