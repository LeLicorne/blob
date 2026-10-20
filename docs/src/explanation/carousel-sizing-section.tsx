import { useState } from 'react';
import { clamp } from '@/commons/clamp';
import { blobPitchForWidth } from '@/commons/carousel-layout';
import { DEFAULT_EASE } from '@/const/blob-carousel';
import { Calc, TipTitle } from '@docs/explanation/tip-parts';
import { fixed } from '@docs/explanation/format';
import { Hoverable } from '@docs/explanation/hoverable';
import { SectionFrame } from '@docs/explanation/section-frame';
import { pathFromPoints } from '@docs/explanation/svg-path';
import { useBlobParams } from '@docs/explanation/blob-params-context';
import { useTip } from '@docs/explanation/tooltip-provider';

const MIN_SCREEN = 320;
const MAX_SCREEN = 1440;
const PLOT_X = 60;
const PLOT_WIDTH = 740;
const PLOT_Y = 20;
const PLOT_HEIGHT = 130;
const SCREEN_COLORS = [
  '#ff6b6b',
  '#ffa94d',
  '#ffd43b',
  '#69db7c',
  '#38d9a9',
  '#4dabf7',
  '#9775fa',
  '#f783ac',
];
const MARKS = [
  { width: 390, name: 'Téléphone' },
  { width: 768, name: 'Tablette' },
  { width: 1280, name: 'Ordinateur' },
] as const;
const FRAMES = 61;
const toPlotX = (width: number) =>
  PLOT_X + ((width - MIN_SCREEN) / (MAX_SCREEN - MIN_SCREEN)) * PLOT_WIDTH;
const toPlotY = (pitch: number) => PLOT_Y + PLOT_HEIGHT - ((pitch - 200) / 160) * PLOT_HEIGHT;

function widthFromPointer(clientX: number, rect: DOMRect): number {
  const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
  return Math.round((MIN_SCREEN + ratio * (MAX_SCREEN - MIN_SCREEN)) / 10) * 10;
}

function PitchExplanation({ width }: { readonly width: number }) {
  const pitch = blobPitchForWidth(width);
  const raw = width * 0.68;
  return (
    <>
      <TipTitle>Écran de {width} px</TipTitle>
      <p>
        {raw < 230
          ? 'Très petit écran : on garde quand même 230 px minimum.'
          : raw > 340
            ? 'Grand écran : le blob est plafonné à 340 px.'
            : "Zone proportionnelle : 68 % de la largeur de l'écran."}
      </p>
      <Calc>{`${width} × 0,68 = ${fixed(raw, 0)} px\nbloqué entre 230 et 340 → ${fixed(pitch, 0)} px\nblobs visibles ≈ ${fixed(width / pitch, 1)}`}</Calc>
      <p>La courbe ne descend jamais : le blob ne rétrécit pas quand l'écran grandit.</p>
    </>
  );
}

function PitchCurve({
  width,
  onSelect,
}: {
  readonly width: number;
  readonly onSelect: (width: number) => void;
}) {
  const tip = useTip();
  const curve = pathFromPoints(
    Array.from({ length: (MAX_SCREEN - MIN_SCREEN) / 10 + 1 }, (_, k): [number, number] => {
      const w = MIN_SCREEN + k * 10;
      return [toPlotX(w), toPlotY(blobPitchForWidth(w))];
    }),
  );
  return (
    <g>
      <path d={curve} fill="none" stroke="#4dabf7" strokeWidth={3.5} />
      {[230, 340].map((pitch) => (
        <g key={pitch}>
          <line
            x1={PLOT_X}
            x2={PLOT_X + PLOT_WIDTH}
            y1={toPlotY(pitch)}
            y2={toPlotY(pitch)}
            stroke="#2b323d"
            strokeDasharray="4 5"
          />
          <text x={PLOT_X - 8} y={toPlotY(pitch) + 4} fill="#8a94a3" fontSize={12} textAnchor="end">
            {pitch} px
          </text>
        </g>
      ))}
      {MARKS.map(({ width: markWidth, name }) => {
        const pitch = blobPitchForWidth(markWidth);
        return (
          <g key={name}>
            <circle
              cx={toPlotX(markWidth)}
              cy={toPlotY(pitch)}
              r={7}
              fill="#ffd43b"
              stroke="#0e1116"
              strokeWidth={2}
              tabIndex={0}
              {...tip(
                <>
                  <TipTitle>
                    {name} ({markWidth} px)
                  </TipTitle>
                  <p>
                    Largeur d'un blob : <b>{fixed(pitch, 0)} px</b>.
                  </p>
                  <Calc>{`${markWidth} × 0,68 = ${fixed(markWidth * 0.68, 0)} px\n→ borné entre 230 et 340 → ${fixed(pitch, 0)} px`}</Calc>
                </>,
              )}
            />
            <text
              x={toPlotX(markWidth)}
              y={toPlotY(pitch) - 14}
              fill="#ffd43b"
              fontSize={13}
              textAnchor="middle"
            >
              {name.toLowerCase()}
            </text>
          </g>
        );
      })}
      <line
        x1={toPlotX(width)}
        x2={toPlotX(width)}
        y1={PLOT_Y}
        y2={PLOT_Y + PLOT_HEIGHT}
        stroke="#fff"
        strokeOpacity={0.5}
      />
      <rect
        x={PLOT_X}
        y={PLOT_Y - 10}
        width={PLOT_WIDTH}
        height={PLOT_HEIGHT + 20}
        fill="transparent"
        onClick={(event) => {
          onSelect(widthFromPointer(event.clientX, event.currentTarget.getBoundingClientRect()));
        }}
        {...tip((pointer) => {
          const rect = pointer?.element.getBoundingClientRect();
          const hovered = pointer && rect ? widthFromPointer(pointer.clientX, rect) : width;
          return <PitchExplanation width={hovered} />;
        })}
      />
      <text
        x={PLOT_X + PLOT_WIDTH / 2}
        y={PLOT_Y + PLOT_HEIGHT + 30}
        fill="#8a94a3"
        fontSize={12}
        textAnchor="middle"
      >
        largeur d'écran → (clique sur la courbe pour choisir)
      </text>
    </g>
  );
}

function ScreenSketch({ width, gap }: { readonly width: number; readonly gap: number }) {
  const tip = useTip();
  const pitch = blobPitchForWidth(width);
  const scale = Math.min(1, 780 / width);
  const left = (860 - width * scale) / 2;
  const peek = Math.max(0, (width - pitch) / 2 - gap / 2);
  const height = 110;
  return (
    <g transform="translate(0 190)">
      <clipPath id="screen-sketch-clip">
        <rect x={left} y={0} width={width * scale} height={height} />
      </clipPath>
      <g clipPath="url(#screen-sketch-clip)">
        {Array.from({ length: 9 }, (_, k) => k - 4).map((i) => (
          <rect
            key={i}
            x={left + (width / 2 + (i - 0.5) * pitch + gap / 2) * scale}
            y={8}
            width={(pitch - gap) * scale}
            height={height - 16}
            rx={26 * scale * 2}
            fill={SCREEN_COLORS[(i + 8) % 8]}
            fillOpacity={i === 0 ? 0.95 : 0.6}
            tabIndex={0}
            {...tip(
              i === 0 ? (
                <>
                  <TipTitle>Blob central</TipTitle>
                  <p>
                    Largeur {fixed(pitch, 0)} px = {fixed((pitch / width) * 100, 0)} % de l'écran.
                  </p>
                </>
              ) : (
                <>
                  <TipTitle>Blob voisin ({i < 0 ? 'gauche' : 'droite'})</TipTitle>
                  <p>
                    {Math.abs(i) === 1
                      ? "Visible en partie sur le bord : c'est ce qui invite à glisser."
                      : "Hors de l'écran ou presque."}
                  </p>
                </>
              ),
            )}
          />
        ))}
      </g>
      <rect
        x={left}
        y={0}
        width={width * scale}
        height={height}
        rx={8}
        fill="none"
        stroke="#e8ecf2"
        strokeWidth={2}
      />
      <text x={430} y={height + 28} textAnchor="middle" fill="#c3cad5" fontSize={14}>
        {`Blob central : ${fixed(pitch, 0)} px · voisins visibles de chaque côté : ≈ ${fixed(peek, 0)} px`}
      </text>
    </g>
  );
}

function InertiaFigure() {
  const tip = useTip();
  const barWidth = PLOT_WIDTH / FRAMES;
  return (
    <svg viewBox="0 0 860 240" role="img" aria-label="Distance restante au fil des images">
      {Array.from({ length: FRAMES }, (_, n) => {
        const remaining = (1 - DEFAULT_EASE) ** n;
        const height = remaining * 170;
        return (
          <rect
            key={n}
            x={PLOT_X + n * barWidth}
            y={190 - height}
            width={barWidth - 2}
            height={Math.max(height, 1)}
            rx={2}
            fill="#38d9a9"
            fillOpacity={0.35 + 0.6 * remaining}
            tabIndex={0}
            {...tip(
              <>
                <TipTitle>Image n°{n}</TipTitle>
                <p>
                  {n === 0
                    ? 'Départ : tout le trajet reste à faire.'
                    : `Après ${n} image${n > 1 ? 's' : ''} (${fixed((n / 60) * 1000, 0)} ms), il reste ${fixed(remaining * 100, 1)} % du trajet.`}
                </p>
                <Calc>{`reste = 0,9^${n} = ${fixed(remaining * 100, 2)} %`}</Calc>
                {n === 60 && (
                  <p>Au bout d'une seconde, le mouvement est quasiment terminé (il reste 0,2 %).</p>
                )}
              </>,
            )}
          />
        );
      })}
      {[
        [0, '0 s'],
        [30, '0,5 s'],
        [60, '1 s'],
      ].map(([n, label]) => (
        <text
          key={label}
          x={PLOT_X + Number(n) * barWidth + barWidth / 2}
          y={214}
          fill="#8a94a3"
          fontSize={12}
          textAnchor="middle"
        >
          {label}
        </text>
      ))}
      <text x={70} y={30} fill="#c3cad5" fontSize={14}>
        100 % du trajet
      </text>
    </svg>
  );
}

/** Étape 7 : taille du blob selon l'écran, inertie du glissement et boucle infinie. */
export function CarouselSizingSection() {
  const { shape } = useBlobParams();
  const [width, setWidth] = useState(390);

  return (
    <SectionFrame
      id="carrousel"
      badge="7"
      title="Le carrousel : taille, glissement et boucle infinie"
      plain={
        <>
          Trois règles simples. <b>La taille</b> du blob suit la largeur de l'écran mais ne rétrécit
          jamais quand l'écran grandit. <b>Le glissement</b> avance à chaque image d'une fraction de
          la distance restante (ça ralentit tout seul, comme une voiture qui freine).{' '}
          <b>La boucle</b> : les couleurs sont lues « modulo 8 », donc après le dernier on retombe
          sur le premier, à l'infini.
        </>
      }
    >
      <h3>Largeur du blob selon l'écran</h3>
      <figure>
        <svg
          viewBox="0 0 860 345"
          role="img"
          aria-label="Largeur du blob en fonction de la largeur d'écran"
        >
          <PitchCurve width={width} onSelect={setWidth} />
          <ScreenSketch width={width} gap={shape.gap} />
        </svg>
        <div className="controls">
          <label>
            Largeur d'écran
            <input
              type="range"
              min={MIN_SCREEN}
              max={MAX_SCREEN}
              step={10}
              value={width}
              onChange={(event) => {
                setWidth(Number(event.target.value));
              }}
            />
            <output>{width} px</output>
          </label>
        </div>
        <figcaption>
          Haut : la courbe de la taille du blob. Bas : schéma de ce qu'on voit à l'écran (ce qui
          dépasse du cadre est coupé). Le blob central reste large, les voisins dépassent sur les
          côtés.
        </figcaption>
      </figure>
      <h3>Le glissement qui ralentit</h3>
      <figure>
        <InertiaFigure />
        <figcaption>
          Chaque barre = une image (à 60 images par seconde). Hauteur = la part du trajet qu'il
          reste à parcourir.
        </figcaption>
      </figure>
      <div className="formula">
        {'à chaque image :  '}
        <Hoverable
          tip={
            <>
              <TipTitle>Inertie</TipTitle>
              <p>
                On avance de 10 % de la distance qui reste. Au début la distance est grande donc on
                avance vite ; plus on approche, plus les pas rapetissent. Résultat : un freinage
                naturel, sans courbe d'animation à définir.
              </p>
            </>
          }
        >
          position += (cible − position) × 0,1
        </Hoverable>
        {'\narrêt net quand  |cible − position| < 0,0005  '}
        <Hoverable
          tip={
            <>
              <TipTitle>Pourquoi ?</TipTitle>
              <p>
                Sans ce seuil, la position approcherait la cible sans jamais l'atteindre. Sous
                0,0005 blob d'écart (soit moins d'un dixième de pixel), on se cale pile dessus.
              </p>
            </>
          }
        >
          (?)
        </Hoverable>
        {'\ncouleur du blob i :  '}
        <Hoverable
          tip={
            <>
              <TipTitle>Boucle infinie</TipTitle>
              <p>
                « i % 8 » donne le reste de la division par 8. Le « +8 » puis « %8 » deux fois sert
                à gérer les nombres négatifs (si on glisse vers la gauche, i devient −1, −2…). Il
                n'y a donc pas de début ni de fin.
              </p>
            </>
          }
        >
          couleurs[ ((i % 8) + 8) % 8 ]
        </Hoverable>
        {'\nblobs dessinés :  '}
        <Hoverable
          tip={
            <>
              <TipTitle>Pourquoi ne pas tout dessiner ?</TipTitle>
              <p>
                Le carrousel est infini : on ne calcule les contours que des blobs qui touchent
                l'écran, et on supprime ceux qui sortent. Peu importe la durée du glissement, il n'y
                en a jamais plus d'une dizaine.
              </p>
            </>
          }
        >
          seulement les visibles (+ 1 de marge)
        </Hoverable>
      </div>
    </SectionFrame>
  );
}
