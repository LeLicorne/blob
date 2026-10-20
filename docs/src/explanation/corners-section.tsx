import { useState } from 'react';
import type { Point } from '@/models/blob-geometry';
import { Calc, TipTitle } from '@docs/explanation/tip-parts';
import { fixed } from '@docs/explanation/format';
import { Hoverable } from '@docs/explanation/hoverable';
import { RangeControl } from '@docs/explanation/range-control';
import { SectionFrame } from '@docs/explanation/section-frame';
import { type CornerDemo, computeCornerDemo } from '@docs/explanation/corner-demo';
import { useTip } from '@docs/explanation/tooltip-provider';

const at = ([x, y]: Point) => `${fixed(x)} ${fixed(y)}`;

function CornerFigure({ demo }: { readonly demo: CornerDemo }) {
  const tip = useTip();
  const { radius, degrees, cap, rawCut, cut, factor, handle, obtainedRadius } = demo;
  const arc = `M${at(demo.pointBefore)}C${at(demo.handleBefore)} ${at(demo.handleAfter)} ${at(demo.pointAfter)}`;
  const points = [
    {
      key: 'pb',
      point: demo.pointBefore,
      fill: '#ffd43b',
      r: 8,
      tip: (
        <>
          <TipTitle>Point de coupe avant</TipTitle>
          <p>
            Là où le bord droit se termine et où l'arrondi commence. À une distance <b>T</b> du
            sommet.
          </p>
          <Calc>
            {`T = R × tan(φ/2)\n  = ${radius} × tan(${fixed(degrees / 2, 1)}°)\n  = ${fixed(rawCut, 1)} px${rawCut > cap ? `\nplafonné à ${fixed(cap, 1)} px` : ''}`}
          </Calc>
        </>
      ),
    },
    {
      key: 'pa',
      point: demo.pointAfter,
      fill: '#ffd43b',
      r: 8,
      tip: (
        <>
          <TipTitle>Point de coupe après</TipTitle>
          <p>
            Symétrique : l'arrondi se termine ici et le bord suivant repart, à la même distance T du
            sommet.
          </p>
          <Calc>{`T = ${fixed(cut, 1)} px`}</Calc>
        </>
      ),
    },
    {
      key: 'c1',
      point: demo.handleBefore,
      fill: '#b197fc',
      r: 8,
      tip: (
        <>
          <TipTitle>Poignée 1</TipTitle>
          <p>
            Elle est posée sur le prolongement du bord, ce qui garantit que la courbe démarre{' '}
            <b>exactement dans la même direction</b> que le bord : aucune cassure.
          </p>
          <Calc>{`longueur h = K × T\n  = ${fixed(factor, 3)} × ${fixed(cut, 1)}\n  = ${fixed(handle, 1)} px`}</Calc>
        </>
      ),
    },
    {
      key: 'c2',
      point: demo.handleAfter,
      fill: '#b197fc',
      r: 8,
      tip: (
        <>
          <TipTitle>Poignée 2</TipTitle>
          <p>
            Même longueur que l'autre, côté sortie. Deux poignées identiques = une courbure
            régulière, sans « pointe » d'un seul côté.
          </p>
          <Calc>{`h = ${fixed(handle, 1)} px`}</Calc>
        </>
      ),
    },
    {
      key: 'X',
      point: demo.apex,
      fill: '#e8ecf2',
      r: 6,
      tip: (
        <>
          <TipTitle>Sommet du coin pointu</TipTitle>
          <p>
            C'est le coin d'origine, celui qu'on supprime. La courbe passe à l'intérieur sans jamais
            le toucher.
          </p>
          <Calc>
            {`angle de virage φ = ${degrees}°\n(90° = coin droit ; plus c'est grand, plus le coin est aigu)`}
          </Calc>
        </>
      ),
    },
  ];

  return (
    <svg viewBox="0 0 860 380" role="img" aria-label="Coin arrondi par une courbe de Bézier">
      <circle
        cx={fixed(demo.pointBefore[0])}
        cy={fixed(demo.pointBefore[1] + obtainedRadius)}
        r={fixed(obtainedRadius)}
        fill="none"
        stroke="#566072"
        strokeDasharray="4 5"
      />
      <path
        d={`M${at(demo.start)}L${at(demo.apex)}L${at(demo.end)}`}
        fill="none"
        stroke="#8a94a3"
        strokeDasharray="6 6"
        strokeWidth={2}
      />
      <path d={arc} fill="none" stroke="#b197fc" strokeWidth={5} strokeLinecap="round" />
      <path
        d={`M${at(demo.start)}L${at(demo.pointBefore)}M${at(demo.pointAfter)}L${at(demo.end)}`}
        fill="none"
        stroke="#e8ecf2"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d={`M${at(demo.pointBefore)}L${at(demo.handleBefore)}M${at(demo.pointAfter)}L${at(demo.handleAfter)}`}
        fill="none"
        stroke="#b197fc"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <path
        d={arc}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        {...tip(
          <>
            <TipTitle>La courbe de raccord</TipTitle>
            <p>
              Une courbe de Bézier cubique : un trait doux défini par 4 points (les deux points de
              coupe et les deux poignées qui « tirent » la courbe dans la direction des bords).
            </p>
            <Calc>{`rayon visé   = ${radius} px\nrayon obtenu = ${fixed(obtainedRadius, 1)} px`}</Calc>
          </>,
        )}
      />
      {points.map(({ key, point, fill, r, tip: content }) => (
        <circle
          key={key}
          cx={fixed(point[0])}
          cy={fixed(point[1])}
          r={r}
          fill={fill}
          stroke="#0e1116"
          strokeWidth={2}
          tabIndex={0}
          {...tip(content)}
        />
      ))}
      <text x={20} y={360} fill="#ffcf33" fontSize={14}>
        {rawCut > cap
          ? `⚠ Plafond atteint : la coupe voulue (${fixed(rawCut, 0)} px) dépasserait 45 % du bord (${fixed(cap, 0)} px). Le rayon réel tombe à ${fixed(obtainedRadius, 0)} px.`
          : ''}
      </text>
    </svg>
  );
}

function CornerFormula({ demo }: { readonly demo: CornerDemo }) {
  return (
    <div className="formula">
      {'T = '}
      <Hoverable
        tip={
          <>
            <TipTitle>Distance de découpe</TipTitle>
            <p>
              Formule de géométrie : pour qu'un cercle de rayon R soit tangent aux deux bords d'un
              coin d'angle φ, il touche chaque bord à cette distance du sommet. Plus le coin est
              aigu, plus on doit couper loin.
            </p>
          </>
        }
      >
        R × tan(φ/2)
      </Hoverable>
      {` = ${fixed(demo.rawCut, 1)} px  →  `}
      <Hoverable
        tip={
          <>
            <TipTitle>Plafond de sécurité</TipTitle>
            <p>
              On ne coupe jamais plus de 45 % d'un bord : sinon, sur un blob étroit, les deux
              arrondis voisins se chevaucheraient.
            </p>
          </>
        }
      >
        min(T, 45 % du bord) = {fixed(demo.cut, 1)} px
      </Hoverable>
      {'\nK = '}
      <Hoverable
        tip={
          <>
            <TipTitle>Facteur des poignées</TipTitle>
            <p>
              Une courbe de Bézier ne peut pas dessiner un cercle exact, mais avec ce facteur elle
              en est quasiment indiscernable. Pour un coin droit (90°) il vaut 0,5523, valeur
              célèbre en dessin vectoriel.
            </p>
          </>
        }
      >
        (4/3) · tan(φ/4) ÷ tan(φ/2)
      </Hoverable>
      {` = ${fixed(demo.factor, 4)}\nh = K × T = ${fixed(demo.handle, 1)} px   `}
      <Hoverable
        tip={
          <>
            <TipTitle>Pourquoi 2 poignées égales ?</TipTitle>
            <p>
              Quand les bords sont courbes, les tangentes ne se croisent pas à égale distance des
              deux points. Imposer la même longueur aux deux poignées évite une courbure inégale qui
              ferait « pointer » un côté.
            </p>
          </>
        }
      >
        (longueur de chaque poignée)
      </Hoverable>
      {'\nEn vrai les bords sont courbes : φ est mesuré aux points de coupe, et T est recalculé '}
      <Hoverable
        tip={
          <>
            <TipTitle>Pourquoi itérer ?</TipTitle>
            <p>
              Changer T déplace les points de coupe, donc change l'angle réel, donc T… On répète 4
              fois en faisant la moyenne avec la valeur précédente, ce qui se stabilise très vite.
            </p>
          </>
        }
      >
        4 fois
      </Hoverable>
      .
    </div>
  );
}

/** Étape 5 : chaque coin vif est remplacé par une Bézier tangente aux deux bords. */
export function CornersSection() {
  const [radius, setRadius] = useState(70);
  const [degrees, setDegrees] = useState(90);
  const demo = computeCornerDemo(radius, degrees);

  return (
    <SectionFrame
      id="coins"
      badge="5"
      title="Arrondir les coins sans jamais casser la courbe"
      plain={
        <>
          À l'intersection, on a un coin pointu. On le « mord » : on coupe un peu avant et un peu
          après, puis on relie les deux points par une courbe douce qui part{' '}
          <b>exactement dans la direction du bord</b> à chaque bout. Comme la direction est la même
          des deux côtés du raccord, il n'y a plus de cassure possible.
        </>
      }
    >
      <figure>
        <CornerFigure demo={demo} />
        <div className="controls">
          <RangeControl
            label="Rayon visé"
            value={radius}
            min={20}
            max={120}
            unit=" px"
            onChange={setRadius}
          />
          <RangeControl
            label="Angle de virage du coin"
            value={degrees}
            min={40}
            max={140}
            unit="°"
            onChange={setDegrees}
          />
        </div>
        <figcaption>
          Pointillés = le coin pointu d'origine. Trait violet = la courbe de raccord. Cercle gris =
          un cercle parfait de comparaison. Essaie un angle de 140° : le coin est très aigu, le
          plafond de découpe s'active.
        </figcaption>
      </figure>
      <CornerFormula demo={demo} />
    </SectionFrame>
  );
}
