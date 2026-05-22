// ─── Badge / decorative service detection ────────────────────────────────────

const BADGE_HOSTS = /shields\.io|badgen\.net|badge\.fury|forthebadge|travis-ci|circleci|coveralls|sonarcloud|codecov|snyk\.io|dependabot|capsule-render|readme-typing-svg|skillicons\.dev|github-readme-stats|streak-stats|demolab\.com|wakatime|visitor-badge|hits\.seeyoufarm|github\.com\/.*\/workflows|raw\.githubusercontent\.com\/.*\/badge/i;

function isBadgeUrl(url) {
  return BADGE_HOSTS.test(url);
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────

// Returns true if a line is purely an HTML block with no readable text
function isDecorativeLine(line) {
  const noTags = line.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, '').trim();
  return noTags.length === 0;
}

// Strips all HTML tags and common entities from a string
function stripHtml(text) {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extracts src values from HTML <img> tags
function htmlImageSrcs(line) {
  const re = /src=["']([^"']+)["']/g;
  const srcs = [];
  let m;
  while ((m = re.exec(line)) !== null) srcs.push(m[1]);
  return srcs;
}

// ─── Markdown helpers ─────────────────────────────────────────────────────────

function stripMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g,     '$1')
    .replace(/__(.+?)__/g,     '$1')
    .replace(/_(.+?)_/g,       '$1')
    .replace(/`(.+?)`/g,       '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function stripLeadingEmoji(text) {
  return text.replace(/^[-￿]+\s*/, '').trim();
}

function extractListItems(content) {
  return content
    .split('\n')
    .filter(l => /^\s*[-*+]\s+\S/.test(l) || /^\s*\d+\.\s+\S/.test(l))
    .map(l => stripLeadingEmoji(stripMarkdown(l.replace(/^\s*[-*+\d.]+\s+/, '')).trim()))
    .filter(Boolean);
}

// Handles lines like: "React · Node.js · PostgreSQL · Redis"
function extractDotSeparated(content) {
  const results = [];
  for (const line of content.split('\n')) {
    const clean = stripHtml(stripMarkdown(line)).trim();
    if (clean.includes('·') || clean.includes('•')) {
      const parts = clean.split(/[·•]/).map(p => p.trim()).filter(Boolean);
      results.push(...parts);
    }
  }
  return results;
}

// Finds the first non-badge image URL in content (markdown OR HTML img tags)
function extractFirstNonBadgeImage(content) {
  // Markdown images: ![alt](url)
  const mdRe = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let m;
  while ((m = mdRe.exec(content)) !== null) {
    const [, alt, url] = m;
    if (isBadgeUrl(url)) continue;
    if (/badge|shield|logo|icon/i.test(alt)) continue;
    if (url.endsWith('.svg') && !/screenshot|demo|preview|banner|hero/i.test(url + alt)) continue;
    return url;
  }
  // HTML img tags: <img src="...">
  const htmlRe = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((m = htmlRe.exec(content)) !== null) {
    const url = m[1];
    if (isBadgeUrl(url)) continue;
    if (url.endsWith('.svg')) continue;
    return url;
  }
  return null;
}

function resolveImageUrl(src, owner, repo) {
  if (!src || src.startsWith('http')) return src ?? null;
  const path = src.replace(/^\.?\//, '');
  return `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
}

// Splits markdown into sections: [{ level, heading, content }]
function parseSections(markdown) {
  const sections = [];
  let current = null;
  for (const line of markdown.split('\n')) {
    const hm = line.match(/^(#{1,4})\s+(.+)/);
    if (hm) {
      if (current) sections.push(current);
      current = {
        level:   hm[1].length,
        heading: stripLeadingEmoji(stripMarkdown(hm[2]).trim()),
        content: '',
      };
    } else if (current) {
      current.content += line + '\n';
    }
  }
  if (current) sections.push(current);
  return sections;
}

function findSection(sections, pattern) {
  return sections.find(s => pattern.test(s.heading.trim()));
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Parses a README (markdown + HTML mix) into structured card data.
 *
 * @param {string} markdown  Raw README content
 * @param {object} opts      { owner, repo, fallback }
 * @returns {{ description, features, techStack, screenshot }}
 */
export function parseReadme(markdown, { owner = '', repo = '', fallback = '' } = {}) {
  if (!markdown?.trim()) {
    return { description: fallback, features: [], techStack: [], screenshot: null };
  }

  const lines = markdown.split('\n');

  // ── Description ──────────────────────────────────────────────────────────
  // Walk from the top, skip the h1 and any decorative HTML/badge lines,
  // collect the first real paragraph of prose text.
  const descParts = [];
  const skipTitle = /^#\s+/.test(lines[0] ?? '');

  for (let i = skipTitle ? 1 : 0; i < lines.length; i++) {
    const raw  = lines[i];
    const line = raw.trim();

    if (!line) {
      if (descParts.length > 0) break;
      continue;
    }

    // Stop at any heading
    if (/^#{1,6}\s/.test(line)) break;

    // Pure HTML block with nothing inside — decorative, skip
    if (isDecorativeLine(line)) continue;

    // Lines that are only badge/image links — skip
    if (/^\[!\[/.test(line)) continue;

    // Markdown images — skip if badge host
    if (/^!\[/.test(line)) {
      const srcs = htmlImageSrcs(line);
      if (srcs.length === 0 || srcs.every(isBadgeUrl)) continue;
    }

    // HTML img tag lines — skip if all srcs are badge hosts
    if (/<img/i.test(line)) {
      const srcs = htmlImageSrcs(line);
      if (srcs.length === 0 || srcs.every(isBadgeUrl)) continue;
    }

    // Strip HTML and markdown, use remaining text
    const text = stripMarkdown(stripHtml(line)).trim();
    if (!text || text.length < 4) continue;

    // Stop if we hit a list item (that belongs to features, not description)
    if (/^[-*+]\s|^\d+\.\s/.test(text)) break;

    descParts.push(text);
  }

  let description = descParts.length > 0
    ? descParts.join(' ')
    : fallback;

  // ── Sections ──────────────────────────────────────────────────────────────
  const sections = parseSections(markdown);

  // If no description found at the top level, try the first "About" section
  if (!description && !fallback) {
    const aboutSec = findSection(sections,
      /^(about( me)?|overview|introduction|summary|profile)$/i
    );
    if (aboutSec) {
      const prose = aboutSec.content
        .split('\n')
        .filter(l => {
          const t = l.trim();
          return t && !isDecorativeLine(t) && !/^#{1,6}\s/.test(t) && !/^[-*+]\s|^\d+\./.test(t);
        })
        .map(l => stripMarkdown(stripHtml(l)).trim())
        .filter(Boolean)
        .slice(0, 3)
        .join(' ');
      description = prose;
    }
  }

  // ── Features ──────────────────────────────────────────────────────────────
  // Primary: dedicated section
  const featSec = findSection(sections,
    /^(features?|highlights?|what (it |this )?(does|is|offers)|key features?|capabilities|what.?s included)$/i
  );
  let features = featSec
    ? extractListItems(featSec.content).slice(0, 4)
    : [];

  // Fallback: first meaningful list inside "About Me" / "Overview"
  if (features.length === 0) {
    const aboutSec = findSection(sections,
      /^(about( me)?|overview|introduction|summary|profile)$/i
    );
    if (aboutSec) {
      features = extractListItems(aboutSec.content).slice(0, 4);
    }
  }

  // Second fallback: first list anywhere in the top portion of the document
  if (features.length === 0) {
    const topContent = lines.slice(0, 80).join('\n');
    features = extractListItems(topContent).slice(0, 4);
  }

  // ── Tech stack ────────────────────────────────────────────────────────────
  // Primary: dedicated section (list items + dot-separated lines)
  const techSec = findSection(sections,
    /^(tech(nolog(ies|y))?( stack)?|stack|built[\s-]?with|tools?( used)?|requirements?|prerequisites?|dependencies|frameworks?|libraries( used)?|technical skills?|skills?( &| and)? tools?|languages?( &| and)? tools?|skills( overview)?)$/i
  );

  let techStack = [];
  if (techSec) {
    const fromList = extractListItems(techSec.content)
      .map(item => stripMarkdown(item.split(/[-–—:·|]/)[0]).trim())
      .filter(Boolean);
    const fromDots = extractDotSeparated(techSec.content);
    techStack = [...new Set([...fromList, ...fromDots])].slice(0, 10);
  }

  // Fallback: dot-separated items in a "Focus" or last section
  if (techStack.length === 0) {
    const focusSec = findSection(sections, /^(focus|summary|skills|expertise)$/i);
    if (focusSec) {
      techStack = extractDotSeparated(focusSec.content).slice(0, 10);
    }
  }

  // Remove items that are clearly not tech (too long, look like sentences)
  techStack = techStack
    .filter(t => t.length > 0 && t.length < 40 && !/\.$/.test(t))
    .slice(0, 10);

  // ── Screenshot ────────────────────────────────────────────────────────────
  const screenshotSec = findSection(sections,
    /screenshot|demo|preview|gallery|showcase|example|output|result/i
  );
  const rawImg = extractFirstNonBadgeImage(
    (screenshotSec?.content ?? '') || markdown
  );
  const screenshot = rawImg ? resolveImageUrl(rawImg, owner, repo) : null;

  return { description, features, techStack, screenshot };
}
