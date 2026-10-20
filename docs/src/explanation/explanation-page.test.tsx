import { act, fireEvent, screen, within } from '@testing-library/react';
import { renderWithUser } from '@/commons/tests/render';
import { ExplanationPage } from '@docs/explanation/explanation-page';

describe('ExplanationPage', () => {
  test('présente les sept étapes et les chiffres clés', () => {
    renderWithUser(<ExplanationPage />);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(9);
    expect(
      screen.getByRole('heading', { name: /On ne dessine pas des blobs/ }),
    ).toBeInTheDocument();
  });

  test('propose un lien de navigation par étape', () => {
    renderWithUser(<ExplanationPage />);
    const navigation = screen.getByRole('navigation', { name: /Étapes/ });
    expect(within(navigation).getAllByRole('link')).toHaveLength(9);
  });

  test('ouvre une explication au survol d’une carte de chiffres', async () => {
    const { user } = renderWithUser(<ExplanationPage />);
    await user.hover(screen.getByRole('button', { name: /Espace entre deux blobs/ }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(/Distance perpendiculaire/);
  });

  test('ouvre une explication au focus clavier d’un mot souligné', () => {
    renderWithUser(<ExplanationPage />);
    act(() => {
      screen.getByText('souligné en pointillés').focus();
    });
    expect(screen.getByRole('tooltip')).toHaveTextContent(/Exactement ça/);
  });

  test('met à jour la formule quand on déplace le curseur de forme', () => {
    renderWithUser(<ExplanationPage />);
    fireEvent.change(screen.getByRole('slider', { name: /Forme/ }), { target: { value: '27' } });
    expect(screen.getByText(/27 · sin\(0,012/)).toBeInTheDocument();
  });
});
