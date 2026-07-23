import React, { useState, useEffect } from 'react';
import { subscribeMessages, deleteMessage } from '../../../firebase/admin';
import { useToast } from '../../../components';
import styles from '../Admin.module.css';
import formStyles from '../AdminForms.module.css';

const fmt = (ts) => {
  if (!ts) return '-';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString();
};

const MessagesSection = () => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    return subscribeMessages(
      setMessages,
      () => showToast('error', 'Error', 'Failed to load messages'),
    );
  }, [showToast]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteMessage(id);
      showToast('success', 'Deleted', 'Message removed');
    } catch {
      showToast('error', 'Error', 'Failed to delete message');
    }
  };

  return (
    <div>
      {messages.length === 0 && <p className={styles.empty}>No messages yet.</p>}

      {messages.map(m => (
        <div key={m.id} className={formStyles.messageCard}>
          <div className={formStyles.messageHeader}>
            <div>
              <strong>{m.name}</strong>
              <a href={`mailto:${m.email}`} className={formStyles.email}>{m.email}</a>
            </div>
            <div className={formStyles.listRowActions}>
              <span className={formStyles.meta}>{fmt(m.createdAt)}</span>
              <button type="button" className="btn-danger" onClick={() => handleDelete(m.id)}>Delete</button>
            </div>
          </div>
          <p className={formStyles.messageBody}>{m.message}</p>
        </div>
      ))}
    </div>
  );
};

export default MessagesSection;
