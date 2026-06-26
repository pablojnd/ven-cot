import { describe, expect, test } from 'bun:test';
import { getPreviewProfileColors } from './WindowPreviewColors';

describe('getPreviewProfileColors', () => {
  test('keeps white profiles pure white and adds a black outer border', () => {
    expect(getPreviewProfileColors('#FFFFFF')).toEqual({
      profileColor: '#FFFFFF',
      detailColor: '#555555',
      outerBorderColor: '#000000',
    });
  });

  test('uses non-white profile colors directly without an outer border', () => {
    expect(getPreviewProfileColors('#6B3A17')).toEqual({
      profileColor: '#6B3A17',
      detailColor: '#6B3A17',
      outerBorderColor: null,
    });
  });
});
