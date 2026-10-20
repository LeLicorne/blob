interface RangeControlProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly unit: string;
  readonly onChange: (value: number) => void;
}

/** Curseur étiqueté qui affiche sa valeur courante. */
export function RangeControl({ label, value, min, max, unit, onChange }: RangeControlProps) {
  return (
    <label>
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
      />
      <output>
        {value}
        {unit}
      </output>
    </label>
  );
}
