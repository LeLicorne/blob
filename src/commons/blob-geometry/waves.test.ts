import { TEST_GEOMETRY } from '@/commons/tests/geometry-params';
import { WAVE_KEYS } from '@/const/blob-carousel';
import {
  bottomEdgeY,
  separatorDeviation,
  separatorX,
  topEdgeY,
  waveOffset,
} from '@/commons/blob-geometry/waves';

describe('separatorDeviation', () => {
  test('est la somme des quatre vagues', () => {
    const sum = WAVE_KEYS.reduce(
      (acc, key) => acc + waveOffset(key, TEST_GEOMETRY, 2, 130, 900),
      0,
    );
    expect(separatorDeviation(TEST_GEOMETRY, 2, 130, 900)).toBeCloseTo(sum, 10);
  });

  test('reste dans l’amplitude maximale annoncée', () => {
    const limit = TEST_GEOMETRY.sepAmp * 1.4 + TEST_GEOMETRY.liveAmp * 1.6;
    for (let y = 0; y <= 420; y += 7) {
      expect(Math.abs(separatorDeviation(TEST_GEOMETRY, 1, y, y * 31))).toBeLessThanOrEqual(limit);
    }
  });

  test('ne dépend plus du temps quand le mouvement vivant est nul', () => {
    const still = { ...TEST_GEOMETRY, liveAmp: 0 };
    expect(separatorDeviation(still, 1, 100, 0)).toBeCloseTo(
      separatorDeviation(still, 1, 100, 5000),
      10,
    );
  });
});

describe('separatorX', () => {
  test('place le séparateur i à i fois le pas, plus son écart', () => {
    expect(separatorX(TEST_GEOMETRY, 3, 50, 0)).toBeCloseTo(
      3 * TEST_GEOMETRY.pitch + separatorDeviation(TEST_GEOMETRY, 3, 50, 0),
      10,
    );
  });
});

describe('bords horizontaux', () => {
  test('le bord haut est au-dessus du bord bas', () => {
    for (let x = 0; x < 1000; x += 25) {
      expect(topEdgeY(TEST_GEOMETRY, x, 0)).toBeLessThan(bottomEdgeY(TEST_GEOMETRY, x, 0));
    }
  });
});
