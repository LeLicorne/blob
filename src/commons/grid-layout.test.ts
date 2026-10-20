import { DEFAULT_GRID_SHAPE } from '@/const/blob-carousel';
import {
  cellPosition,
  gridDesignSize,
  gridInset,
  resolveGridDimensions,
} from '@/commons/grid-layout';

describe('resolveGridDimensions', () => {
  test('adapte les lignes au nombre de diapositives quand seules les colonnes sont fixées', () => {
    expect(resolveGridDimensions(7, 3)).toEqual({ columns: 3, rows: 3, visibleCount: 7 });
  });

  test('adapte les colonnes au nombre de diapositives quand seules les lignes sont fixées', () => {
    expect(resolveGridDimensions(7, undefined, 2)).toEqual({
      columns: 4,
      rows: 2,
      visibleCount: 7,
    });
  });

  test('ignore les diapositives en trop quand colonnes et lignes sont fixées', () => {
    expect(resolveGridDimensions(10, 2, 3)).toEqual({ columns: 2, rows: 3, visibleCount: 6 });
  });

  test('garde une grille fixe même avec peu de diapositives', () => {
    expect(resolveGridDimensions(2, 3, 3)).toEqual({ columns: 3, rows: 3, visibleCount: 2 });
  });

  test('choisit une grille la plus carrée possible sans consigne', () => {
    expect(resolveGridDimensions(8)).toEqual({ columns: 3, rows: 3, visibleCount: 8 });
    expect(resolveGridDimensions(4)).toEqual({ columns: 2, rows: 2, visibleCount: 4 });
  });

  test('impose au moins une colonne et une ligne', () => {
    expect(resolveGridDimensions(0)).toEqual({ columns: 1, rows: 1, visibleCount: 0 });
    expect(resolveGridDimensions(3, 0, -2)).toEqual({ columns: 1, rows: 1, visibleCount: 1 });
  });

  test('arrondit à l’entier inférieur', () => {
    expect(resolveGridDimensions(6, 2.9)).toEqual({ columns: 2, rows: 3, visibleCount: 6 });
  });
});

describe('gridInset', () => {
  test('couvre l’écart maximal des vagues moins le demi-espace', () => {
    expect(gridInset(DEFAULT_GRID_SHAPE)).toBeCloseTo(40 * 1.12 + 4 * 1.6 - 8, 10);
  });

  test('ne devient jamais négative', () => {
    expect(gridInset({ ...DEFAULT_GRID_SHAPE, sepAmp: 0, liveAmp: 0, gap: 60 })).toBe(0);
  });
});

describe('gridDesignSize', () => {
  const dimensions = { columns: 3, rows: 2, visibleCount: 6 };

  test('compose les cellules de 300 de large', () => {
    expect(gridDesignSize(dimensions, 1, 0)).toEqual({
      width: 900,
      height: 600,
      cellWidth: 300,
      cellHeight: 300,
    });
  });

  test('déduit la hauteur des cellules du rapport largeur / hauteur', () => {
    expect(gridDesignSize(dimensions, 1.5, 0)).toMatchObject({ height: 400, cellHeight: 200 });
  });

  test('ajoute une demi-cellule de large quand les rangées sont décalées', () => {
    expect(gridDesignSize(dimensions, 1, 0, true)).toMatchObject({ width: 1050, height: 600 });
  });

  test('ne décale rien quand il n’y a qu’une rangée', () => {
    expect(gridDesignSize({ columns: 3, rows: 1, visibleCount: 3 }, 1, 0, true).width).toBe(900);
  });

  test('ajoute la marge de chaque côté', () => {
    expect(gridDesignSize(dimensions, 1, 10)).toMatchObject({ width: 920, height: 620 });
  });
});

describe('cellPosition', () => {
  test('range les diapositives de gauche à droite puis de haut en bas', () => {
    expect(cellPosition(0, 3)).toEqual({ column: 0, row: 0 });
    expect(cellPosition(2, 3)).toEqual({ column: 2, row: 0 });
    expect(cellPosition(4, 3)).toEqual({ column: 1, row: 1 });
  });
});
