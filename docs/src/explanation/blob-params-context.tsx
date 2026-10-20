import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import type { BlobShapeConfig } from '@/models/blob-geometry';
import { DEFAULT_BLOB_SHAPE } from '@/const/blob-carousel';

interface BlobParamsValue {
  readonly shape: BlobShapeConfig;
  readonly setShapeValue: (key: 'sepAmp' | 'liveAmp' | 'gap', value: number) => void;
}

const BlobParamsContext = createContext<BlobParamsValue | null>(null);

/** Partage entre les schémas les réglages modifiés par les curseurs (forme, mouvement, espace). */
export function BlobParamsProvider({ children }: { readonly children: ReactNode }) {
  const [shape, setShape] = useState<BlobShapeConfig>(DEFAULT_BLOB_SHAPE);
  const value = useMemo<BlobParamsValue>(
    () => ({
      shape,
      setShapeValue: (key, next) => {
        setShape((previous) => ({ ...previous, [key]: next }));
      },
    }),
    [shape],
  );
  return <BlobParamsContext value={value}>{children}</BlobParamsContext>;
}

/** Réglages courants des blobs de la page, et leur modificateur. */
export function useBlobParams(): BlobParamsValue {
  const value = useContext(BlobParamsContext);
  if (!value) throw new Error('useBlobParams must be used inside BlobParamsProvider');
  return value;
}
