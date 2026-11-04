import { useState, useEffect } from 'react';
import { subscribeMessages, deleteMessage } from '../../../../firebase/admin';
import { MdDeleteOutline, MdReply } from 'react-icons/md';
import { useToast, KebabMenu } from '../../../../components';
import { ListSkeleton } from '../../parts/Skeletons';
import formStyles from '../../AdminForms.module.css';
import styles from './MessagesSection.module.css';

const fmt = (ts) => {
  if (!ts) return '-';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString();
};

const MessagesSection = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    return subscribeMessages(
      (rows) => { setMessages(rows); setLoaded(true); },
      () => { setLoaded(true); toast.error('Failed to load messages'); },
    );
  }, [toast]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteMessage(id);
      toast.success('Message removed');
    } catch {
      toast.error('Failed to delete message');
    }
  };

  if (!loaded) return <ListSkeleton />;

  return (
    <div className={styles.inbox}>
      {messages.length === 0 && <p className={formStyles.empty}>No messages yet.</p>}

      {messages.map(m => (
        <article key={m.id} className={formStyles.messageCard}>
          <div className={formStyles.messageHeader}>
            <div>
              <span className={formStyles.rowTitle}>
                <span className={styles.avatar} aria-hidden="true">{String(m.name || '?').trim().charAt(0).toUpperCase()}</span>
                {m.name}
              </span>
              <a href={`mailto:${m.email}`} className={formStyles.email}>{m.email}</a>
            </div>
            <div className={formStyles.listRowActions}>
              <span className={formStyles.meta}>{fmt(m.createdAt)}</span>
              <KebabMenu
                ariaLabel={`Options for the message from ${m.name}`}
                items={[
                  { label: 'Reply by email', icon: <MdReply />, onSelect: () => { window.location.href = `mailto:${m.email}`; } },
                  { label: 'Delete', icon: <MdDeleteOutline />, danger: true, onSelect: () => handleDelete(m.id) },
                ]}
              />
            </div>
          </div>
          <p className={formStyles.messageBody}>{m.message}</p>
        </article>
      ))}
    </div>
  );
};

export default MessagesSection;
