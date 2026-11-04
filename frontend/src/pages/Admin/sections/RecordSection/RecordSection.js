import { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDeleteOutline } from 'react-icons/md';
import { Modal, useToast, KebabMenu } from '../../../../components';
import Button from '../../../../components/Button';
import RecordForm from '../../parts/RecordForm';
import { SortableList, DragHandle } from '../../parts/Sortable';
import { ListSkeleton } from '../../parts/Skeletons';
import formStyles from '../../AdminForms.module.css';
import styles from './RecordSection.module.css';

// A drag-ordered list of records with an add and edit form in a modal.
const RecordSection = ({ title, tone, fields, subscribe, onCreate, onUpdate, onDelete, onReorder, renderSummary, openAddOnMount }) => {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState(openAddOnMount ? { mode: 'add' } : null);

  useEffect(() => subscribe(
    (rows) => { setRecords(rows); setLoaded(true); },
    () => { setLoaded(true); toast.error(`Failed to load ${title}`); },
  ), [subscribe, title, toast]);

  const closeModal = () => setModal(null);

  // Throws on failure so the form's Save button can shake.
  const handleSave = async (data) => {
    try {
      if (modal.mode === 'add') {
        await onCreate({ ...data, order: records.length });
        toast.success(`${title} entry added`);
      } else {
        await onUpdate(modal.record.id, data);
        toast.success(`${title} entry updated`);
      }
    } catch (err) {
      toast.error(`Failed to save ${title} entry`);
      throw err;
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
      <div className={formStyles.listHead}>
        <p className={formStyles.hint}>
          {records.length > 1 ? 'Click an entry to edit it. Drag the handle to reorder.' : `${records.length} ${records.length === 1 ? 'entry' : 'entries'}`}
        </p>
        <Button variant="primary" tone={tone} size="sm" icon={<MdAdd />} onClick={() => setModal({ mode: 'add' })}>
          Add
        </Button>
      </div>

      {records.length === 0 && <p className={formStyles.empty}>No {title.toLowerCase()} entries yet.</p>}

      <SortableList className={styles.list} items={records} getId={r => r.id} onReorder={handleReorder} itemClassName={formStyles.listRow}>
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
            onSaved={closeModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default RecordSection;
