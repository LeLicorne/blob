import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

class ResizeObserverStub implements ResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(target: Element): void {
    const contentRect = { width: 800, height: 500 } as DOMRectReadOnly;
    queueMicrotask(() => {
      this.callback([{ target, contentRect } as ResizeObserverEntry], this);
    });
  }

  unobserve(): void {}
  disconnect(): void {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverStub);
vi.stubGlobal(
  'matchMedia',
  vi.fn((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
);

HTMLElement.prototype.setPointerCapture = vi.fn();

afterEach(() => {
  cleanup();
});
