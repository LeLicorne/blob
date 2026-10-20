import { separatorDeviation } from '@/commons/blob-geometry/waves';
import { curveSlope, offsetCurvePoint } from '@/commons/blob-geometry/offset-curve-point';
import { Calc, TipTitle } from '@docs/explanation/tip-parts';
import { fixed } from '@docs/explanation/format';
import { Hoverable } from '@docs/explanation/hoverable';
import { RangeControl } from '@docs/explanation/range-control';
import { SectionFrame } from '@docs/explanation/section-frame';
import { pathFromPoints, sampleVertical } from '@docs/explanation/svg-path';
import { useBlobParams } from '@docs/explanation/blob-params-context';
import { useTip } from '@docs/explanation/tooltip-provider';
import { useAnimationClock } from '@docs/explanation/use-animation-clock';

const HEIGHT = 360;
const CENTER_X = 430;
const EXAGGERATION = 2;
const BAR_HEIGHTS = [30, 90, 150, 210, 270, 330];

function PerpendicularExplanation({
  y,
  slope,
  gap,
}: {
  readonly y: number;
  readonly slope: { readonly dxdy: number; readonly length: number };
  readonly gap: number;
}) {
  const half = gap / 2;
  const shiftX = half / slope.length;
  const shiftY = (half * -slope.dxdy) / slope.length;
  return (
    <>
      <TipTitle>Perpendiculaire à y = {y} px</TipTitle>
      <p>
        La ligne penche ici de {fixed(slope.dxdy * 100, 0)} % (pour 100 px vers le bas, elle se
        décale de {fixed(slope.dxdy * 100, 0)} px sur le côté). On décale donc en travers de cette
        pente.
      </p>
      <Calc>
        {`pente dx/dy      = ${fixed(slope.dxdy, 3)}\nlongueur √(1+pente²) = ${fixed(slope.length, 3)}\ndécalage (demi-espace ${half} px) :\n  vers x : ${half} ÷ ${fixed(slope.length, 3)} = ${fixed(shiftX)} px\n  vers y : ${fixed(shiftY)} px\ndistance entre les 2 bords = ${gap} px`}
      </Calc>
      <p>
        Un décalage simplement horizontal de {half} px de chaque côté ne donnerait en réalité que{' '}
        <b>{fixed(gap / slope.length)} px</b> d'écart ici, au lieu de {gap}.
      </p>
    </>
  );
}

function GapFigure() {
  const clock = useAnimationClock();
  const { shape } = useBlobParams();
  const tip = useTip();
  const xAt = (y: number) => CENTER_X + separatorDeviation(shape, 1, y, clock) * EXAGGERATION;
  const half = shape.gap / 2;
  const edge = (direction: 1 | -1) =>
    pathFromPoints(
      sampleVertical((y) => y, 0, HEIGHT, 4).map(([, y]) =>
        offsetCurvePoint(xAt, y, half * direction),
      ),
    );

  return (
    <svg viewBox="0 0 860 420" role="img" aria-label="Deux copies décalées d'une même courbe">
      <g transform="translate(0 20)">
        <path d={edge(-1)} fill="none" stroke="#4dabf7" strokeWidth={3.5} />
        <path d={edge(1)} fill="none" stroke="#ffa94d" strokeWidth={3.5} />
        <path
          d={pathFromPoints(sampleVertical(xAt, 0, HEIGHT, 4))}
          fill="none"
          stroke="#566072"
          strokeDasharray="3 6"
        />
        {BAR_HEIGHTS.map((y) => {
          const [x1, y1] = offsetCurvePoint(xAt, y, -half);
          const [x2, y2] = offsetCurvePoint(xAt, y, half);
          return (
            <g key={y}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#ffd43b"
                strokeWidth={3}
                strokeLinecap="round"
              />
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="transparent"
                strokeWidth={26}
                strokeLinecap="round"
                {...tip(
                  <PerpendicularExplanation y={y} slope={curveSlope(xAt, y)} gap={shape.gap} />,
                )}
              />
              <circle cx={xAt(y)} cy={y} r={3.5} fill="#fff" />
            </g>
          );
        })}
        <text x={CENTER_X - 190} y={382} fill="#4dabf7" fontSize={14} textAnchor="middle">
          bord droit du blob de gauche
        </text>
        <text x={CENTER_X + 190} y={382} fill="#ffa94d" fontSize={14} textAnchor="middle">
          bord gauche du blob de droite
        </text>
      </g>
    </svg>
  );
}

function GapFormula() {
  const { shape } = useBlobParams();
  return (
    <div className="formula">
      {'pente     = '}
      <Hoverable
        tip={
          <>
            <TipTitle>La pente</TipTitle>
            <p>
              De combien la ligne se décale sur le côté quand on descend d'un pixel. Calculée en
              comparant la position un pixel plus bas et un pixel plus haut, puis en divisant par 2.
            </p>
          </>
        }
      >
        dx/dy
      </Hoverable>
      {' = (x(y+1) − x(y−1)) ÷ 2\nlongueur  = '}
      <Hoverable
        tip={
          <>
            <TipTitle>Normalisation</TipTitle>
            <p>
              Théorème de Pythagore : on obtient la longueur du petit vecteur (pente, 1) pour
              pouvoir le ramener à une longueur de 1. Sans ça, le décalage serait trop grand sur les
              parties penchées.
            </p>
          </>
        }
      >
        √(1 + pente²)
      </Hoverable>
      {'\npoint de la courbe décalé de ± '}
      <Hoverable
        tip={
          <>
            <TipTitle>Demi-espace</TipTitle>
            <p>
              Chaque blob prend la moitié de l'espace de son côté : {shape.gap / 2} +{' '}
              {shape.gap / 2} = {shape.gap} px entre les deux.
            </p>
          </>
        }
      >
        gap/2 = {shape.gap / 2} px
      </Hoverable>
      {"\n   x' = x + (gap/2) ÷ longueur\n   y' = y − (gap/2) × pente ÷ longueur"}
    </div>
  );
}

/** Étape 3 : l'espace entre deux blobs reste constant grâce à un décalage perpendiculaire. */
export function ConstantGapSection() {
  const { shape, setShapeValue } = useBlobParams();
  return (
    <SectionFrame
      id="espace"
      badge="3"
      title="L'espace constant : décaler « perpendiculairement »"
      plain={
        <>
          Pour laisser un espace entre deux blobs, on ne colle pas la ligne telle quelle : on la
          recopie <b>un peu à gauche</b> (bord du blob de gauche) et <b>un peu à droite</b> (bord du
          blob de droite). Piège : si la ligne est penchée, décaler « tout droit vers la droite »
          rapproche en réalité les deux bords. Il faut décaler <i>en travers de la ligne</i>, comme
          un rail à largeur constante.
        </>
      }
    >
      <figure>
        <GapFigure />
        <div className="controls">
          <RangeControl
            label="Espace voulu"
            value={shape.gap}
            min={6}
            max={60}
            unit=" px"
            onChange={(value) => {
              setShapeValue('gap', value);
            }}
          />
        </div>
        <figcaption>
          Bleu = bord droit du blob de gauche. Orange = bord gauche du blob de droite. Les petits
          traits jaunes sont les « perpendiculaires » : survole-les pour voir les calculs à cette
          hauteur. (La ligne est agrandie 2 fois à l'horizontale pour que les pentes se voient.)
        </figcaption>
      </figure>
      <GapFormula />
    </SectionFrame>
  );
}
