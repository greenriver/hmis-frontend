import {
  maskSSN,
  enrollmentName,
  formatDateForGql,
  parseAndFormatDate,
  parseAndFormatDateTime,
  parseHmisDateString,
} from './hmisUtil';

import { ProjectType } from '@/types/gqlTypes';

describe('Other fns', () => {
  it('enrollment name', () => {
    const withProjectType = {
      project: { projectName: 'Foo Bar', projectType: ProjectType.Es },
    };
    const withProjectTypeDayShelter = {
      project: { projectName: 'Foo Bar', projectType: ProjectType.DayShelter },
    };
    const withoutProjectType = { project: { projectName: 'Foo Bar' } };

    expect(enrollmentName(withProjectType)).toBe('Foo Bar');
    expect(enrollmentName(withProjectType, true)).toBe('Foo Bar (ES)');
    expect(enrollmentName(withoutProjectType, true)).toBe('Foo Bar');
    expect(enrollmentName(withProjectTypeDayShelter, true)).toBe(
      'Foo Bar (Day Shelter)'
    );
  });

  it('masks SSN', () => {
    expect(maskSSN('1234')).toBe('XXX-XX-1234');
    expect(maskSSN('123')).toBe('XXX-XX-X123');
    expect(maskSSN('123456789')).toBe('123-45-6789');
    expect(maskSSN('123-45-6789')).toBe('123-45-6789');
    expect(maskSSN('123XX6789')).toBe('123-XX-6789');
    expect(maskSSN('XXX456789')).toBe('XXX-45-6789');
    expect(maskSSN('abcd1234')).toBe('XXX-XX-1234');
    expect(maskSSN('000123456789')).toBe('123-45-6789');
  });
});

describe('Date fns', () => {
  describe('string -> string', () => {
    it('parse and format gql date for display', () => {
      expect(parseAndFormatDate('2021-12-01')).toBe('12/01/2021');
      expect(parseAndFormatDate('2021-01-31')).toBe('01/31/2021');
      expect(parseAndFormatDateTime('2023-02-02T15:50:10.000Z').length).toEqual(
        '02/02/2023 10:50 AM'.length // avoid dealing with timezones right now
      );
    });

    it('display string is forgiving, returns invalid strings as-is', () => {
      ['2021', '2020-13-02', '202-12-02'].forEach((s) => {
        expect(parseAndFormatDate(s)).toBe(s);
      });
    });
  });
  describe('string -> date', () => {
    it('parses gql strings into dates correctly', () => {
      const parsed = parseHmisDateString('2013-10-31');
      expect(parsed).not.toBeNull();
      if (!parsed) return;
      expect(parsed.getFullYear()).toBe(2013);
      expect(parsed.getMonth()).toBe(9);
      expect(parsed.getDate()).toBe(31);
      expect(formatDateForGql(parsed)).toBe('2013-10-31');
    });

    it('parsing is strict, returns null if format is wrong', () => {
      ['2021-06', '2021', '2020-13-02', '202-12-02'].forEach((s) => {
        expect(parseHmisDateString(s)).toBe(null);
      });
    });
  });
  describe('date -> string', () => {
    it('parses dates into gql strings correctly', () => {
      const formatted = formatDateForGql(new Date(2020, 0, 31));
      expect(formatted).toBe('2020-01-31');
    });

    it('is strict, returns null if format is wrong', () => {
      const formatted = formatDateForGql(new Date('this will be invalid'));
      expect(formatted).toBe(null);
    });
  });
});
