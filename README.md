# @barelo/blob-carousel

Carrousel React infini de blobs vivants : chaque blob est la zone comprise entre deux courbes
ondulantes **partagées** avec ses voisins. Ils s'emboîtent donc avec un espace constant, les coins
sont arrondis par des Béziers tangentes aux bords, et les contours respirent doucement.
Aucune dépendance runtime hors React.

## Utilisation

```tsx
import { BlobCarousel } from '@barelo/blob-carousel';
import '@barelo/blob-carousel/style.css';

<BlobCarousel
  className="h-[480px]"
  slides={[
    { id: 'a', label: 'Corail', color: '#ff6b6b' },
    { id: 'b', label: 'Photo', imageUrl: '/photo.jpg' },
  ]}
/>;
```

La hauteur du carrousel est celle de son élément racine (`className` ou style du parent).

| Prop                  | Rôle                                                                           |
| --------------------- | ------------------------------------------------------------------------------ |
| `slides`              | `{ id, label, color? , imageUrl? }[]`, lues en boucle infinie                  |
| `shape`               | `gap`, `corner`, `smooth`, `sepAmp`, `liveAmp`, `liveSpeed` (défauts exportés) |
| `ease`                | part de la distance restante parcourue par image (0,1)                         |
| `maxHeight`           | hauteur maximale d'un blob (520)                                               |
| `labels`              | `region`, `previous`, `next`, `goToSlide(n)` (anglais par défaut)              |
| `showControls`        | boutons et points de pagination (`true`)                                       |
| `onActiveIndexChange` | appelé quand la diapositive centrée change                                     |

Thème via variables CSS : `--blob-carousel-foreground`, `--blob-carousel-border`,
`--blob-carousel-hover`. Navigation : glisser, flèches ← → quand le focus est dans le composant,
boutons, points. `prefers-reduced-motion` fige l'animation de forme.

## Grille

```tsx
import { BlobGrid } from '@barelo/blob-carousel';
import '@barelo/blob-carousel/style.css';

<BlobGrid slides={slides} columns={3} />   // 3 colonnes, lignes déduites
<BlobGrid slides={slides} rows={2} />      // 2 lignes, colonnes déduites
<BlobGrid slides={slides} columns={3} rows={2} />  // grille fixe, surplus ignoré
```

Une div parente contient les blobs, rangés de gauche à droite puis de haut en bas. Même principe
que le carrousel : chaque bord est une courbe partagée avec la cellule voisine, donc l'espace est
constant horizontalement et verticalement. La grille prend toute la largeur de son parent (les
blobs restent à l'intérieur) ; sa hauteur vient du nombre de lignes. Le dessin est mis à l'échelle
avec la grille : espace, coins et vagues gardent les mêmes proportions à toutes les tailles.
Défauts de la grille (`DEFAULT_GRID_SHAPE`) : espace fin (16), coins modérés (45) pour des jonctions serrées, formes douces (`detail` 0,12).

| Prop              | Rôle                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| `slides`          | mêmes diapositives que le carrousel                                         |
| `columns`, `rows` | un seul : l'autre s'adapte ; aucun : grille la plus carrée possible         |
| `stagger`         | une rangée sur deux décalée d'une demi-cellule, comme des briques (`false`) |
| `cellAspectRatio` | largeur / hauteur d'une cellule (1)                                         |
| `shape`           | mêmes réglages que le carrousel                                             |
| `animated`        | contour vivant (`true`) ; `false` dessine la grille une seule fois          |
| `label`           | nom de la grille pour les lecteurs d'écran                                  |

## Publication

Voir [PUBLISHING.md](./PUBLISHING.md) (paquet scoped public sur npm).

## Développement

```sh
pnpm dev        # page de docs : carrousel + explication interactive (docs/)
pnpm test       # Vitest
pnpm qa         # prettier, tsc, eslint
pnpm build      # dist/ (ES + CJS + types + style.css)
```

Structure : `src/commons/blob-geometry/` (géométrie pure, testée), `src/hooks/use-blob-carousel.ts`
(boucle d'animation, glissement), `src/components/`, `docs/` (page d'explication, non publiée).
