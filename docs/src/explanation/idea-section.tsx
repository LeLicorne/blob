import { separatorDeviation } from '@/commons/blob-geometry/waves';
import { Calc, TipTitle } from '@docs/explanation/tip-parts';
import { Hoverable } from '@docs/explanation/hoverable';
import { pathFromPoints, sampleVertical } from '@docs/explanation/svg-path';
import { SectionFrame } from '@docs/explanation/section-frame';
import { useBlobParams } from '@docs/explanation/blob-params-context';
import { useAnimationClock } from '@docs/explanation/use-animation-clock';
import { useTip } from '@docs/explanation/tooltip-provider';

const WIDTH = 860;
const HEIGHT = 360;
const PITCH = 215;
const ORIGIN_X = (WIDTH - 3 * PITCH) / 2;
const ZONE_COLORS = ['#ff6b6b', '#ffd43b', '#4dabf7'] as const;
const SEPARATORS = [0, 1, 2, 3] as const;

function IdeaFigure() {
  const clock = useAnimationClock();
  const { shape } = useBlobParams();
  const tip = useTip();
  const xAt = (i: number) => (y: number) =>
    ORIGIN_X + i * PITCH + separatorDeviation(shape, i, y, clock);
  const line = (i: number) => sampleVertical(xAt(i), 0, HEIGHT, 8);

  return (
    <svg
      viewBox="0 0 860 400"
      role="img"
      aria-label="Trois zones colorées délimitées par quatre courbes"
    >
      <g transform="translate(0 20)">
        {ZONE_COLORS.map((color, i) => {
          const outline = `${pathFromPoints(line(i))}${pathFromPoints(line(i + 1).reverse()).replace('M', 'L')}Z`;
          return (
            <g key={color}>
              <path
                className="zone"
                d={outline}
                fill={color}
                fillOpacity={0.5}
                {...tip(
                  <>
                    <TipTitle>Blob n°{i + 1}</TipTitle>
                    <p>
                      C'est tout ce qui se trouve{' '}
                      <b>
                        entre le séparateur S{i} et le séparateur S{i + 1}
                      </b>
                      . Il n'a pas de contour à lui : sa gauche est S{i}, sa droite est S{i + 1}.
                    </p>
                    <Calc>{`bord gauche = S${i}\nbord droit  = S${i + 1}`}</Calc>
                  </>,
                )}
              />
              <text
                x={(xAt(i)(HEIGHT / 2) + xAt(i + 1)(HEIGHT / 2)) / 2}
                y={HEIGHT / 2}
                textAnchor="middle"
                fill="#fff"
                fontSize={15}
                fontWeight={600}
                pointerEvents="none"
              >
                Blob n°{i + 1}
              </text>
            </g>
          );
        })}
        {SEPARATORS.map((i) => {
          const d = pathFromPoints(line(i));
          return (
            <g key={i}>
              <path d={d} fill="none" stroke="#e8ecf2" strokeWidth={3} strokeLinecap="round" />
              <path
                d={d}
                fill="none"
                stroke="transparent"
                strokeWidth={18}
                {...tip(
                  <>
                    <TipTitle>Séparateur S{i}</TipTitle>
                    <p>
                      Une courbe où, pour chaque hauteur <i>y</i>, on calcule une position <i>x</i>{' '}
                      : presque verticale, mais qui ondule.
                    </p>
                    {i > 0 && i < 3 ? (
                      <p>
                        Cette ligne est <b>partagée</b> : c'est le bord droit du blob n°{i} et le
                        bord gauche du blob n°{i + 1}. C'est ce qui les fait s'emboîter
                        parfaitement.
                      </p>
                    ) : (
                      <p>
                        Cette ligne est le bord extérieur d'un seul blob (celui d'après ou d'avant,
                        qui continue hors du schéma).
                      </p>
                    )}
                    <Calc>{`x = ${i} × pas + vagues(y)\n  = ${i} × ${PITCH} + vagues(y)`}</Calc>
                  </>,
                )}
              />
              <text x={xAt(i)(0)} y={-8} textAnchor="middle" fill="#e8ecf2" fontSize={14}>
                S{i}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** Étape 1 : un blob est la zone entre deux courbes séparatrices partagées. */
export function IdeaSection() {
  return (
    <SectionFrame
      id="idee"
      badge="1"
      title="On ne dessine pas des blobs, on dessine des frontières"
      plain={
        <>
          Imagine des feuilles de papier découpées côte à côte. Si tu découpes chaque feuille
          séparément, les bords ne s'épouseront jamais bien. Si au contraire tu découpes{' '}
          <i>une seule ligne ondulée</i> et que tu t'en sers comme bord droit de la feuille de
          gauche <i>et</i> bord gauche de la feuille de droite, elles s'emboîtent forcément.
        </>
      }
    >
      <p>
        C'est exactement le principe : on trace des{' '}
        <Hoverable
          tone="sep"
          tip={
            <>
              <TipTitle>Séparateur</TipTitle>
              <p>
                Une courbe presque verticale, qui ondule légèrement. On en a un par numéro : S0, S1,
                S2…
              </p>
              <Calc>{'x = f(y)\nPour chaque hauteur y, une position x.'}</Calc>
            </>
          }
        >
          séparateurs
        </Hoverable>
        , et le blob n°<i>i</i> est simplement la zone entre le séparateur <i>i</i> et le séparateur{' '}
        <i>i+1</i>.
      </p>
      <figure>
        <IdeaFigure />
        <figcaption>
          Survole une zone ou une ligne. Tout bouge doucement : les lignes ondulent en temps réel.
          (Ici haut et bas sont droits et sans espace, pour ne montrer que l'idée.)
        </figcaption>
      </figure>
    </SectionFrame>
  );
}
