import { createElement } from 'react';
import styles from './Headline.module.css';

const parseAccent = (text = '') => {
  const out = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), em: false });
    out.push({ text: m[1], em: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), em: false });
  return out;
};

const SWOOSH = 'M2 9 C 25 5, 60 12, 98 6';

// Two-voice headline: the *asterisked* phrase gets a hand-drawn marker stroke in `tone`.
const Headline = ({ as = 'h2', text = '', className = '', start = 0, step, tone = 'yellow', ...rest }) => {
  const segments = parseAccent(text);
  const children = [];
  let i = start;

  segments.forEach((seg, s) => {
    const words = seg.text.split(/(\s+)/);
    const group = [];
    words.forEach((w, k) => {
      if (!w) return;
      if (/^\s+$/.test(w)) { group.push(' '); return; }
      const inner = createElement(seg.em ? 'em' : 'span', { style: { '--i': i }, key: `${s}-${k}` }, w);
      group.push(<span className="mask" key={`m${s}-${k}`}>{inner}</span>);
      i += 1;
    });

    if (!seg.em) { children.push(...group); return; }

    const lead = group[0] === ' ' ? group.shift() : null;
    const tail = group[group.length - 1] === ' ' ? group.pop() : null;
    if (lead) children.push(lead);
    children.push(
      <span key={`e${s}`} className={styles.marked} style={{ '--marker': `var(--c-${tone})`, '--mi': i }}>
        {group}
        <svg className={styles.squiggle} viewBox="0 0 100 16" preserveAspectRatio="none" aria-hidden="true">
          <path d={SWOOSH} />
        </svg>
      </span>,
    );
    if (tail) children.push(tail);
  });

  const style = step ? { '--step': step, ...rest.style } : rest.style;
  return createElement(as, { ...rest, className, style }, children);
};

export default Headline;
