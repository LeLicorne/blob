import type { ReactNode } from 'react';
import type { BlobShapeConfig, WaveKey } from '@/models/blob-geometry';
import { Calc, TipTitle } from '@docs/explanation/tip-parts';
import { fixed } from '@docs/explanation/format';

/** Présentation d'une des quatre vagues : nom, couleur et explication détaillée. */
export interface WaveInfo {
  readonly name: string;
  readonly color: string;
  readonly tip: ReactNode;
}

const TWO_PI = 2 * Math.PI;

/** Description des quatre vagues d'un séparateur, calculée avec les réglages courants. */
export function buildWaveInfo(shape: Readonly<BlobShapeConfig>): Record<WaveKey, WaveInfo> {
  return {
    big: {
      name: 'Grande vague (fixe)',
      color: '#4dabf7',
      tip: (
        <>
          <TipTitle>Grande vague — fixe</TipTitle>
          <p>
            Donne sa « personnalité » à la ligne. Chaque séparateur a sa propre phase, donc sa
            propre forme : c'est ce qui rend les blobs tous différents.
          </p>
          <Calc>
            {`amplitude = sepAmp = ${shape.sepAmp} px\nfréquence = 0,012  →  longueur d'onde\n= 2π ÷ 0,012 ≈ ${fixed(TWO_PI / 0.012, 0)} px\nphase = i × 1,7`}
          </Calc>
        </>
      ),
    },
    mid: {
      name: 'Vague moyenne (fixe)',
      color: '#38d9a9',
      tip: (
        <>
          <TipTitle>Vague moyenne — fixe</TipTitle>
          <p>
            Plus petite et plus serrée : elle casse la régularité de la grande vague pour que ça ne
            ressemble pas à une sinusoïde parfaite.
          </p>
          <Calc>
            {`amplitude = 0,4 × sepAmp = ${fixed(shape.sepAmp * 0.4)} px\nlongueur d'onde = 2π ÷ 0,031 ≈ ${fixed(TWO_PI / 0.031, 0)} px\nphase = i × 2,9`}
          </Calc>
        </>
      ),
    },
    liveA: {
      name: 'Petite vague vivante A',
      color: '#ff6b6b',
      tip: (
        <>
          <TipTitle>Petite vague vivante A — bouge</TipTitle>
          <p>
            Une ondulation minuscule qui glisse le long de la ligne : c'est elle qui fait « respirer
            » le contour.
          </p>
          <Calc>
            {`amplitude = liveAmp = ${shape.liveAmp} px\nvitesse = 0,0006 × 3 = 0,0018 rad/ms\n→ un cycle complet toutes les ${fixed(TWO_PI / (shape.liveSpeed * 3) / 1000)} s\nlongueur d'onde ≈ ${fixed(TWO_PI / 0.02, 0)} px`}
          </Calc>
        </>
      ),
    },
    liveB: {
      name: 'Petite vague vivante B',
      color: '#ffa94d',
      tip: (
        <>
          <TipTitle>Petite vague vivante B — bouge</TipTitle>
          <p>
            Encore plus petite, et elle glisse <b>dans l'autre sens</b> (signe moins). Les deux
            vagues vivantes se croisent : le mouvement ne se répète jamais vraiment.
          </p>
          <Calc>
            {`amplitude = 0,6 × liveAmp = ${fixed(shape.liveAmp * 0.6)} px\nvitesse = −0,0006 × 2 = −0,0012 rad/ms\n→ un cycle toutes les ${fixed(TWO_PI / (shape.liveSpeed * 2) / 1000)} s\nlongueur d'onde ≈ ${fixed(TWO_PI / 0.047, 0)} px`}
          </Calc>
        </>
      ),
    },
  };
}
