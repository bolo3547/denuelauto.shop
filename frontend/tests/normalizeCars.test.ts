import { normalizeCars } from '../utils/api';

describe('normalizeCars', () => {
  test('returns empty array for null/undefined', () => {
    expect(normalizeCars(null)).toEqual([]);
    expect(normalizeCars(undefined)).toEqual([]);
  });

  test('returns original array if already array', () => {
    const arr = [{ id: 1 }, { id: 2 }];
    expect(normalizeCars(arr)).toBe(arr);
  });

  test('extracts cars property', () => {
    const data = { cars: [{ id: 1 }] };
    expect(normalizeCars(data)).toEqual([{ id: 1 }]);
  });

  test('extracts list property', () => {
    const data = { list: [{ id: 1 }] };
    expect(normalizeCars(data)).toEqual([{ id: 1 }]);
  });

  test('extracts data property', () => {
    const data = { data: [{ id: 1 }] };
    expect(normalizeCars(data)).toEqual([{ id: 1 }]);
  });
});
