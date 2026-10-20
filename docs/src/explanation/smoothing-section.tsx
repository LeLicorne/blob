import { useState } from 'react';
import { clamp } from '@/commons/clamp';
import { Calc, TipTitle } from '@docs/explanation/tip-parts';
import { fixed } from '@docs/explanation/format';
import { Hoverable } from '@docs/explanation/hoverable';
import { RangeControl } from '@docs/explanation/range-control';
import { SectionFrame } from '@docs/explanation/section-frame';
import { pathFromPoints } from '@docs/explanation/svg-path';
import {
  DEMO_ARC_RADIUS,
  DEMO_STEP,
  type SmoothingDemo,
  computeSmoothingDemo,
} from '@docs/explanation/smoothing-demo';
import { type TipPointer, useTip } from '@docs/explanation/tooltip-provider';

const PLOT_WIDTH = 370;

function KernelBars({ demo, sigma }: { readonly demo: SmoothingDemo; readonly sigma: number }) {
  const tip = useTip();
  const { kernel } = demo;
  const maxWeight = Math.max(...kernel.weights.map((w) => w / kernel.sum), 0.0001);
  const barWidth = Math.min(14, PLOT_WIDTH / (2 * kernel.radius + 1) - 2);
  return (
    <g transform="translate(470 20)">
      <text fill="#8a94a3" fontSize={13}>
        Combien chaque voisin compte (poids)
      </text>
      {kernel.weights.map((weight, index) => {
        const j = index - kernel.radius;
        const height = (weight / kernel.sum / maxWeight) * 90;
        return (
          <rect
            key={j}
            x={180 + j * (barWidth + 2) - barWidth / 2}
            y={110 - height}
            width={Math.max(2, barWidth)}
            height={height}
            rx={2}
            fill="#38d9a9"
            fillOpacity={0.8}
            {...tip(
              sigma ? (
                <>
                  <TipTitle>Le voisin à {j * DEMO_STEP} px</TipTitle>
                  <p>
                    {j === 0
                      ? "C'est le point lui-même : c'est lui qui compte le plus."
                      : 'Plus un voisin est loin, moins il compte.'}
                  </p>
                  <Calc>{`poids = ${fixed((weight / kernel.sum) * 100, 1)} %\n(sur ${kernel.weights.length} points au total)`}</Calc>
                </>
              ) : (
                <>
                  <TipTitle>Pas de lissage</TipTitle>
                  <p>Avec σ = 0, chaque point ne regarde que lui-même (100 %).</p>
                </>
              ),
            )}
          />
        );
      })}
    </g>
  );
}

function TurnPlot({ demo }: { readonly demo: SmoothingDemo }) {
  const tip = useTip();
  const scale = 120 / Math.max(demo.rawPeak, 1);
  const curve = (angles: readonly number[]) =>
    pathFromPoints(
      angles.map((v, k): [number, number] => [
        (k / angles.length) * PLOT_WIDTH,
        150 - Math.abs(v) * scale,
      ]),
    );
  const content = (pointer: TipPointer | null) => {
    const rect = pointer?.element.getBoundingClientRect();
    const ratio =
      pointer && rect ? clamp((pointer.clientX - rect.left) / rect.width, 0, 0.999) : 0.5;
    const k = Math.floor(ratio * demo.rawAngles.length);
    return (
      <>
        <TipTitle>Position {k * DEMO_STEP} px le long du tracé</TipTitle>
        <p>Angle dont le tracé tourne à cet endroit, d'un pas de 4 px au suivant.</p>
        <Calc>{`brut  : ${fixed(Math.abs(demo.rawAngles[k] ?? 0))}°\nlissé : ${fixed(Math.abs(demo.smoothAngles[k] ?? 0))}°`}</Calc>
        <p>
          Le brut saute de 0° à {fixed(demo.rawPeak)}° d'un coup. Le lissé monte progressivement et
          son pic est plus bas.
        </p>
      </>
    );
  };
  return (
    <g transform="translate(470 190)">
      <text fill="#8a94a3" fontSize={13}>
        Virage à chaque pas de 4 px (degrés)
      </text>
      <path
        d={curve(demo.rawAngles)}
        fill="none"
        stroke="#ff6b6b"
        strokeWidth={2}
        strokeDasharray="4 4"
      />
      <path d={curve(demo.smoothAngles)} fill="none" stroke="#38d9a9" strokeWidth={2.5} />
      <rect
        x={0}
        y={10}
        width={PLOT_WIDTH}
        height={150}
        fill="transparent"
        {...tip((pointer) => content(pointer))}
      />
    </g>
  );
}

function SmoothingFigure({
  demo,
  sigma,
}: {
  readonly demo: SmoothingDemo;
  readonly sigma: number;
}) {
  const tip = useTip();
  const rawPath = pathFromPoints(demo.raw);
  return (
    <svg viewBox="0 0 860 400" role="img" aria-label="Comparaison avant et après lissage">
      <path d={rawPath} fill="none" stroke="#ff6b6b" strokeWidth={2.5} strokeDasharray="5 5" />
      <path d={pathFromPoints(demo.smooth)} fill="none" stroke="#38d9a9" strokeWidth={3.5} />
      <text x={30} y={28} fill="#8a94a3" fontSize={13}>
        Un bord droit qui rejoint un arrondi
      </text>
      <text x={30} y={340} fill="#ff6b6b" fontSize={13}>
        - - brut
      </text>
      <text x={110} y={340} fill="#38d9a9" fontSize={13}>
        —— lissé
      </text>
      <path
        d={rawPath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        {...tip(
          <>
            <TipTitle>Le tracé</TipTitle>
            <p>
              Rouge pointillé : avant lissage, un bord droit puis d'un coup un arrondi serré de
              rayon {DEMO_ARC_RADIUS} px. Vert : après lissage. Les deux sont presque confondus ; la
              différence tient à la <b>progressivité</b> du virage, que l'œil détecte très bien.
            </p>
          </>,
        )}
      />
      <KernelBars demo={demo} sigma={sigma} />
      <TurnPlot demo={demo} />
    </svg>
  );
}

function SmoothingFormula({
  demo,
  sigma,
}: {
  readonly demo: SmoothingDemo;
  readonly sigma: number;
}) {
  const { radius } = demo.kernel;
  return (
    <div className="formula">
      {'point lissé = '}
      <Hoverable
        tip={
          <>
            <TipTitle>Moyenne pondérée</TipTitle>
            <p>
              On additionne la position de chaque voisin multipliée par son poids, puis on divise
              par la somme des poids pour retrouver une vraie moyenne.
            </p>
          </>
        }
      >
        Σ poids × voisins ÷ Σ poids
      </Hoverable>
      {'\npoids(d) = '}
      <Hoverable
        tip={
          <>
            <TipTitle>La cloche (gaussienne)</TipTitle>
            <p>
              d = distance au point, le long du contour. Le poids vaut 1 pour d = 0 puis retombe
              très vite. Avec σ = {sigma} px, un voisin à {sigma} px compte{' '}
              {fixed(Math.exp(-0.5) * 100, 0)} % du point central, et à {2 * sigma} px seulement{' '}
              {fixed(Math.exp(-2) * 100, 0)} %.
            </p>
          </>
        }
      >
        exp( −d² ÷ (2·σ²) )
      </Hoverable>
      {`   avec σ = ${sigma} px\nvoisins pris en compte : ±3σ = ±${3 * sigma} px  →  ${2 * radius + 1} points (un tous les 4 px)\nvirage maximal : `}
      <Hoverable
        tip={
          <>
            <TipTitle>Le pic baisse</TipTitle>
            <p>Le lissage étale le virage : le point le plus serré devient un peu moins serré.</p>
          </>
        }
      >
        {fixed(demo.rawPeak)}° brut → {fixed(demo.smoothPeak)}° lissé
      </Hoverable>
      {' par pas de 4 px\nmontée du virage (de 10 % à 90 %) : '}
      <Hoverable
        tip={
          <>
            <TipTitle>Le vrai gain : la progressivité</TipTitle>
            <p>
              Dans le brut, le tracé passe de « tout droit » à « pleine courbure » en {demo.rawRise}{' '}
              px, d'un coup. Lissé, ça se fait sur {demo.smoothRise} px. C'est ce changement trop
              brutal que l'œil prend pour un pli, même quand la courbe est bien tangente.
            </p>
          </>
        }
      >
        {demo.rawRise} px brut → {demo.smoothRise} px lissé
      </Hoverable>
    </div>
  );
}

/** Étape 6 : un lissage gaussien final efface les sauts de courbure aux raccords. */
export function SmoothingSection() {
  const [sigma, setSigma] = useState(12);
  const demo = computeSmoothingDemo(sigma);

  return (
    <SectionFrame
      id="lissage"
      badge="6"
      title="Le dernier polissage : un lissage « en moyenne »"
      plain={
        <>
          Même avec un raccord tangent, il reste un défaut : le bord est presque droit, puis d'un
          coup l'arrondi commence, et l'œil sent ce changement brutal de courbure. On remplace
          chaque point par une <b>moyenne pondérée de ses voisins</b> (les plus proches comptent
          plus). La courbure monte alors progressivement au lieu de sauter.
        </>
      }
    >
      <figure>
        <SmoothingFigure demo={demo} sigma={sigma} />
        <div className="controls">
          <RangeControl
            label="Force du lissage (σ)"
            value={sigma}
            min={0}
            max={30}
            unit=" px"
            onChange={setSigma}
          />
        </div>
        <figcaption>
          Gauche : un bord droit qui rejoint un arrondi (rouge pointillé = brut, vert = lissé).
          Droite haut : « combien chaque voisin compte » (la cloche). Droite bas : le virage point
          par point, le saut du brut disparaît.
        </figcaption>
      </figure>
      <SmoothingFormula demo={demo} sigma={sigma} />
    </SectionFrame>
  );
}
