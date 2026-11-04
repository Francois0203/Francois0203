import { useState, useEffect, useRef } from 'react';
import { subscribeInterests, updateInterests, subscribePersonal, updatePersonal } from '../../../../firebase/admin';
import { useToast } from '../../../../components';
import TagInput from '../../parts/TagInput';
import useUnsaved from '../../hooks/useUnsaved';
import { FormSkeleton } from '../../parts/Skeletons';
import Button from '../../../../components/Button';
import useAsyncAction from '../../../../hooks/useAsyncAction';
import SaveBar from '../../parts/SaveBar';
import formStyles from '../../AdminForms.module.css';
import styles from './InterestsSection.module.css';

const InterestsSection = () => {
  const { toast } = useToast();
  const [items, setItems]   = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [onCv, setOnCv]     = useState(true);
  const [dirty, setDirty]   = useState(false);
  const dirtyRef = useRef(false);
  useUnsaved(dirty);

  useEffect(() => {
    // An incoming snapshot never overwrites edits that are not saved yet.
    const unsubI = subscribeInterests(
      data => { if (!dirtyRef.current) setItems(data); setLoaded(true); },
      () => { setLoaded(true); toast.error('Failed to load interests'); },
    );
    // The switch is stored with the personal details, as cvInterests.
    const unsubP = subscribePersonal(d => { if (!dirtyRef.current) setOnCv(d?.cvInterests !== false); }, () => {});
    return () => { unsubI(); unsubP(); };
  }, [toast]);

  const touch = () => { dirtyRef.current = true; setDirty(true); };

  const save = useAsyncAction(async () => {
    try {
      await Promise.all([updateInterests(items), updatePersonal({ cvInterests: onCv })]);
      dirtyRef.current = false;
      setDirty(false);
      toast.success('Interests updated');
    } catch (err) {
      toast.error('Failed to save interests');
      throw err;
    }
  });


  if (!loaded) return <FormSkeleton />;

  return (
    <div className={styles.root}>
      <div className="input-container">
        <label htmlFor="interests-input">Interests</label>
        <TagInput
          id="interests-input"
          value={items}
          onChange={next => { touch(); setItems(next); }}
          placeholder="Add an interest, e.g. Photography"
        />
      </div>

      <label className={formStyles.toggleRow}>
        <input type="checkbox" checked={onCv} onChange={e => { touch(); setOnCv(e.target.checked); }} />
        <span><strong>Show interests on the printed CV</strong></span>
      </label>

      <SaveBar save={save} dirty={dirty} label="Save interests" />
    </div>
  );
};

export default InterestsSection;
