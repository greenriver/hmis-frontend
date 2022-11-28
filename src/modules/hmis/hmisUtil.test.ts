import {
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
});

describe('Date fns', () => {
  describe('string -> string', () => {
    it('parse and format gql date for display', () => {
      expect(parseAndFormatDate('2021-12-01')).toBe('12/01/2021');
      expect(parseAndFormatDate('2021-01-31')).toBe('01/31/2021');
      expect(parseAndFormatDateTime('2021-12-01T03:10:49-04:00')).toBe(
        '12/01/2021'
      );
    });

    it('display string is forgiving, returns invalid strings as-is', () => {
      ['2021-06', '2021', '2020-13-02', '202-12-02'].forEach((s) => {
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
