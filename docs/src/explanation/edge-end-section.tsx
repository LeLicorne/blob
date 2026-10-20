import { traceEdgeEnd } from '@/commons/blob-geometry/sharp-outline';
import { offsetSeparatorPoint } from '@/commons/blob-geometry/offset-curve-point';
import { topEdgeY } from '@/commons/blob-geometry/waves';
import type { BlobGeometryParams, EdgeEndTrial } from '@/models/blob-geometry';
import { Calc, TipTitle } from '@docs/explanation/tip-parts';
import { fixed } from '@docs/explanation/format';
import { Hoverable } from '@docs/explanation/hoverable';
import { SectionFrame } from '@docs/explanation/section-frame';
import { pathFromPoints } from '@docs/explanation/svg-path';
import { useBlobParams } from '@docs/explanation/blob-params-context';
import { useTip } from '@docs/explanation/tooltip-provider';

const EXAMPLE_HEIGHT = 420;
const EXAMPLE_PITCH = 300;
const ZOOM = 3.2;
const ORIGIN_X = -50;
const ORIGIN_Y = 18;
const SHOWN_TRIALS = 6;
const toX = (x: number) => 40 + (x - ORIGIN_X) * ZOOM;
const toY = (y: number) => 20 + (y - ORIGIN_Y) * ZOOM;

function TrialExplanation({
  trial,
  index,
}: {
  readonly trial: EdgeEndTrial;
  readonly index: number;
}) {
  const delta = trial.next - trial.y;
  return (
    <>
      <TipTitle>Essai n°{index + 1}</TipTitle>
      <p>
        {index === 0
          ? "On part d'une hauteur de départ (10 % de la hauteur du blob)."
          : "On repart de la hauteur trouvée à l'essai précédent."}{' '}
        On regarde où le bord gauche passe à cette hauteur, puis à quelle hauteur la courbe du haut
        se trouve à cet endroit.
      </p>
      <Calc>
        {`hauteur testée   y = ${fixed(trial.y, 3)} px\nbord gauche à y  x = ${fixed(trial.x, 3)} px\ncourbe du haut   → ${fixed(trial.next, 3)} px\nchangement       = ${fixed(delta, 3)} px`}
      </Calc>
      <p>
        {Math.abs(delta) < 0.01
          ? 'Plus rien ne bouge : on a trouvé le coin.'
          : 'On recommence depuis la nouvelle hauteur.'}
      </p>
    </>
  );
}

function EdgeEndFigure({
  geometry,
  trials,
}: {
  readonly geometry: BlobGeometryParams;
  readonly trials: readonly EdgeEndTrial[];
}) {
  const tip = useTip();
  const topCurve = pathFromPoints(
    Array.from({ length: 91 }, (_, k): [number, number] => {
      const x = ORIGIN_X + k * 2;
      return [toX(x), toY(topEdgeY(geometry, x, 0))];
    }),
  );
  const leftCurve = pathFromPoints(
    Array.from({ length: 54 }, (_, k) => {
      const [x, y] = offsetSeparatorPoint(geometry, 0, ORIGIN_Y + k * 2, 0, 1);
      return [toX(x), toY(y)] as [number, number];
    }),
  );
  const shown = trials.slice(0, SHOWN_TRIALS);
  const trail = shown
    .map(
      (t, k) =>
        `${k ? 'L' : 'M'}${fixed(toX(t.x))} ${fixed(toY(t.y))}L${fixed(toX(t.x))} ${fixed(toY(t.next))}`,
    )
    .join('');
  const final = trials.at(-1);

  return (
    <svg
      viewBox="0 0 860 340"
      role="img"
      aria-label="Convergence vers l'intersection entre le bord gauche et la courbe du haut"
    >
      <path d={topCurve} fill="none" stroke="#38d9a9" strokeWidth={3} />
      <path d={leftCurve} fill="none" stroke="#4dabf7" strokeWidth={3} />
      <path d={trail} fill="none" stroke="#ffd43b" strokeWidth={1.5} strokeDasharray="4 4" />
      <text x={600} y={50} fill="#38d9a9" fontSize={14}>
        courbe du haut : y = topY(x)
      </text>
      <text x={70} y={300} fill="#4dabf7" fontSize={14}>
        bord gauche (courbe décalée)
      </text>
      {shown.map((trial, k) => (
        <circle
          key={k}
          cx={toX(trial.x)}
          cy={toY(trial.next)}
          r={7 - k * 0.6}
          fill="#ffd43b"
          stroke="#0e1116"
          strokeWidth={2}
          tabIndex={0}
          {...tip(<TrialExplanation trial={trial} index={k} />)}
        />
      ))}
      {final && (
        <circle
          cx={toX(final.x)}
          cy={toY(final.next)}
          r={11}
          fill="none"
          stroke="#fff"
          strokeWidth={2.5}
          tabIndex={0}
          {...tip(
            <>
              <TipTitle>Le coin</TipTitle>
              <p>
                Après 8 essais, le point ne bouge plus. C'est l'endroit exact où le bord gauche
                touche la courbe du haut.
              </p>
              <Calc>
                {`x = ${fixed(final.x, 2)} px\ny = ${fixed(final.next, 2)} px\nderniers changements : ${trials
                  .slice(-3)
                  .map((t) => fixed(Math.abs(t.next - t.y), 5))
                  .join(' → ')} px`}
              </Calc>
            </>,
          )}
        />
      )}
    </svg>
  );
}

/** Étape 4 : le bord vertical s'arrête là où il rencontre le bord horizontal, trouvé par essais. */
export function EdgeEndSection() {
  const { shape } = useBlobParams();
  const geometry: BlobGeometryParams = { ...shape, height: EXAMPLE_HEIGHT, pitch: EXAMPLE_PITCH };
  const trials = traceEdgeEnd(geometry, 0, 1, 'top', 0);
  const start = EXAMPLE_HEIGHT * 0.1;

  return (
    <SectionFrame
      id="haut-bas"
      badge="4"
      title="Où s'arrête le bord ? Un problème de poule et d'œuf"
      plain={
        <>
          Le haut du blob est une autre courbe ondulée. Le bord gauche descend jusqu'à la toucher.
          Mais l'endroit où il la touche dépend de la hauteur… qui dépend de l'endroit. Solution :
          on <b>essaie</b>, on regarde où on atterrit, on <b>réessaie</b> depuis là, et ainsi de
          suite. Après quelques essais le point ne bouge plus : c'est le coin.
        </>
      }
    >
      <figure>
        <EdgeEndFigure geometry={geometry} trials={trials} />
        <figcaption>
          Zoom sur le coin haut-gauche du blob n°0 (échelle ×3). Chaque point est un essai :
          survole-les pour voir la hauteur trouvée et de combien elle a changé.
        </figcaption>
      </figure>
      <div className="formula">
        {'y ← '}
        <Hoverable
          tip={
            <>
              <TipTitle>Un essai</TipTitle>
              <p>
                On prend la hauteur y, on trouve où le bord gauche se situe à cette hauteur (x(y)),
                puis on lit la hauteur de la courbe du haut à ce x.
              </p>
            </>
          }
        >
          topY( x(y) )
        </Hoverable>
        {'   répété '}
        <Hoverable
          tip={
            <>
              <TipTitle>Pourquoi 8 ?</TipTitle>
              <p>
                Les courbes sont peu penchées, donc chaque essai réduit l'erreur d'environ 10 fois.
                Après 3 ou 4 essais on est déjà à moins d'un centième de pixel ; 8 donne une grande
                marge de sécurité.
              </p>
            </>
          }
        >
          8 fois
        </Hoverable>
        {'\ndépart    y = '}
        <Hoverable
          tip={
            <>
              <TipTitle>Hauteur de départ</TipTitle>
              <p>
                Le haut du blob est à peu près à 10 % de sa hauteur ({EXAMPLE_HEIGHT} px dans cet
                exemple → {start} px). Le point de départ importe peu : il sert juste à démarrer.
              </p>
            </>
          }
        >
          10 % × H
        </Hoverable>
        {` = ${start} px\nécarts successifs (px) : ${trials
          .slice(0, SHOWN_TRIALS)
          .map((t) => fixed(Math.abs(t.next - t.y), 3))
          .join(' → ')}`}
      </div>
    </SectionFrame>
  );
}
