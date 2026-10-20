import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';

/** Point d'entrée unique des tests de composants : rend l'élément et fournit un `user` configuré. */
export function renderWithUser(ui: ReactElement) {
  return { user: userEvent.setup(), ...render(ui) };
}
