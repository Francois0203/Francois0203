import React, { useState, useEffect } from 'react';
import { subscribeMessages, deleteMessage } from '../../../firebase/admin';
import { MdDeleteOutline, MdReply } from 'react-icons/md';
import { useToast, KebabMenu } from '../../../components';
import styles from '../Admin.module.css';
import formStyles from '../AdminForms.module.css';

const fmt = (ts) => {
  if (!ts) return '-';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString();
};

const MessagesSection = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    return subscribeMessages(
      setMessages,
      () => toast.error('Failed to load messages'),
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

  return (
    <div>
      {messages.length === 0 && <p className={styles.empty}>No messages yet.</p>}

      {messages.map(m => (
        <div key={m.id} className={formStyles.messageCard}>
          <div className={formStyles.messageHeader}>
            <div>
              <span className={formStyles.rowTitle}>{m.name}</span>
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
        </div>
      ))}
    </div>
  );
};

export default MessagesSection;
