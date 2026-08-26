import React, { useEffect, useState } from 'react';
import { subscribeStudioSites } from '../../../firebase/admin';
import { useToast } from '../../../components';
import styles from '../Admin.module.css';
import formStyles from '../AdminForms.module.css';

/*
 * Read-only on purpose: every field comes from the repo's own `.showcase.json`,
 * so an edit here would be overwritten by the next sync. This screen exists to
 * answer "why isn't my site showing up".
 */

const SOURCE_LABEL = {
  'showcase.json': '.showcase.json',
  homepage:        'GitHub homepage field',
  firebaserc:      '.firebaserc (derived)',
  none:            'nothing found',
};

const StudioSection = () => {
  const { showToast } = useToast();
  const [sites, setSites] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return subscribeStudioSites(
      (rows) => { setSites(rows); setReady(true); },
      () => { setReady(true); showToast('error', 'Error', 'Failed to load studio sites'); },
    );
  }, [showToast]);

  const withoutUrl = sites.filter(s => (s.sites?.length ?? 0) === 0);
  const unframeable = sites.filter(s => (s.sites ?? []).some(u => !u.embeddable));

  return (
    <div>
      <p className={styles.hint}>
        Synced from the <strong>FM-Web-Studio</strong> organisation by{' '}
        <code>scripts/syncStudioSites.mjs</code>. Read-only here - to change a name,
        tagline, order or which sites are featured, edit that repo&rsquo;s{' '}
        <code>.showcase.json</code> and re-run the sync (Actions &rarr; Sync GitHub
        Projects to Firestore &rarr; Run workflow).
      </p>

      {ready && sites.length > 0 && (
        <p className={styles.hint}>
          {sites.length} repo(s) synced
          {withoutUrl.length > 0 && ` · ${withoutUrl.length} with no live url`}
          {unframeable.length > 0 && ` · ${unframeable.length} that can't be embedded`}
        </p>
      )}

      {ready && sites.length === 0 && (
        <p className={styles.empty}>
          Nothing synced yet. Run the sync workflow, and check that the
          <code> GH_PAT</code> secret has <code>read:org</code> access.
        </p>
      )}

      {sites.map(s => {
        const urls = s.sites ?? [];
        return (
          <div key={s.id} className={formStyles.listRow}>
            <div className={formStyles.listRowContent}>
              <strong>
                {s.name}
                {s.featured && ' ★'}
              </strong>
              <span className={formStyles.meta}>
                {[
                  s.client,
                  `order ${s.order ?? '-'}`,
                  SOURCE_LABEL[s.source] ?? s.source,
                  s.isPrivate ? 'private repo' : null,
                ].filter(Boolean).join(' · ')}
              </span>

              {urls.length === 0 && (
                <span className={formStyles.meta}>
                  No live url found - add a <code>.showcase.json</code>, or set the
                  repo&rsquo;s Website field on GitHub.
                </span>
              )}

              {urls.map(u => (
                <span key={u.url} className={formStyles.meta}>
                  {u.label}: <a href={u.url} target="_blank" rel="noopener noreferrer">{u.url}</a>
                  {u.reachable === false
                    ? ' · not responding'
                    : u.embeddable === false
                      ? ' · refuses framing, will link out'
                      : ' · embeds fine'}
                </span>
              ))}

              {s.manifestError && (
                <span className={formStyles.meta}>Manifest problem: {s.manifestError}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StudioSection;
