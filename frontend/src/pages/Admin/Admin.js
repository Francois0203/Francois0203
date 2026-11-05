import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { MdMenu, MdHome, MdLogout, MdClose, MdSearch } from 'react-icons/md';
import useAuth from '../../hooks/useAuth';
import useMomentumScroll from '../../hooks/useMomentumScroll';
import useAsyncAction from '../../hooks/useAsyncAction';
import { signInWithGoogle, signOutUser } from '../../firebase/auth';
import { sweepPhotos } from '../../firebase/photos';
import {
  subscribeExperience, createExperience, updateExperience, deleteExperience,
  subscribeEducation, createEducation, updateEducation, deleteEducation,
  subscribeCertifications, createCertification, updateCertification, deleteCertification,
  reorderCollection,
} from '../../firebase/admin';
import { useToast } from '../../components';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import Monogram from '../../components/Monogram';
import ThemeSwitch from '../../components/ThemeSwitch';
import MotionSwitch from '../../components/MotionSwitch';
import ProfileSection from './sections/ProfileSection';
import PersonalDetailsSection from './sections/PersonalDetailsSection';
import SkillsSection from './sections/SkillsSection';
import InterestsSection from './sections/InterestsSection';
import PhotosSection from './sections/PhotosSection';
import SocialsSection from './sections/SocialsSection';
import RecordSection from './sections/RecordSection';
import GitHubSection from './sections/GitHubSection';
import StudioSection from './sections/StudioSection';
import MessagesSection from './sections/MessagesSection';
import DonationSection from './sections/DonationSection';
import SiteCopySection from './sections/SiteCopySection';
import { SectionTone } from './hooks/useSectionTone';
import { EXPERIENCE_FIELDS, EDUCATION_FIELDS, CERTIFICATION_FIELDS, GROUPS, SECTIONS } from './config';
import { periodOf } from '../../content/records';
import { fillOf } from '../../content/navigation';
import styles from './Admin.module.css';
import formStyles from './AdminForms.module.css';

const meta = (...parts) => parts.filter(Boolean).join(', ');

// The sign-in and access screens share this glass card.
const Gate = ({ children }) => (
  <div className={styles.page}>
    <div className={styles.gate}>
      <div className={`glass ${styles.gateCard}`} data-tone="blue">{children}</div>
    </div>
  </div>
);

let swept = false;

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const [find, setFind] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState({ id: 'profile' });
  const [navOpen, setNavOpen] = useState(false);

  const scrollWrapperRef = useRef(null);
  const scrollContentRef = useRef(null);
  useMomentumScroll({ wrapperRef: scrollWrapperRef, contentRef: scrollContentRef });

  const openSection = (id, add = false) => {
    setView({ id, add });
    setNavOpen(false);
  };

  // Highlighted text takes the colour of the open section.
  useEffect(() => {
    const tone = (SECTIONS.find(s => s.id === view.id) ?? SECTIONS[0]).tone;
    document.documentElement.style.setProperty('--sel', fillOf(tone));
    document.documentElement.style.setProperty('--page-tone', `var(--c-${tone})`);
  }, [view.id]);

  // Once per visit, quietly remove files and links that nothing uses any more.
  useEffect(() => {
    if (!isAdmin || swept) return;
    swept = true;
    sweepPhotos()
      .then(({ files, links }) => {
        const parts = [files && `${files} unused file${files === 1 ? '' : 's'}`, links && `${links} broken story link${links === 1 ? '' : 's'}`].filter(Boolean);
        if (parts.length) toast.info(`Tidied up ${parts.join(' and ')}.`, { title: 'Storage cleaned' });
      })
      .catch(() => { swept = false; });
  }, [isAdmin, toast]);

  // Escape closes the phone drawer.
  useEffect(() => {
    if (!navOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setNavOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navOpen]);

  const signIn = useAsyncAction(async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      toast.error('Could not sign in with Google.', { title: 'Sign-in failed' });
      throw err;
    }
  });

  const handleSignOut = async () => {
    try { await signOutUser(); } catch { toast.error('Sign-out failed'); }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.gate}><Spinner size="2.5rem" label="Checking your sign-in" /></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Gate>
        <span className={styles.gateMark}><Monogram size={48} /></span>
        <h1 className={styles.gateTitle}>Portfolio admin</h1>
        <p className={styles.gateText}>Sign in with your Google account to edit the site.</p>
        <Button variant="primary" tone="blue" size="lg" full icon={<FaGoogle />} status={signIn.status} onClick={() => signIn.run()}>
          Sign in with Google
        </Button>
        <Button variant="text" onClick={() => navigate('/')}>Back to the site</Button>
      </Gate>
    );
  }

  if (!isAdmin) {
    return (
      <Gate>
        <span className={styles.gateMark} data-denied=""><MdClose /></span>
        <h1 className={styles.gateTitle}>Access denied</h1>
        <p className={styles.gateText}>{user.email} is not on the admin list.</p>
        <Button variant="danger" full icon={<MdLogout />} onClick={handleSignOut}>Sign out</Button>
      </Gate>
    );
  }

  const active = SECTIONS.find(s => s.id === view.id) ?? SECTIONS[0];

  const records = {
    experience: {
      title: 'Experience', fields: EXPERIENCE_FIELDS,
      subscribe: subscribeExperience, onCreate: createExperience, onUpdate: updateExperience, onDelete: deleteExperience,
      onReorder: ids => reorderCollection('experience', ids),
      renderSummary: r => (
        <>
          <span className={formStyles.rowTitle}>{r.role}</span>
          <span className={formStyles.rowMeta}>{meta(r.company, periodOf(r))}</span>
        </>
      ),
    },
    education: {
      title: 'Education', fields: EDUCATION_FIELDS,
      subscribe: subscribeEducation, onCreate: createEducation, onUpdate: updateEducation, onDelete: deleteEducation,
      onReorder: ids => reorderCollection('education', ids),
      renderSummary: r => (
        <>
          <span className={formStyles.rowTitle}>{r.institution}</span>
          <span className={formStyles.rowMeta}>{meta([r.degree, r.field].filter(Boolean).join(', '), periodOf(r))}</span>
        </>
      ),
    },
    certifications: {
      title: 'Certifications', fields: CERTIFICATION_FIELDS,
      subscribe: subscribeCertifications, onCreate: createCertification, onUpdate: updateCertification, onDelete: deleteCertification,
      onReorder: ids => reorderCollection('certifications', ids),
      renderSummary: r => (
        <>
          <span className={formStyles.rowTitle}>{r.credential}</span>
          <span className={formStyles.rowMeta}>{meta(r.issuer, r.code, r.status)}</span>
        </>
      ),
    },
  };

  const renderSection = () => {
    switch (view.id) {
      case 'profile': return <ProfileSection />;
      case 'personal': return <PersonalDetailsSection />;
      case 'copy': return <SiteCopySection />;
      case 'skills': return <SkillsSection />;
      case 'interests': return <InterestsSection />;
      case 'photos': return <PhotosSection />;
      case 'socials': return <SocialsSection />;
      case 'donation': return <DonationSection />;
      case 'studio': return <StudioSection />;
      case 'github': return <GitHubSection />;
      case 'messages': return <MessagesSection />;
      case 'experience':
      case 'education':
      case 'certifications':
        return <RecordSection {...records[view.id]} tone={active.tone} openAddOnMount={view.add} />;
      default: return null;
    }
  };

  const q = find.trim().toLowerCase();
  const shown = q ? SECTIONS.filter(s => `${s.title} ${s.desc}`.toLowerCase().includes(q)) : SECTIONS;

  return (
    <div className={`${styles.page} admin-ui`} data-tone={active.tone}>
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <button type="button" className={styles.menuBtn} onClick={() => setNavOpen(true)} aria-label="Open sections menu">
            <MdMenu aria-hidden="true" />
          </button>
          <Monogram size={30} />
          <span className={styles.topbarTitle}>Admin</span>
        </div>
        <div className={styles.topbarRight}>
          <span className={styles.userEmail}>{user.email}</span>
          <ThemeSwitch />
          <MotionSwitch />
          <Button variant="primary" tone="blue" size="sm" icon={<MdHome />} onClick={() => navigate('/')}>
            <span className={styles.hideNarrow}>View site</span>
          </Button>
          <Button variant="danger" size="sm" icon={<MdLogout />} onClick={handleSignOut}>
            <span className={styles.hideNarrow}>Sign out</span>
          </Button>
        </div>
      </header>

      <div className={styles.shell}>
        {navOpen && <div className={styles.navBackdrop} onClick={() => setNavOpen(false)} aria-hidden="true" />}
        <aside className={styles.nav} data-open={navOpen ? '' : undefined} aria-label="Sections">
          <label className={styles.find}>
            <MdSearch aria-hidden="true" />
            <input
              type="search"
              placeholder="Find a section"
              aria-label="Find a section"
              value={find}
              onChange={e => setFind(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setFind('');
                if (e.key === 'Enter' && shown[0]) { openSection(shown[0].id); setFind(''); }
              }}
            />
          </label>
          {shown.length === 0 && <p className={styles.findEmpty}>No section matches.</p>}
          {GROUPS.filter(group => shown.some(s => s.group === group)).map(group => (
            <div key={group} className={styles.navGroup}>
              <p className={styles.navGroupLabel}>{group}</p>
              {shown.filter(s => s.group === group).map(s => (
                <button
                  key={s.id}
                  type="button"
                  className={styles.navItem}
                  data-tone={s.tone}
                  onClick={() => openSection(s.id)}
                  aria-current={s.id === view.id ? 'page' : undefined}
                >
                  <span className={styles.navIcon} aria-hidden="true">{s.icon}</span>
                  <span className={styles.navLabel}>{s.title}</span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className={styles.content} ref={scrollWrapperRef}>
          <div className={styles.contentInner} ref={scrollContentRef}>
            <div key={`head-${view.id}`} className={styles.sectionHead}>
              <span className={styles.sectionIcon} aria-hidden="true">{active.icon}</span>
              <div>
                <h1 className={styles.sectionTitle}>{active.title}</h1>
                <p className={styles.sectionDesc}>{active.desc}</p>
              </div>
            </div>
            <SectionTone.Provider value={active.tone}>
              <section key={view.id} className={`glass ${styles.sectionBody}`} data-tone={active.tone}>
                {renderSection()}
              </section>
            </SectionTone.Provider>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
