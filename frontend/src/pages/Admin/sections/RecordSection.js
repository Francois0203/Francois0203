import React, { useState, useEffect } from 'react';
import { Modal, useToast } from '../../../components';
import RecordForm from './RecordForm';
import { SortableList, DragHandle } from './Sortable';
import styles from '../Admin.module.css';
import formStyles from '../AdminForms.module.css';

const RecordSection = ({ title, fields, subscribe, onCreate, onUpdate, onDelete, onReorder, renderSummary, openAddOnMount }) => {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [modal, setModal]     = useState(openAddOnMount ? { mode: 'add' } : null);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    return subscribe(
      setRecords,
      () => toast.error(`Failed to load ${title}`),
    );
  }, [subscribe, title, toast]);

  const closeModal = () => setModal(null);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (modal.mode === 'add') {
        await onCreate({ ...data, order: records.length });
        toast.success(`${title} entry added`);
      } else {
        await onUpdate(modal.record.id, data);
        toast.success(`${title} entry updated`);
      }
      closeModal();
    } catch {
      toast.error(`Failed to save ${title} entry`);
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (next) => {
    const before = records;
    setRecords(next);
    try {
      await onReorder(next.map(r => r.id));
    } catch {
      setRecords(before);
      toast.error(`Failed to save the ${title.toLowerCase()} order`);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete this ${title} entry?`)) return;
    try {
      await onDelete(record.id);
      toast.success(`${title} entry removed`);
    } catch {
      toast.error(`Failed to delete ${title} entry`);
    }
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <button type="button" className="btn-success" onClick={() => setModal({ mode: 'add' })}>
          + Add Entry
        </button>
      </div>

      {records.length === 0 && (
        <p className={styles.empty}>No {title.toLowerCase()} entries yet.</p>
      )}

      {records.length > 1 && (
        <p className={styles.hint}>Drag the handle to change the order. It saves as you drop.</p>
      )}

      <SortableList
        items={records}
        getId={r => r.id}
        onReorder={handleReorder}
        itemClassName={formStyles.listRow}
      >
        {(rec, i, handle) => (
          <>
            <DragHandle {...handle} label={`Move ${title.toLowerCase()} entry ${i + 1}`} />
            <div className={formStyles.listRowContent}>{renderSummary(rec)}</div>
            <div className={formStyles.listRowActions}>
              <button type="button" className="btn-outline" onClick={() => setModal({ mode: 'edit', record: rec })}>Edit</button>
              <button type="button" className="btn-danger" onClick={() => handleDelete(rec)}>Delete</button>
            </div>
          </>
        )}
      </SortableList>

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
