import { useState } from 'react';
import type { WaveKey } from '@/models/blob-geometry';
import { WAVE_KEYS } from '@/const/blob-carousel';
import { clamp } from '@/commons/clamp';
import { separatorDeviation, waveOffset } from '@/commons/blob-geometry/waves';
import { Calc, TipTitle } from '@docs/explanation/tip-parts';
import { fixed, french } from '@docs/explanation/format';
import { Hoverable } from '@docs/explanation/hoverable';
import { RangeControl } from '@docs/explanation/range-control';
import { SectionFrame } from '@docs/explanation/section-frame';
import { pathFromPoints, sampleVertical } from '@docs/explanation/svg-path';
import { useBlobParams } from '@docs/explanation/blob-params-context';
import { useTip } from '@docs/explanation/tooltip-provider';
import { useAnimationClock } from '@docs/explanation/use-animation-clock';
import { buildWaveInfo } from '@docs/explanation/wave-info';

const HEIGHT = 360;
const CENTER_X = 430;
const SCALE = 6;
const GUIDES = [-40, -20, 20, 40];

function SumExplanation({ y, clock }: { readonly y: number; readonly clock: number }) {
  const { shape } = useBlobParams();
  const values = WAVE_KEYS.map((key) => waveOffset(key, shape, 1, y, clock));
  const total = values.reduce((a, b) => a + b, 0);
  const row = (label: string, value: number) => `${label}${fixed(value).padStart(6)} px`;
  return (
    <>
      <TipTitle>La ligne réelle = la somme</TipTitle>
      <p>À la hauteur y = {fixed(y, 0)} px, voici ce que chaque vague ajoute :</p>
      <Calc>
        {[
          row('grande   ', values[0] ?? 0),
          row('moyenne  ', values[1] ?? 0),
          row('vivante A', values[2] ?? 0),
          row('vivante B', values[3] ?? 0),
          '─────────────────',
          row('écart    ', total),
        ].join('\n')}
      </Calc>
      <p>
        Écart maximal possible : {fixed(shape.sepAmp * 1.4 + shape.liveAmp * 1.6)} px de chaque
        côté.
      </p>
    </>
  );
}

function WavesFigure({
  highlighted,
  onHighlight,
}: {
  readonly highlighted: WaveKey | null;
  readonly onHighlight: (key: WaveKey | null) => void;
}) {
  const clock = useAnimationClock();
  const { shape } = useBlobParams();
  const tip = useTip();
  const info = buildWaveInfo(shape);
  const curve = (xAt: (y: number) => number) =>
    pathFromPoints(sampleVertical((y) => CENTER_X + xAt(y) * SCALE, 0, HEIGHT, 4));

  const sumPath = curve((y) => separatorDeviation(shape, 1, y, clock));
  const sumTriggers = tip((pointer) => {
    const rect = pointer?.element.closest('svg')?.getBoundingClientRect();
    const y =
      pointer && rect
        ? clamp(((pointer.clientY - rect.top) / rect.height) * 400 - 20, 0, HEIGHT)
        : 100;
    return <SumExplanation y={y} clock={clock} />;
  });

  return (
    <svg viewBox="0 0 860 400" role="img" aria-label="Décomposition d'une courbe en quatre vagues">
      <g transform="translate(0 20)">
        <line
          x1={CENTER_X}
          x2={CENTER_X}
          y1={0}
          y2={HEIGHT}
          stroke="#3a4454"
          strokeDasharray="4 5"
        />
        {GUIDES.map((k) => (
          <g key={k}>
            <line
              x1={CENTER_X + k * SCALE}
              x2={CENTER_X + k * SCALE}
              y1={0}
              y2={HEIGHT}
              stroke="#1f2631"
            />
            <text
              x={CENTER_X + k * SCALE}
              y={HEIGHT + 16}
              textAnchor="middle"
              fill="#6b7584"
              fontSize={12}
            >
              {k > 0 ? '+' : ''}
              {k} px
            </text>
          </g>
        ))}
        <text x={CENTER_X} y={HEIGHT + 16} textAnchor="middle" fill="#6b7584" fontSize={12}>
          ligne droite
        </text>
        {WAVE_KEYS.map((key) => {
          const d = curve((y) => waveOffset(key, shape, 1, y, clock));
          return (
            <g key={key}>
              <path
                d={d}
                fill="none"
                stroke={info[key].color}
                strokeWidth={2.2}
                strokeOpacity={0.95}
                style={{ opacity: highlighted && highlighted !== key ? 0.15 : 1 }}
              />
              <path
                d={d}
                fill="none"
                stroke="transparent"
                strokeWidth={16}
                {...tip(info[key].tip)}
                onPointerEnter={() => {
                  onHighlight(key);
                }}
                onPointerLeave={() => {
                  onHighlight(null);
                }}
              />
            </g>
          );
        })}
        <path d={sumPath} fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
        <path d={sumPath} fill="none" stroke="transparent" strokeWidth={16} {...sumTriggers} />
      </g>
    </svg>
  );
}

function WavesFormula() {
  const { shape } = useBlobParams();
  const { sepAmp, liveAmp } = shape;
  return (
    <div className="formula">
      {'x(y) = '}
      <Hoverable
        tip={
          <>
            <TipTitle>Position de base</TipTitle>
            <p>
              Le séparateur n°i est posé à i fois le « pas » (ici 300 px sur ordinateur). C'est lui
              qui espace les blobs dans la rangée.
            </p>
          </>
        }
      >
        i × pas
      </Hoverable>
      {' + '}
      <Hoverable
        tip={
          <>
            <TipTitle>Grande vague</TipTitle>
            <p>
              sin() est la fonction « vague » : elle monte et descend entre −1 et +1. On la
              multiplie par {sepAmp} pour avoir ±{sepAmp} px. Le 0,012 règle la longueur de la
              vague, le « i·1,7 » la décale selon le séparateur.
            </p>
          </>
        }
      >
        {sepAmp} · sin(0,012·y + i·1,7)
      </Hoverable>
      {'\n         + '}
      <Hoverable
        tip={
          <>
            <TipTitle>Vague moyenne</TipTitle>
            <p>
              0,4 × {sepAmp} = {fixed(sepAmp * 0.4)} px. Plus serrée (0,031 contre 0,012).
            </p>
          </>
        }
      >
        {french(sepAmp * 0.4)} · sin(0,031·y + i·2,9)
      </Hoverable>
      {'\n         + '}
      <Hoverable
        tip={
          <>
            <TipTitle>Vivante A</TipTitle>
            <p>
              <i>t</i> est le temps en millisecondes : en changeant avec le temps, la vague avance.
              Amplitude {liveAmp} px seulement : on le voit bouger sans que le blob se déforme.
            </p>
          </>
        }
      >
        {liveAmp} · sin(0,02·y + t·0,0018 + i·1,3)
      </Hoverable>
      {'\n         + '}
      <Hoverable
        tip={
          <>
            <TipTitle>Vivante B</TipTitle>
            <p>Le signe « − » devant t la fait avancer dans l'autre sens que la A.</p>
          </>
        }
      >
        {french(liveAmp * 0.6)} · sin(0,047·y − t·0,0012 + i·0,7)
      </Hoverable>
    </div>
  );
}

/** Étape 2 : un séparateur est la somme de quatre vagues, deux fixes et deux animées. */
export function WavesSection() {
  const { shape, setShapeValue } = useBlobParams();
  const [highlighted, setHighlighted] = useState<WaveKey | null>(null);
  const info = buildWaveInfo(shape);
  const tip = useTip();

  return (
    <SectionFrame
      id="vague"
      badge="2"
      title="Une ligne ondulée, faite de quatre vagues superposées"
      plain={
        <>
          Une seule vague donnerait une forme trop régulière, qui « sent » le mathématique. On en
          additionne quatre, de tailles différentes : deux grandes qui <b>ne bougent pas</b> (elles
          donnent la forme du blob) et deux petites qui <b>bougent lentement</b> (elles le rendent
          vivant).
        </>
      }
    >
      <div className="chips">
        {WAVE_KEYS.map((key) => (
          <span
            key={key}
            className="chip"
            role="button"
            tabIndex={0}
            {...tip(info[key].tip)}
            onPointerEnter={() => {
              setHighlighted(key);
            }}
            onPointerLeave={() => {
              setHighlighted(null);
            }}
          >
            <i style={{ background: info[key].color }} />
            {info[key].name}
          </span>
        ))}
      </div>
      <figure>
        <WavesFigure highlighted={highlighted} onHighlight={setHighlighted} />
        <div className="controls">
          <RangeControl
            label="Forme (grandes vagues)"
            value={shape.sepAmp}
            min={0}
            max={60}
            unit=" px"
            onChange={(value) => {
              setShapeValue('sepAmp', value);
            }}
          />
          <RangeControl
            label="Mouvement vivant"
            value={shape.liveAmp}
            min={0}
            max={20}
            unit=" px"
            onChange={(value) => {
              setShapeValue('liveAmp', value);
            }}
          />
        </div>
        <figcaption>
          Axe horizontal : de combien la ligne s'écarte d'une verticale parfaite, ici{' '}
          <b>agrandi 6 fois</b>. Trait épais blanc = la somme des quatre vagues = la vraie ligne.
          Les curseurs modifient aussi les autres schémas de la page.
        </figcaption>
      </figure>
      <p>La formule exacte de la position d'un séparateur :</p>
      <WavesFormula />
    </SectionFrame>
  );
}
