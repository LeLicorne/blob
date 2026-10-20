import { SectionFrame } from '@docs/explanation/section-frame';
import { TipTitle } from '@docs/explanation/tip-parts';
import { useTip } from '@docs/explanation/tooltip-provider';

interface KeyFigure {
  readonly value: string;
  readonly unit: string;
  readonly name: string;
  readonly title: string;
  readonly detail: string;
  readonly tone: 'sep' | 'live' | 'gap' | 'corner' | 'smooth';
}

const KEY_FIGURES: readonly KeyFigure[] = [
  {
    value: '26',
    unit: 'px',
    name: 'gap',
    title: 'Espace entre deux blobs',
    detail:
      "Distance perpendiculaire entre le bord droit d'un blob et le bord gauche du suivant. Mesuré : entre 25,9 et 26,6 px sur la partie droite du bord (la différence vient du pas d'échantillonnage). Près des coins arrondis l'espace grandit un peu, c'est normal.",
    tone: 'gap',
  },
  {
    value: '70',
    unit: 'px',
    name: 'corner',
    title: "Rayon d'arrondi visé",
    detail:
      'Rayon du cercle « idéal » pour les coins. Sur les coins très aigus ou les blobs étroits, le rayon réel est plus petit (plafond de 45 % du bord).',
    tone: 'corner',
  },
  {
    value: '≥ 22',
    unit: 'px',
    name: 'mesuré',
    title: 'Rayon de courbure minimal',
    detail:
      "Le plus petit rayon trouvé sur tout le contour, mesuré sur 4 largeurs de blob × 3 hauteurs × 12 blobs × 24 instants. Avant correction on trouvait 13 px, avec des coins visibles ; à plus de 20 px l'œil voit une courbe, plus un coin.",
    tone: 'corner',
  },
  {
    value: '12',
    unit: 'px',
    name: 'smooth',
    title: 'Force du lissage final (σ)',
    detail:
      "Chaque point est remplacé par la moyenne de ses voisins jusqu'à ±36 px (3σ). Assez faible pour ne pas déformer l'espace entre blobs.",
    tone: 'smooth',
  },
  {
    value: '26',
    unit: 'px',
    name: 'sepAmp',
    title: 'Amplitude des grandes vagues',
    detail:
      "De combien les séparateurs s'écartent de la verticale à cause des vagues fixes. Avec la vague moyenne (×0,4), jusqu'à ±36 px.",
    tone: 'sep',
  },
  {
    value: '±5',
    unit: 'px',
    name: 'liveAmp',
    title: 'Mouvement vivant',
    detail:
      "Amplitude de l'ondulation animée. Avec la seconde vague vivante (×0,6), jusqu'à ±8 px au maximum : on voit le contour respirer sans que le blob change de forme.",
    tone: 'live',
  },
  {
    value: '3,5 s',
    unit: '',
    name: '0,0006×3',
    title: 'Cycle de la vague vivante A',
    detail:
      "Temps pour qu'une des petites vagues animées fasse un tour complet (2π ÷ 0,0018 rad/ms). La B met 5,2 s et va dans l'autre sens.",
    tone: 'live',
  },
  {
    value: '5',
    unit: 'px',
    name: 'STEP',
    title: 'Un point tous les 5 px',
    detail:
      'Les bords courbes sont tracés avec un point tous les 5 px environ. Plus espacé, on verrait des facettes. Le contour final est rééchantillonné tous les 4 px.',
    tone: 'smooth',
  },
  {
    value: '0,5523',
    unit: '',
    name: 'K (90°)',
    title: 'Facteur des poignées',
    detail:
      "Nombre qui permet à une courbe de Bézier d'imiter un quart de cercle. Il devient plus petit pour des coins plus ouverts : (4/3)·tan(φ/4) ÷ tan(φ/2).",
    tone: 'corner',
  },
  {
    value: '8 + 4',
    unit: 'itérations',
    name: 'hit / T',
    title: 'Recherches par essais',
    detail:
      '8 essais pour trouver où un bord touche le haut ou le bas, 4 pour ajuster la distance de découpe des coins. Ça converge en 3-4 essais ; le reste est de la marge.',
    tone: 'gap',
  },
  {
    value: '68 %',
    unit: 'écran',
    name: 'W × 0,68',
    title: 'Largeur du blob',
    detail:
      "Largeur d'un blob = 68 % de l'écran, bloquée entre 230 et 340 px. ≈ 265 px sur téléphone (390 px), 340 px dès 500 px d'écran.",
    tone: 'sep',
  },
  {
    value: '0,1',
    unit: '/ image',
    name: 'ease',
    title: 'Inertie du glissement',
    detail:
      'À chaque image, on parcourt 10 % de la distance restante. Après 1 s (60 images) il en reste 0,2 %.',
    tone: 'smooth',
  },
];

function KeyFigureCard({ figure }: { readonly figure: KeyFigure }) {
  const triggerProps = useTip()(
    <>
      <TipTitle>{figure.title}</TipTitle>
      <p>{figure.detail}</p>
    </>,
  );
  return (
    <div className="card" role="button" tabIndex={0} {...triggerProps}>
      <div className={`v c-${figure.tone}`}>
        {figure.value}
        <small>{figure.unit}</small>
      </div>
      <div className="n">{figure.name}</div>
      <div className="d">{figure.title}</div>
    </div>
  );
}

/** Récapitulatif des chiffres clés de la construction des blobs. */
export function KeyFiguresSection() {
  return (
    <SectionFrame id="chiffres" title="Les chiffres clés en un coup d'œil">
      <p>Survole chaque carte pour savoir d'où vient le chiffre et à quoi il sert.</p>
      <div className="cards">
        {KEY_FIGURES.map((figure) => (
          <KeyFigureCard key={figure.name} figure={figure} />
        ))}
      </div>
    </SectionFrame>
  );
}
