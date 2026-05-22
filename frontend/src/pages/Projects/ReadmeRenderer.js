import ReactMarkdown from 'react-markdown';
import remarkGfm     from 'remark-gfm';
import rehypeRaw     from 'rehype-raw';
import styles        from './ReadmeRenderer.module.css';

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
      {markdown}
    </ReactMarkdown>
  </div>
);

export default ReadmeRenderer;
