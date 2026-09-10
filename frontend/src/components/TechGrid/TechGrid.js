import { useMemo } from 'react';
import useReveal from '../../hooks/useReveal';
import { iconFor } from './iconMap';
import styles from './TechGrid.module.css';

/**
 * The toolkit, as icons.
 *
 * What this replaces: a wrapping row of small text pills, one per skill, all
 * the same colour. Twenty-eight of them. It was accurate and it was invisible -
 * a reader scanned it as a paragraph of nouns rather than seeing anything.
 *
 * Now each skill is a tile with a real mark, sized to be looked at, and
 * coloured by which half of the work it belongs to: cool for data and
 * statistics, warm for languages and infrastructure, neutral for the
 * professional skills. That colour split is the reason the palette gained a
 * cool scale at all - see the note in styles/Theme.css.
 *
 * ── Motion ───────────────────────────────────────────────────────────────────
 * Tiles arrive on a stagger from one IntersectionObserver, using the shared
 * reveal primitive rather than a scroll-driven timeline. That is deliberate: a
 * stagger needs a per-item delay, and `animation-delay` is inert on a
 * scroll-driven animation because there is no wall-clock time for it to
 * consume. A class-triggered transition is the right tool for a one-shot
 * cascade; scroll timelines are the right tool for scrubbing.
 *
 * Everything that moves is transform or opacity. Hover raises the tile and
 * spins the mark a few degrees; the icons do not animate continuously, because
 * twenty-eight permanently animating elements is exactly the sort of thing that
 * costs frames for no benefit.
 */

/** Order matters: the families read left to right, data first, because the
 *  first line of the site calls him a data scientist. */
const FAMILY_ORDER = ['data', 'dev', 'craft'];

const FAMILY_LABEL = {
  data: 'Data and analytics',
  dev: 'Development and infrastructure',
  craft: 'Practice',
};

const TechGrid = ({ skills = [] }) => {
  const [ref, shown] = useReveal({ threshold: 0.08 });

  /*
   * Regrouped by icon family, not by the Firestore category names.
   *
   * Those names are prose and editable ("Data & Analytics", "Professional
   * Skills"), so keying the colour off them would mean a skill silently
   * changing colour because someone renamed a heading in the admin. The family
   * comes from the skill itself, in iconMap.js.
   *
   * Accepts either the flattened `{ label, group }` shape Home produces or
   * plain strings, so a caller does not have to know which.
   */
  const families = useMemo(() => {
    const byFamily = new Map(FAMILY_ORDER.map(f => [f, []]));
    const seen = new Set();

    for (const entry of skills) {
      const label = typeof entry === 'string'
        ? entry
        : entry?.label ?? entry?.name ?? '';
      if (!label || seen.has(label)) continue;
      seen.add(label);

      const { Icon, family } = iconFor(label);
      byFamily.get(family).push({ label, Icon });
    }

    return FAMILY_ORDER
      .map(family => ({ family, items: byFamily.get(family) }))
      .filter(f => f.items.length > 0);
  }, [skills]);

  if (families.length === 0) return null;

  // One running index across every family, so the cascade crosses the whole
  // grid rather than restarting at each heading.
  let tileIndex = 0;

  return (
    <div
      ref={ref}
      className={styles.wrap}
      data-reveal-shown={shown ? '' : undefined}
      style={{ '--reveal-step': '28ms' }}
    >
      {families.map(({ family, items }) => (
        <section key={family} className={styles.family} data-family={family}>
          <h3 className={styles.familyName} data-reveal style={{ '--i': tileIndex }}>
            <span className={styles.familyRule} aria-hidden="true" />
            {FAMILY_LABEL[family]}
            <span className={styles.familyCount}>{items.length}</span>
          </h3>

          <ul className={styles.grid}>
            {items.map(({ label, Icon }) => {
              tileIndex += 1;
              return (
                <li
                  key={label}
                  className={styles.tile}
                  data-reveal
                  style={{ '--i': tileIndex }}
                >
                  <span className={styles.mark} aria-hidden="true">
                    <Icon />
                  </span>
                  <span className={styles.label}>{label}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default TechGrid;
