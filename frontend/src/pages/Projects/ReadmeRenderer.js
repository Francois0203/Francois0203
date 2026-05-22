import ReactMarkdown from 'react-markdown';
import remarkGfm     from 'remark-gfm';
import rehypeRaw     from 'rehype-raw';
import styles        from './ReadmeRenderer.module.css';

// Strips the Table of Contents section (heading + list) from markdown.
function stripToc(md) {
  const tocHeading = /^#{1,4}\s+(table[\s-]+of[\s-]+contents|contents|toc|index)\s*$/i;
  const anyHeading = /^#{1,4}\s+/;
  let inToc = false;
  const out = [];
  for (const line of md.split('\n')) {
    if (tocHeading.test(line.trim())) { inToc = true; continue; }
    if (inToc && anyHeading.test(line)) { inToc = false; }
    if (!inToc) out.push(line);
  }
  return out.join('\n');
}

// Detects paragraphs that contain only images (badge rows).
const isBadgeRow = (node) => {
  if (!node?.children) return false;
  return node.children.every(child =>
    child.type === 'image' ||
    (child.type === 'link' && child.children?.every(c => c.type === 'image'))
  );
};

const ReadmeRenderer = ({ markdown }) => (
  <div className={styles.body}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        // Badge rows get a flex wrapper
        p({ node, children }) {
          if (isBadgeRow(node)) {
            return <div className={styles.badgeRow}>{children}</div>;
          }
          return <p>{children}</p>;
        },
      }}
    >
      {stripToc(markdown)}
    </ReactMarkdown>
  </div>
);

export default ReadmeRenderer;
