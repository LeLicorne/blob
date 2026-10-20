import { useState } from 'react';
import {
  BlobGrid,
  DEFAULT_GRID_SHAPE,
  type BlobCarouselSlide,
  type BlobShapeConfig,
} from '@/index';
import { RangeControl } from '@docs/explanation/range-control';

const COLORS = [
  '#ff6b6b',
  '#ffa94d',
  '#ffd43b',
  '#69db7c',
  '#38d9a9',
  '#4dabf7',
  '#9775fa',
  '#f783ac',
  '#e599f7',
  '#74c0fc',
  '#63e6be',
  '#ffa8a8',
];

const SLIDES: readonly BlobCarouselSlide[] = COLORS.map((color, index) => ({
  id: color,
  label: `Blob ${index + 1}`,
  color,
}));

type FixedAxis = 'columns' | 'rows';

/** Démonstration interactive de la grille : choix de l'axe fixé, de sa valeur et du nombre de blobs. */
export function GridDemo() {
  const [axis, setAxis] = useState<FixedAxis>('columns');
  const [value, setValue] = useState(3);
  const [count, setCount] = useState(8);
  const [stagger, setStagger] = useState(false);
  const [shape, setShape] = useState<BlobShapeConfig>(DEFAULT_GRID_SHAPE);
  const setShapeValue = (key: keyof BlobShapeConfig, next: number) => {
    setShape((previous) => ({ ...previous, [key]: next }));
  };

  return (
    <section className="grid-demo wrap" id="grille-demo" aria-labelledby="grille-demo-title">
      <h2 id="grille-demo-title">En grille</h2>
      <div className="controls">
        <label>
          Fixer
          <select
            value={axis}
            onChange={(event) => {
              setAxis(event.target.value === 'rows' ? 'rows' : 'columns');
            }}
          >
            <option value="columns">le nombre de colonnes</option>
            <option value="rows">le nombre de lignes</option>
          </select>
        </label>
        <label>
          {axis === 'columns' ? 'Colonnes' : 'Lignes'}
          <input
            type="range"
            min={1}
            max={6}
            step={1}
            value={value}
            onChange={(event) => {
              setValue(Number(event.target.value));
            }}
          />
          <output>{value}</output>
        </label>
        <label>
          Blobs
          <input
            type="range"
            min={1}
            max={12}
            step={1}
            value={count}
            onChange={(event) => {
              setCount(Number(event.target.value));
            }}
          />
          <output>{count}</output>
        </label>
        <label>
          <input
            type="checkbox"
            checked={stagger}
            onChange={(event) => {
              setStagger(event.target.checked);
            }}
          />
          Décaler une rangée sur deux
        </label>
      </div>
      <div className="controls">
        <RangeControl
          label="Espace"
          value={shape.gap}
          min={4}
          max={40}
          unit=""
          onChange={(v) => {
            setShapeValue('gap', v);
          }}
        />
        <RangeControl
          label="Coins"
          value={shape.corner}
          min={5}
          max={120}
          unit=""
          onChange={(v) => {
            setShapeValue('corner', v);
          }}
        />
        <RangeControl
          label="Ondulation"
          value={shape.sepAmp}
          min={0}
          max={60}
          unit=""
          onChange={(v) => {
            setShapeValue('sepAmp', v);
          }}
        />
        <RangeControl
          label="Détail (%)"
          value={Math.round(shape.detail * 100)}
          min={0}
          max={60}
          unit=""
          onChange={(v) => {
            setShapeValue('detail', v / 100);
          }}
        />
        <RangeControl
          label="Vie"
          value={shape.liveAmp}
          min={0}
          max={15}
          unit=""
          onChange={(v) => {
            setShapeValue('liveAmp', v);
          }}
        />
        <RangeControl
          label="Lissage"
          value={shape.smooth}
          min={0}
          max={30}
          unit=""
          onChange={(v) => {
            setShapeValue('smooth', v);
          }}
        />
      </div>
      <BlobGrid
        className="grid-demo__grid"
        label="Grille de blobs colorés"
        slides={SLIDES.slice(0, count)}
        stagger={stagger}
        shape={shape}
        {...(axis === 'columns' ? { columns: value } : { rows: value })}
      />
    </section>
  );
}
