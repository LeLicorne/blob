import { screen, waitFor } from '@testing-library/react';
import { BlobCarousel } from '@/components/blob-carousel';
import { buildSlides } from '@/commons/tests/factories';
import { renderWithUser } from '@/commons/tests/render';

describe('BlobCarousel', () => {
  test('expose une région de carrousel nommée', () => {
    renderWithUser(<BlobCarousel slides={buildSlides(4)} labels={{ region: 'Réalisations' }} />);
    expect(screen.getByRole('group', { name: 'Réalisations' })).toHaveAttribute(
      'aria-roledescription',
      'carousel',
    );
  });

  test('propose un point de pagination par diapositive, le premier étant actif', () => {
    renderWithUser(<BlobCarousel slides={buildSlides(4)} />);
    expect(screen.getAllByRole('button', { name: /Go to slide/ })).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Go to slide 1' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  test('passe à la diapositive suivante au clic sur « Next »', async () => {
    const { user } = renderWithUser(<BlobCarousel slides={buildSlides(4)} />);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute(
        'aria-current',
        'true',
      );
    });
  });

  test('revient à la dernière diapositive depuis la première avec « Previous »', async () => {
    const { user } = renderWithUser(<BlobCarousel slides={buildSlides(4)} />);
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Go to slide 4' })).toHaveAttribute(
        'aria-current',
        'true',
      );
    });
  });

  test('se déplace avec les flèches du clavier', async () => {
    const { user } = renderWithUser(<BlobCarousel slides={buildSlides(4)} />);
    screen.getByRole('button', { name: 'Go to slide 1' }).focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute(
        'aria-current',
        'true',
      );
    });
  });

  test('atteint directement la diapositive choisie par un point', async () => {
    const { user } = renderWithUser(<BlobCarousel slides={buildSlides(8)} />);
    await user.click(screen.getByRole('button', { name: 'Go to slide 7' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Go to slide 7' })).toHaveAttribute(
        'aria-current',
        'true',
      );
    });
  });

  test('prévient quand la diapositive centrée change', async () => {
    const onActiveIndexChange = vi.fn();
    const { user } = renderWithUser(
      <BlobCarousel slides={buildSlides(4)} onActiveIndexChange={onActiveIndexChange} />,
    );
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => {
      expect(onActiveIndexChange).toHaveBeenCalledWith(1);
    });
  });

  test('masque les commandes quand on le demande', () => {
    renderWithUser(<BlobCarousel slides={buildSlides(4)} showControls={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('dessine un contour pour chaque blob visible', async () => {
    const { container } = renderWithUser(<BlobCarousel slides={buildSlides(4)} />);
    await waitFor(() => {
      const paths = container.querySelectorAll('clipPath path');
      expect(paths.length).toBeGreaterThanOrEqual(3);
      paths.forEach((path) => {
        expect(path.getAttribute('d')).toMatch(/^M.*Z$/);
      });
    });
  });

  test('remplit un blob avec une image quand la diapositive en a une', async () => {
    const { container } = renderWithUser(
      <BlobCarousel slides={[{ id: 'photo', label: 'Photo', imageUrl: '/photo.jpg' }]} />,
    );
    await waitFor(() => {
      expect(container.querySelector('image')).toHaveAttribute('href', '/photo.jpg');
    });
  });

  test('ne plante pas sans diapositive', () => {
    renderWithUser(<BlobCarousel slides={[]} />);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });
});
