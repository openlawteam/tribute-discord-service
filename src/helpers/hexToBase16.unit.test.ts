import {hexToBase16} from './hexToBase16';

describe('hexToBase16 unit tests', () => {
  test('should return a base 16 value', () => {
    expect(hexToBase16('FFFFFF')).toBe(16777215);
    expect(hexToBase16('#FFFFFF')).toBe(16777215);
    expect(hexToBase16('0xFFFFFF')).toBe(16777215);
  });

  test('should return a `null` value when value is not valid hex', () => {
    expect(hexToBase16('#ZZZFFF')).toBe(null);
    expect(hexToBase16('ZZZFFF')).toBe(null);
    expect(hexToBase16('X123456')).toBe(null);
  });
});
