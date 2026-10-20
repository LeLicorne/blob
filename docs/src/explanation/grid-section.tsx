import { BlobGrid } from '@/index';
import { Hoverable } from '@docs/explanation/hoverable';
import { SectionFrame } from '@docs/explanation/section-frame';
import { TipTitle } from '@docs/explanation/tip-parts';

const SLIDES = ['#ff6b6b', '#ffd43b', '#4dabf7', '#69db7c', '#9775fa', '#f783ac'].map(
  (color, index) => ({ id: color, label: `Blob ${index + 1}`, color }),
);

/** Étape 8 : la même idée de frontières partagées, appliquée dans les deux directions. */
export function GridSection() {
  return (
    <SectionFrame
      id="grille"
      badge="8"
      title="En grille : des frontières dans les deux sens"
      plain={
        <>
          Pour un carrousel, il suffit de lignes presque verticales. Pour une grille, on ajoute des
          lignes presque <b>horizontales</b>, partagées de la même façon entre la rangée du dessus
          et celle du dessous. Un blob est alors la zone entre deux lignes verticales et deux lignes
          horizontales, chacune reculée d'un demi-espace : l'espace reste constant dans les deux
          directions.
        </>
      }
    >
      <p>
        Les coins ne sont plus trouvés en cherchant où un bord rencontre une courbe « haut » : on
        cherche{' '}
        <Hoverable
          tone="gap"
          tip={
            <>
              <TipTitle>Intersection de deux courbes</TipTitle>
              <p>
                On alterne deux corrections. On aligne d'abord l'abscisse du bord horizontal sur
                celle du bord vertical, puis on aligne la hauteur du bord vertical sur celle du bord
                horizontal. Les deux courbes étant presque perpendiculaires, quelques tours
                suffisent (12 ici, par marge).
              </p>
            </>
          }
        >
          l'intersection des deux bords décalés
        </Hoverable>
        , puis on arrondit et on lisse exactement comme pour le carrousel (étapes 5 et 6).
      </p>
      <p>
        Avec <code>stagger</code>, une rangée sur deux est décalée d'une{' '}
        <Hoverable
          tone="sep"
          tip={
            <>
              <TipTitle>Pourquoi des séparateurs par rangée ?</TipTitle>
              <p>
                Les lignes horizontales restent partagées sur toute la largeur. Mais une cellule
                décalée a deux voisines au-dessus : ses lignes verticales ne prolongent plus celles
                de la rangée du dessus. Chaque rangée reçoit donc ses propres séparateurs verticaux,
                avec leurs propres phases, et l'espace reste constant partout.
              </p>
            </>
          }
        >
          demi-cellule
        </Hoverable>
        , comme des briques. La grille s'élargit d'une demi-cellule pour que rien ne dépasse.
      </p>
      <figure>
        <BlobGrid
          className="grid-section__grid"
          label="Grille de six blobs"
          slides={SLIDES}
          columns={3}
        />
        <figcaption>
          Trois colonnes, deux lignes : <code>{'<BlobGrid columns={3} slides={…} />'}</code>. Avec
          seulement <code>columns</code>, les lignes s'adaptent au nombre de blobs ; avec seulement{' '}
          <code>rows</code>, ce sont les colonnes.
        </figcaption>
      </figure>
    </SectionFrame>
  );
}
