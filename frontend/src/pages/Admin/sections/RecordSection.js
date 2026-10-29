import React, { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDeleteOutline } from 'react-icons/md';
import { Modal, useToast, KebabMenu } from '../../../components';
import RecordForm from './RecordForm';
import { SortableList, DragHandle } from './Sortable';
import styles from '../Admin.module.css';
import { ListSkeleton } from './Skeletons';
import formStyles from '../AdminForms.module.css';

const RecordSection = ({ title, fields, subscribe, onCreate, onUpdate, onDelete, onReorder, renderSummary, openAddOnMount }) => {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal]     = useState(openAddOnMount ? { mode: 'add' } : null);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    return subscribe(
      (rows) => { setRecords(rows); setLoaded(true); },
      () => { setLoaded(true); toast.error(`Failed to load ${title}`); },
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

  if (!loaded) return <ListSkeleton />;

  return (
    <div>
      <div className={styles.sectionHeader}>
        <p className={styles.hint}>
          {records.length > 1 ? 'Click an entry to edit it. Drag the handle to reorder.' : `${records.length} ${records.length === 1 ? 'entry' : 'entries'}`}
        </p>
        <button type="button" className="btn-primary" onClick={() => setModal({ mode: 'add' })}>
          <MdAdd aria-hidden="true" /> Add
        </button>
      </div>

      {records.length === 0 && (
        <p className={styles.empty}>No {title.toLowerCase()} entries yet.</p>
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
            <button type="button" className={formStyles.listRowContent} onClick={() => setModal({ mode: 'edit', record: rec })}>
              {renderSummary(rec)}
              {rec.showOnCv === false && <span className={formStyles.notOnCv}>not on CV</span>}
              {rec.showOnHome === false && <span className={formStyles.notOnCv}>not on home</span>}
            </button>
            <KebabMenu
              ariaLabel={`Options for ${title.toLowerCase()} entry ${i + 1}`}
              items={[
                { label: 'Edit', icon: <MdEdit />, onSelect: () => setModal({ mode: 'edit', record: rec }) },
                { label: 'Delete', icon: <MdDeleteOutline />, danger: true, onSelect: () => handleDelete(rec) },
              ]}
            />
          </>
        )}
      </SortableList>

      <Modal
        open={!!modal}
        onClose={closeModal}
        title={modal?.mode === 'add' ? `Add ${title}` : `Edit ${title}`}
        size="lg"
        className="admin-modal"
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
