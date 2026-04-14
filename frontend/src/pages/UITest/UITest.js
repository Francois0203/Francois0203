import React, { useState } from 'react';

/* Components */
import {
  Tooltip,
  Modal,
  CursorGlowButton,
  MagneticButton,
  GhostButton,
  SearchableDropdown,
  ThemeSwitch,
  ReduceAnimationsSwitch,
  PasswordInput,
} from '../../components';
import { useToast } from '../../components';
import ErrorBoundary from '../../components/Error Boundary';

/* Hooks */
import { useTheme } from '../../hooks';

/* Styling */
import styles from './UITest.module.css';
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/Wrappers.css';

/* ============================================================================
 * ERROR BOUNDARY DEMO HELPERS
 * ============================================================================
 */

/** Deliberately throws on every render — used only inside the demo boundary. */
const BrokenComponent = () => {
  throw new Error(
    "Cannot read properties of undefined (reading 'data')\n" +
    "    at BrokenComponent (UITest.js:28)"
  );
};

/* ============================================================================
 * CONSTANTS
 * ============================================================================
 */
const DROPDOWN_OPTIONS = [
  { value: 'react',   label: 'React'   },
  { value: 'vue',     label: 'Vue'     },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte',  label: 'Svelte'  },
];

/* ============================================================================
 * UI TEST PAGE
 * ============================================================================
 * Developer-only design system gallery — accessible at /ui-test only.
 * Showcases all Components.css styles and reusable custom components.
 * ============================================================================
 */
const UITest = () => {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState(null);
  const [errorDemoActive, setErrorDemoActive] = useState(false);
  const [errorDemoKey, setErrorDemoKey] = useState(0);

  return (
    <div className={styles.page}>
      {/* ──────────────── MAIN ──────────────── */}
      <main className={styles.main}>

        {/* ═══════════════════════════════════════════
            SECTION: TYPOGRAPHY
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Typography</h6>
          <div className={styles.sectionBody}>
            <h1>Heading 1 — Display</h1>
            <h2>Heading 2 — Section</h2>
            <h3>Heading 3 — Subsection</h3>
            <h4>Heading 4 — Component title</h4>
            <h5>Heading 5 — Label heading</h5>
            <h6>Heading 6 — Caption / overline</h6>
            <hr />
            <p>
              Body text. <strong>Strong emphasis</strong>, <em>italic emphasis</em>, and{' '}
              <a href="#ui-test">inline links</a> that adapt to the current theme.
              Long-form prose reads at 1.75 line-height with <mark>highlighted text</mark>,{' '}
              <abbr title="Abbreviation Title">abbr</abbr>, and other inline elements
              integrated naturally.
            </p>
            <p>
              Inline code: <code>const x = useTheme()</code>. Keyboard shortcut:{' '}
              <kbd>Ctrl</kbd> + <kbd>K</kbd>. Output display: <output>42</output>.
            </p>
            <blockquote>
              A blockquote is styled with a left accent border and a subtle tinted background,
              rendering secondary contextual text clearly.
            </blockquote>
            <ul>
              <li>Unordered list item one</li>
              <li>Unordered list item two</li>
              <li>Unordered list item three</li>
            </ul>
            <ol>
              <li>Ordered list item one</li>
              <li>Ordered list item two</li>
              <li>Ordered list item three</li>
            </ol>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION: BUTTONS — CSS VARIANTS
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Buttons — CSS Variants</h6>

          {/* Default states */}
          <div className={styles.componentRow}>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>primary</span>
              <button>Primary</button>
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>secondary</span>
              <button className="btn-secondary">Secondary</button>
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>outline</span>
              <button className="btn-outline">Outline</button>
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>ghost</span>
              <button className="btn-ghost">Ghost</button>
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>success</span>
              <button type="submit">Success</button>
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>danger</span>
              <button className="btn-danger">Danger</button>
            </div>
          </div>

          {/* Disabled states */}
          <div className={`${styles.componentRow} ${styles.mt}`}>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>primary · disabled</span>
              <button disabled>Primary</button>
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>secondary · disabled</span>
              <button className="btn-secondary" disabled>Secondary</button>
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>outline · disabled</span>
              <button className="btn-outline" disabled>Outline</button>
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>ghost · disabled</span>
              <button className="btn-ghost" disabled>Ghost</button>
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>success · disabled</span>
              <button type="submit" disabled>Success</button>
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>danger · disabled</span>
              <button className="btn-danger" disabled>Danger</button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION: BUTTONS — CUSTOM COMPONENTS
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Buttons — Custom Components</h6>
          <div className={styles.componentRow}>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>CursorGlowButton</span>
              <CursorGlowButton>Cursor Glow</CursorGlowButton>
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>MagneticButton</span>
              <MagneticButton>Magnetic</MagneticButton>
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>GhostButton (LightWave)</span>
              <GhostButton>Light Wave</GhostButton>
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>CursorGlowButton · disabled</span>
              <CursorGlowButton disabled>Disabled</CursorGlowButton>
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>MagneticButton · disabled</span>
              <MagneticButton disabled>Disabled</MagneticButton>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION: FORM INPUTS
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Form Inputs</h6>

          <div className={styles.formGrid}>
            <div className="input-container">
              <label>Text input</label>
              <input type="text" placeholder="Enter text…" />
            </div>
            <div className="input-container">
              <label>Text · disabled</label>
              <input type="text" defaultValue="Disabled value" disabled readOnly />
            </div>
            <div className="input-container">
              <label>Email</label>
              <input type="email" placeholder="user@example.com" />
            </div>
            <PasswordInput
              label="Password"
              id="ui-test-password"
              placeholder="••••••••"
            />
            <div className="input-container">
              <label>Number</label>
              <input type="number" placeholder="0" />
            </div>
            <div className="input-container">
              <label>Required field</label>
              <input type="text" placeholder="Required…" required />
            </div>
            <div className="input-container">
              <label>Select</label>
              <select defaultValue="">
                <option value="" disabled>Choose option…</option>
                <option value="a">Option A</option>
                <option value="b">Option B</option>
                <option value="c">Option C</option>
              </select>
            </div>
            <div className="input-container">
              <label>Select · disabled</label>
              <select disabled defaultValue="x">
                <option value="x">Disabled select</option>
              </select>
            </div>
            <div className="input-container">
              <label>Date</label>
              <input type="date" />
            </div>
            <div className="input-container">
              <label>File upload</label>
              <input type="file" />
            </div>
          </div>

          {/* Textarea */}
          <div className={`input-container ${styles.mt}`}>
            <label>Textarea</label>
            <textarea placeholder="Enter a longer message…" rows={4} />
          </div>

          {/* Checkboxes */}
          <div className={`${styles.componentRow} ${styles.mt}`}>
            <label>
              <input type="checkbox" /> Unchecked
            </label>
            <label>
              <input type="checkbox" defaultChecked /> Checked
            </label>
            <label>
              <input type="checkbox" disabled /> Disabled
            </label>
            <label>
              <input type="checkbox" defaultChecked disabled /> Checked · disabled
            </label>
          </div>

          {/* Radio buttons */}
          <div className={`${styles.componentRow} ${styles.mtSm}`}>
            <label>
              <input type="radio" name="demo-radio" defaultChecked /> Option A
            </label>
            <label>
              <input type="radio" name="demo-radio" /> Option B
            </label>
            <label>
              <input type="radio" name="demo-radio" disabled /> Disabled
            </label>
          </div>

          {/* Range slider */}
          <div className={`input-container ${styles.mt}`}>
            <label>Range slider</label>
            <input type="range" min="0" max="100" defaultValue="40" />
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION: FIELDSET
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Fieldset & Legend</h6>
          <fieldset>
            <legend>Personal details</legend>
            <div className={styles.formGrid}>
              <div className="input-container">
                <label>First name</label>
                <input type="text" placeholder="Jane" />
              </div>
              <div className="input-container">
                <label>Last name</label>
                <input type="text" placeholder="Doe" />
              </div>
              <div className="input-container">
                <label>Email</label>
                <input type="email" placeholder="jane@example.com" />
              </div>
            </div>
          </fieldset>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION: INPUT GROUP
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Input Group</h6>
          <div className={styles.narrowBlock}>
            <div className="input-group">
              <input type="text" placeholder="Search…" className={styles.flexFill} />
              <button className="btn-secondary">Search</button>
            </div>
            <div className={`input-group ${styles.mt}`}>
              <input type="email" placeholder="email@example.com" className={styles.flexFill} />
              <button type="submit">Subscribe</button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION: TABLE
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Table</h6>
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Type</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tooltip</td>
                <td><code>React</code></td>
                <td>Stable</td>
                <td>Portal-based, smart positioning</td>
              </tr>
              <tr>
                <td>Modal</td>
                <td><code>React</code></td>
                <td>Stable</td>
                <td>Focus management, ESC dismissible</td>
              </tr>
              <tr>
                <td>Toast</td>
                <td><code>Context</code></td>
                <td>Stable</td>
                <td>Auto-dismiss, 4 types</td>
              </tr>
              <tr>
                <td>SearchableDropdown</td>
                <td><code>react-select</code></td>
                <td>Stable</td>
                <td>Theme-aware, portal menu</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION: CODE BLOCK
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Code Block</h6>
          <pre><code>{`const { triggerProps, TooltipPortal } = useTooltip();

return (
  <>
    <span {...triggerProps}>Hover me</span>
    <TooltipPortal>Tooltip content</TooltipPortal>
  </>
);`}</code></pre>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION: PROGRESS & METER
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Progress & Meter</h6>
          <div className={styles.sectionBody}>
            <div className={styles.meterRow}>
              <label>Progress — 65%</label>
              <progress value="65" max="100" />
            </div>
            <div className={styles.meterRow}>
              <label>Progress — 30%</label>
              <progress value="30" max="100" />
            </div>
            <div className={styles.meterRow}>
              <label>Meter — optimum</label>
              <meter value="0.75" min="0" max="1" low="0.25" high="0.60" optimum="0.9" />
            </div>
            <div className={styles.meterRow}>
              <label>Meter — sub-optimum</label>
              <meter value="0.45" min="0" max="1" low="0.25" high="0.60" optimum="0.9" />
            </div>
            <div className={styles.meterRow}>
              <label>Meter — low</label>
              <meter value="0.1" min="0" max="1" low="0.25" high="0.60" optimum="0.9" />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION: DETAILS & SUMMARY
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Details & Summary</h6>
          <details>
            <summary>Collapsed — click to expand</summary>
            <p className={styles.detailsBody}>
              Revealed content sits inside the <code>details</code> element. The summary
              receives the themed hover and transition states on open/close.
            </p>
          </details>
          <details open className={styles.mt}>
            <summary>Pre-opened details element</summary>
            <p className={styles.detailsBody}>
              This element starts in the <code>open</code> state, showing the rotated
              chevron and the accent border highlight from Components.css.
            </p>
          </details>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION: TOOLTIP
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Tooltip</h6>
          <div className={styles.componentRow}>
            <Tooltip heading="With heading & body" content="This tooltip has both a heading and body text.">
              <button className="btn-secondary">Heading + Body</button>
            </Tooltip>
            <Tooltip content="A tooltip with only body content and no heading.">
              <button className="btn-secondary">Body Only</button>
            </Tooltip>
            <Tooltip heading="Heading only">
              <button className="btn-secondary">Heading Only</button>
            </Tooltip>
            <Tooltip
              heading="Long content"
              content="Tooltips handle longer content gracefully, wrapping text within the max-width constraint and using pre-line white-space."
            >
              <button className="btn-secondary">Long Content</button>
            </Tooltip>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION: TOAST NOTIFICATIONS
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Toast Notifications</h6>
          <div className={styles.componentRow}>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>success</span>
              <button
                type="submit"
                onClick={() => showToast('success', 'Success', 'Action completed successfully.')}
              >
                Trigger Success
              </button>
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>error</span>
              <button
                className="btn-danger"
                onClick={() => showToast('error', 'Error', 'Something went wrong.', 'ERR_500')}
              >
                Trigger Error
              </button>
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>warning</span>
              <button
                onClick={() => showToast('warning', 'Warning', 'Proceed with caution.')}
              >
                Trigger Warning
              </button>
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>info</span>
              <button
                className="btn-secondary"
                onClick={() => showToast('info', 'Info', 'Here is some useful information.')}
              >
                Trigger Info
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION: MODAL
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Modal</h6>
          <p className={styles.sectionDescription}>
            Liquid-glass modal. Closes via the ✕ button, <kbd>Esc</kbd>, or a
            backdrop click. Focus is trapped inside while open and restored on close.
          </p>
          <div className={styles.componentRow}>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>with title</span>
              <button onClick={() => setModalOpen(true)}>Open Modal</button>
            </div>
          </div>

          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Liquid Glass Modal"
          >
            <p>
              This modal uses a <strong>frosted-glass</strong> surface — backed by{' '}
              <code>backdrop-filter: blur</code> and the theme-aware{' '}
              <code>--frosted-background</code> variable — so it adapts seamlessly
              between light and dark modes.
            </p>
            <p>
              Dismiss it with the ✕ button in the top-right corner, by pressing{' '}
              <kbd>Esc</kbd>, or by clicking the dimmed backdrop outside.
            </p>
            <div className={styles.modalActions}>
              <button type="submit" onClick={() => setModalOpen(false)}>
                Got it
              </button>
            </div>
          </Modal>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION: SEARCHABLE DROPDOWN
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Searchable Dropdown</h6>
          <div className={styles.narrowBlock}>
            <SearchableDropdown
              options={DROPDOWN_OPTIONS}
              value={dropdownValue}
              onChange={setDropdownValue}
              placeholder="Select a framework…"
            />
            <div className={`${styles.mt}`}>
              <SearchableDropdown
                options={DROPDOWN_OPTIONS}
                value={null}
                onChange={() => {}}
                placeholder="Disabled dropdown"
                isDisabled
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION: UI CONTROLS
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>UI Controls</h6>
          <div className={styles.componentRow}>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>ThemeSwitch</span>
              <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
            </div>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>ReduceAnimationsSwitch</span>
              <ReduceAnimationsSwitch />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION: FIGURE
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Figure & Figcaption</h6>
          <figure>
            <div className={styles.figurePlaceholder} aria-hidden="true" />
            <figcaption>
              Figure caption — descriptive text rendered below a media element.
            </figcaption>
          </figure>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION: HORIZONTAL RULE
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Horizontal Rule</h6>
          <p>Content above the divider.</p>
          <hr />
          <p>
            Content below the divider. The rule uses a gradient fade from transparent
            on both ends, sourced entirely from <code>var(--border-color)</code>.
          </p>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION: ERROR BOUNDARY
        ═══════════════════════════════════════════ */}
        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Error Boundary</h6>
          <p className={styles.sectionDescription}>
            Mounts a full-screen error overlay when a child component throws.
            The "Reload Page" button is overridden here to dismiss the demo
            without reloading the page.
          </p>

          <div className={styles.componentRow}>
            <div className={styles.componentCell}>
              <span className={styles.stateTag}>trigger / reset</span>
              <button
                className="btn-danger"
                onClick={() => setErrorDemoActive(true)}
              >
                Trigger Error Boundary
              </button>
            </div>
          </div>

          {errorDemoActive && (
            <ErrorBoundary
              key={errorDemoKey}
              onReset={() => {
                setErrorDemoActive(false);
                setErrorDemoKey((k) => k + 1);
              }}
            >
              <BrokenComponent />
            </ErrorBoundary>
          )}
        </section>

      </main>
    </div>
  );
};

export default UITest;
