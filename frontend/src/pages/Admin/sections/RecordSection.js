import React, { useState, useEffect } from 'react';
import { Modal, useToast } from '../../../components';
import RecordForm from './RecordForm';
import styles from '../Admin.module.css';
import formStyles from '../AdminForms.module.css';

const RecordSection = ({ title, fields, subscribe, onCreate, onUpdate, onDelete, renderSummary }) => {
  const { showToast } = useToast();
  const [records, setRecords] = useState([]);
  const [modal, setModal]     = useState(null);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    return subscribe(
      setRecords,
      () => showToast('error', 'Error', `Failed to load ${title}`),
    );
  }, [subscribe, title, showToast]);

  const closeModal = () => setModal(null);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (modal.mode === 'add') {
        await onCreate(data);
        showToast('success', 'Created', `${title} entry added`);
      } else {
        await onUpdate(modal.record.id, data);
        showToast('success', 'Updated', `${title} entry updated`);
      }
      closeModal();
    } catch {
      showToast('error', 'Error', `Failed to save ${title} entry`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete this ${title} entry?`)) return;
    try {
      await onDelete(record.id);
      showToast('success', 'Deleted', `${title} entry removed`);
    } catch {
      showToast('error', 'Error', `Failed to delete ${title} entry`);
    }
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <button type="button" className="btn-outline" onClick={() => setModal({ mode: 'add' })}>
          + Add Entry
        </button>
      </div>

      {records.length === 0 && (
        <p className={styles.empty}>No {title.toLowerCase()} entries yet.</p>
      )}

      {records.map(rec => (
        <div key={rec.id} className={formStyles.listRow}>
          <div className={formStyles.listRowContent}>{renderSummary(rec)}</div>
          <div className={formStyles.listRowActions}>
            <button type="button" onClick={() => setModal({ mode: 'edit', record: rec })}>Edit</button>
            <button type="button" className="btn-danger" onClick={() => handleDelete(rec)}>Delete</button>
          </div>
        </div>
      ))}

      <Modal
        open={!!modal}
        onClose={closeModal}
        title={modal?.mode === 'add' ? `Add ${title}` : `Edit ${title}`}
        size="lg"
      >
        {modal && (
          <RecordForm
            fields={fields}
            initial={modal.record ?? {}}
            onSave={handleSave}
            onCancel={closeModal}
            saving={saving}
          />
        )}
      </Modal>
    </div>
  );
};

export default RecordSection;
