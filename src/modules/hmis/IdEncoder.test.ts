import { it, describe, expect } from 'vitest';
import IdEncoder from './IdEncoder';

describe('Obfuscation methods', () => {
  it('obfuscates and deobfuscates correctly', () => {
    const input = 123;

    const obfuscated = IdEncoder.obfuscate(input);
    const result = IdEncoder.deobfuscate(obfuscated);

    expect(input).toEqual(result);
  });

  it('works on various IDs', () => {
    [0, 1, 2, 7, 16, 32, 97, 99, 100, 600, 9999].forEach((num) => {
      const obfuscated = IdEncoder.obfuscate(num);
      const result = IdEncoder.deobfuscate(obfuscated);

      expect(num).toEqual(result);
    });
  });

  it('encodes and decodes correctly', () => {
    const input = 123;

    const unencoded = IdEncoder.encode(input);
    const encoded = IdEncoder.encode(input, true);
    // Env var is not set to protect IDs
    expect(unencoded).toEqual(String(input));
    // Passing force to ensure it encodes anyway
    expect(encoded).not.toEqual(String(input));

    expect(IdEncoder.isEncoded(unencoded)).toEqual(false);
    expect(IdEncoder.isEncoded(encoded)).toEqual(true);

    expect(IdEncoder.decode(unencoded)).toEqual(String(input));
    expect(IdEncoder.decode(encoded)).toEqual(String(input));
  });
});
