import { screen, waitFor } from '@testing-library/react';
import { BlobGrid } from '@/components/blob-grid';
import { DEFAULT_GRID_SHAPE } from '@/const/blob-carousel';
import { gridDesignSize, gridInset, resolveGridDimensions } from '@/commons/grid-layout';
import { buildSlides } from '@/commons/tests/factories';
import { renderWithUser } from '@/commons/tests/render';

describe('BlobGrid', () => {
  test('expose un groupe nommé qui contient un blob décrit par diapositive', () => {
    renderWithUser(<BlobGrid slides={buildSlides(4)} label="Réalisations" />);
    expect(screen.getByRole('group', { name: 'Réalisations' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(4);
    expect(screen.getByRole('img', { name: 'Slide 3' })).toBeInTheDocument();
  });

  test('dessine la grille dans un espace proportionnel au nombre de colonnes et de lignes', () => {
    const { container } = renderWithUser(<BlobGrid slides={buildSlides(7)} columns={3} />);
    const size = gridDesignSize(resolveGridDimensions(7, 3), 1, gridInset(DEFAULT_GRID_SHAPE));
    expect(container.querySelector('svg')).toHaveAttribute(
      'viewBox',
      `0 0 ${size.width} ${size.height}`,
    );
    expect(screen.getByRole('group')).toHaveStyle({
      aspectRatio: `${size.width} / ${size.height}`,
    });
  });

  test('adapte les colonnes quand seules les lignes sont fixées', () => {
    const { container } = renderWithUser(<BlobGrid slides={buildSlides(7)} rows={2} />);
    const size = gridDesignSize(
      resolveGridDimensions(7, undefined, 2),
      1,
      gridInset(DEFAULT_GRID_SHAPE),
    );
    expect(container.querySelector('svg')).toHaveAttribute(
      'viewBox',
      `0 0 ${size.width} ${size.height}`,
    );
  });

  test('tient compte du rapport largeur / hauteur des cellules', () => {
    const { container } = renderWithUser(
      <BlobGrid slides={buildSlides(4)} columns={2} cellAspectRatio={2} />,
    );
    const size = gridDesignSize(resolveGridDimensions(4, 2), 2, gridInset(DEFAULT_GRID_SHAPE));
    expect(container.querySelector('svg')).toHaveAttribute(
      'viewBox',
      `0 0 ${size.width} ${size.height}`,
    );
  });

  test('élargit le dessin d’une demi-cellule quand les rangées sont décalées', () => {
    const { container } = renderWithUser(<BlobGrid slides={buildSlides(6)} columns={3} stagger />);
    const size = gridDesignSize(
      resolveGridDimensions(6, 3),
      1,
      gridInset(DEFAULT_GRID_SHAPE),
      true,
    );
    expect(container.querySelector('svg')).toHaveAttribute(
      'viewBox',
      `0 0 ${size.width} ${size.height}`,
    );
  });

  test('dessine un contour pour chaque blob d’une grille décalée', async () => {
    const { container } = renderWithUser(<BlobGrid slides={buildSlides(6)} columns={3} stagger />);
    await waitFor(() => {
      const paths = container.querySelectorAll('clipPath path');
      expect(paths).toHaveLength(6);
      paths.forEach((path) => {
        expect(path.getAttribute('d')).toMatch(/^M.*Z$/);
      });
    });
  });

  test('n’affiche que les blobs qui tiennent dans une grille fixe', () => {
    renderWithUser(<BlobGrid slides={buildSlides(10)} columns={2} rows={2} />);
    expect(screen.getAllByRole('img')).toHaveLength(4);
  });

  test('dessine un contour pour chaque blob', async () => {
    const { container } = renderWithUser(<BlobGrid slides={buildSlides(6)} columns={3} />);
    await waitFor(() => {
      const paths = container.querySelectorAll('clipPath path');
      expect(paths).toHaveLength(6);
      paths.forEach((path) => {
        expect(path.getAttribute('d')).toMatch(/^M.*Z$/);
      });
    });
  });

  test('ne redessine pas en boucle quand l’animation est coupée', async () => {
    const { container } = renderWithUser(<BlobGrid slides={buildSlides(4)} animated={false} />);
    const path = await waitFor(() => {
      const element = container.querySelector('clipPath path');
      expect(element?.getAttribute('d')).toMatch(/^M/);
      return element;
    });
    const first = path?.getAttribute('d');
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(path?.getAttribute('d')).toBe(first);
  });

  test('anime le contour par défaut', async () => {
    const { container } = renderWithUser(<BlobGrid slides={buildSlides(4)} />);
    const path = await waitFor(() => {
      const element = container.querySelector('clipPath path');
      expect(element?.getAttribute('d')).toMatch(/^M/);
      return element;
    });
    const first = path?.getAttribute('d');
    await waitFor(() => {
      expect(path?.getAttribute('d')).not.toBe(first);
    });
  });

  test('remplit un blob avec une image quand la diapositive en a une', async () => {
    const { container } = renderWithUser(
      <BlobGrid slides={[{ id: 'photo', label: 'Photo', imageUrl: '/photo.jpg' }]} />,
    );
    await waitFor(() => {
      expect(container.querySelector('image')).toHaveAttribute('href', '/photo.jpg');
    });
  });

  test('ne plante pas sans diapositive', () => {
    renderWithUser(<BlobGrid slides={[]} label="Vide" />);
    expect(screen.getByRole('group', { name: 'Vide' })).toBeInTheDocument();
  });
});
