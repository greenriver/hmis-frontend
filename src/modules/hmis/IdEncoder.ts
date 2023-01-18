import CryptoJS from 'crypto-js';
import { startOfToday } from 'date-fns';

export default class IdEncoder {
  static PROTECT_IDS = import.meta.env.PUBLIC_PROTECTED_IDS === 'true';

  static INITIAL_DELIMITER = import.meta.env.PUBLIC_INITIAL_DELIMITER || '==';

  static KEY = (
    import.meta.env.PUBLIC_PROTECTED_ID_KEY ||
    import.meta.env.PUBLIC_FQDN ||
    'rX9BDyW0'
  ).slice(0, 7);

  static DELIMITER_REGEX = new RegExp(`^${this.INITIAL_DELIMITER}`);

  static encode(id: number | string, force?: boolean): string {
    if (!force && !this.PROTECT_IDS) return String(id);

    return this.obfuscate(parseInt(String(id)));
  }

  static obfuscate(id: number): string {
    const dayStamp = startOfToday().valueOf() / (60 * 60 * 24);
    const composed = id * 2 ** 32 + dayStamp;
    const keyHex = CryptoJS.enc.Base64.parse(this.KEY);
    const encrypted = CryptoJS.DES.encrypt(composed.toString(16), keyHex, {
      mode: CryptoJS.mode.ECB,
    }).toString();

    return this.INITIAL_DELIMITER + btoa(encrypted);
  }

  static isEncoded(id?: string | number | null | undefined) {
    if (!id) return false;
    if (typeof id === 'number') return false;
    return !!id.match(this.DELIMITER_REGEX);
  }

  static decode(encoded: string): string {
    if (!encoded || !this.isEncoded(encoded)) return encoded;
    const id = this.deobfuscate(String(encoded));
    return String(id);
  }

  static deobfuscate(slug: string) {
    const encrypted = atob(slug.replace(this.DELIMITER_REGEX, ''));

    const keyHex = CryptoJS.enc.Base64.parse(this.KEY);

    const decrypted = CryptoJS.DES.decrypt(encrypted, keyHex, {
      mode: CryptoJS.mode.ECB,
    }).toString(CryptoJS.enc.Utf8);

    const composed = parseInt(decrypted, 16);
    // const dayStamp = composed >> 32;
    const id = Math.round(composed / 2 ** 32);

    return id;
  }
}
