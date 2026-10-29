import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import {
  MdPerson, MdBadge, MdEditNote, MdBuild, MdWork, MdSchool, MdFavorite,
  MdShare, MdVolunteerActivism, MdMailOutline, MdMenu, MdHome, MdLogout, MdVerified, MdPublic,
} from 'react-icons/md';
import useAuth from '../../hooks/useAuth';
import useMomentumScroll from '../../hooks/useMomentumScroll';
import { signInWithGoogle, signOutUser } from '../../firebase/auth';
import {
  subscribeExperience, createExperience, updateExperience, deleteExperience,
  subscribeEducation,  createEducation,  updateEducation,  deleteEducation,
  subscribeCertifications, createCertification, updateCertification, deleteCertification,
  reorderCollection,
} from '../../firebase/admin';
import { useToast } from '../../components';
import Monogram from '../../components/Monogram';
import ProfileSection         from './sections/ProfileSection';
import PersonalDetailsSection from './sections/PersonalDetailsSection';
import SkillsSection          from './sections/SkillsSection';
import InterestsSection from './sections/InterestsSection';
import SocialsSection   from './sections/SocialsSection';
import RecordSection    from './sections/RecordSection';
import GitHubSection    from './sections/GitHubSection';
import StudioSection    from './sections/StudioSection';
import MessagesSection  from './sections/MessagesSection';
import DonationSection  from './sections/DonationSection';
import SiteCopySection  from './sections/SiteCopySection';
import { periodOf } from '../../content/records';
import { fillOf } from '../../content/navigation';
import styles from './Admin.module.css';
import formStyles from './AdminForms.module.css';

const EXPERIENCE_FIELDS = [
  { key: 'company',     label: 'Company',     type: 'text',     required: true  },
  { key: 'role',        label: 'Role',        type: 'text',     required: true  },
  { key: 'type',        label: 'Type',        type: 'text'                      },
  { key: 'location',    label: 'Location',    type: 'text'                      },
  { key: 'start',       label: 'Start (e.g. January 2025)', type: 'text'        },
  { key: 'end',         label: 'End (leave empty if current)', type: 'text'     },
  { key: 'description', label: 'Description', type: 'textarea'                  },
  { key: 'tags',        label: 'Tech tags',   type: 'tags'                      },
  { key: 'showOnCv',    label: 'Show on the printed CV', type: 'toggle', default: true, hint: 'Untick to keep it on the website but leave it off the CV.' },
  { key: 'showOnHome',  label: 'Show on the home timeline', type: 'toggle', default: true, hint: 'Untick to keep it on the Bio page but leave it off the home page.' },
];

const EDUCATION_FIELDS = [
  { key: 'institution', label: 'Institution', type: 'text',     required: true  },
  { key: 'degree',      label: 'Degree',      type: 'text'                      },
  { key: 'field',       label: 'Field',       type: 'text'                      },
  { key: 'start',       label: 'Start (e.g. 2021)', type: 'text'                },
  { key: 'end',         label: 'End (leave empty if current)', type: 'text'     },
  { key: 'description', label: 'Description', type: 'textarea'                  },
  { key: 'tags',        label: 'Tags',        type: 'tags'                      },
  { key: 'showOnCv',    label: 'Show on the printed CV', type: 'toggle', default: true, hint: 'Untick to keep it on the website but leave it off the CV.' },
  { key: 'showOnHome',  label: 'Show on the home timeline', type: 'toggle', default: true, hint: 'Untick to keep it on the Bio page but leave it off the home page.' },
];

const CERTIFICATION_FIELDS = [
  { key: 'credential',  label: 'Credential',  type: 'text',     required: true  },
  { key: 'issuer',      label: 'Issuer',      type: 'text',     required: true  },
  { key: 'code',        label: 'Exam code (optional, e.g. CLF-C02)', type: 'text' },
  { key: 'status',      label: 'Status',      type: 'select', options: ['planned', 'studying', 'booked', 'earned'] },
  { key: 'start',       label: 'Date (issued if earned, exam date if booked)', type: 'text' },
  { key: 'badgeUrl',    label: 'Badge image URL (shown once earned)', type: 'text', placeholder: 'https://images.credly.com/size/340x340/images/<id>/image.png' },
  { key: 'verifyUrl',   label: 'Verify URL (shown once earned)', type: 'text', placeholder: 'https://www.credly.com/badges/<id>/public_url' },
  { key: 'description', label: 'Description', type: 'textarea'                  },
  { key: 'showOnCv',    label: 'Show on the printed CV', type: 'toggle', default: true, hint: 'Untick to keep it on the website but leave it off the CV.' },
];

const GROUPS = ['Identity', 'Content', 'Projects', 'Inbox'];

// Each section has its own colour, so it is easy to tell where you are.
const SECTIONS = [
  { id: 'profile',    group: 'Identity', tone: 'blue',   title: 'Profile & Contact', desc: 'Name, title, summary, photo and how people reach you.', icon: <MdPerson /> },
  { id: 'personal',   group: 'Identity', tone: 'pink',   title: 'Personal Details',  desc: 'Languages and other personal facts.', icon: <MdBadge /> },
  { id: 'copy',       group: 'Content',  tone: 'yellow', title: 'Site Copy',         desc: 'Every heading and label on the site.', icon: <MdEditNote /> },
  { id: 'skills',     group: 'Content',  tone: 'green',  title: 'Skills',            desc: 'Skill groups shown on the Bio page and the CV.', icon: <MdBuild /> },
  { id: 'experience', group: 'Content',  tone: 'green',  title: 'Experience',        desc: 'Jobs. The CV always lists them newest first.', icon: <MdWork /> },
  { id: 'education',  group: 'Content',  tone: 'orange', title: 'Education',         desc: 'Degrees and schooling.', icon: <MdSchool /> },
  { id: 'certifications', group: 'Content', tone: 'pink', title: 'Certifications',   desc: 'The AWS path and other certificates.', icon: <MdVerified /> },
  { id: 'interests',  group: 'Content',  tone: 'orange', title: 'Interests',         desc: 'Things you do outside work.', icon: <MdFavorite /> },
  { id: 'socials',    group: 'Content',  tone: 'blue',   title: 'Social Links',      desc: 'Profiles linked across the site.', icon: <MdShare /> },
  { id: 'donation',   group: 'Content',  tone: 'yellow', title: 'Donation',          desc: 'The support link on the Connect page.', icon: <MdVolunteerActivism /> },
  { id: 'studio',     group: 'Projects', tone: 'green',  title: 'Client Sites',      desc: 'Live client sites, synced from GitHub.', icon: <MdPublic /> },
  { id: 'github',     group: 'Projects', tone: 'blue',   title: 'GitHub Projects',   desc: 'Your repositories, in display order.', icon: <FaGithub /> },
  { id: 'messages',   group: 'Inbox',    tone: 'orange', title: 'Messages',          desc: 'Letters sent from the Connect page.', icon: <MdMailOutline /> },
];

const toneStyle = (tone) => ({ '--tone': `var(--c-${tone})`, '--tone-ink': `var(--c-${tone}-deep)` });

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [view, setView]           = useState({ id: 'profile' }); // { id, add }
  const [signingIn, setSigningIn] = useState(false);
  const [navOpen, setNavOpen]     = useState(false); // mobile drawer

  const scrollWrapperRef = useRef(null);
  const scrollContentRef = useRef(null);
  useMomentumScroll({ wrapperRef: scrollWrapperRef, contentRef: scrollContentRef });

  const openSection = (id, add = false) => {
    setView({ id, add });
    setNavOpen(false); // close the mobile drawer after picking a section
  };

  // Highlighted text takes the colour of the open section.
  useEffect(() => {
    const tone = (SECTIONS.find(s => s.id === view.id) ?? SECTIONS[0]).tone;
    const root = document.documentElement.style;
    root.setProperty('--sel', fillOf(tone));
    root.setProperty('--sel-on', '#1f1f1f');
  }, [view.id]);

  // Close the mobile drawer on Escape.
  useEffect(() => {
    if (!navOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setNavOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navOpen]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      toast.error('Could not sign in with Google.', { title: 'Sign-in failed' });
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try { await signOutUser(); }
    catch { toast.error('Sign-out failed'); }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.authScreen}><div className={styles.spinner} /></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.authScreen}>
          <div className={styles.authCard}>
            <Monogram size={44} />
            <h2 className={styles.authTitle}>Portfolio Admin</h2>
            <p className={styles.authSub}>Sign in with your Google account to continue.</p>
            <button type="button" className="btn-primary" onClick={handleSignIn} disabled={signingIn}>
              <FaGoogle />
              {signingIn ? 'Signing in…' : 'Sign in with Google'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.page}>
        <div className={styles.authScreen}>
          <div className={styles.authCard}>
            <p className={styles.notAllowed}>Access denied.</p>
            <p className={styles.authSub}>{user.email} is not on the admin list.</p>
            <button type="button" className="btn-cancel" onClick={handleSignOut}>Sign out</button>
          </div>
        </div>
      </div>
    );
  }

  const activeSection = SECTIONS.find(s => s.id === view.id) ?? SECTIONS[0];

  const renderSection = () => {
    switch (view?.id) {
      case 'profile':   return <ProfileSection />;
      case 'personal':  return <PersonalDetailsSection />;
      case 'copy':      return <SiteCopySection />;
      case 'skills':    return <SkillsSection />;
      case 'interests': return <InterestsSection />;
      case 'socials':   return <SocialsSection />;
      case 'donation':  return <DonationSection />;
      case 'studio':    return <StudioSection />;
      case 'github':    return <GitHubSection />;
      case 'messages':  return <MessagesSection />;
      case 'experience':
        return (
          <RecordSection
            title="Experience"
            fields={EXPERIENCE_FIELDS}
            subscribe={subscribeExperience}
            onCreate={createExperience}
            onUpdate={updateExperience}
            onDelete={deleteExperience}
            onReorder={ids => reorderCollection('experience', ids)}
            openAddOnMount={view.add}
            renderSummary={r => (
              <>
                <span className={formStyles.rowTitle}>{r.role}</span>
                <span className={formStyles.rowMeta}>{r.company}{periodOf(r) ? ` · ${periodOf(r)}` : ''}</span>
              </>
            )}
          />
        );
      case 'education':
        return (
          <RecordSection
            title="Education"
            fields={EDUCATION_FIELDS}
            subscribe={subscribeEducation}
            onCreate={createEducation}
            onUpdate={updateEducation}
            onDelete={deleteEducation}
            onReorder={ids => reorderCollection('education', ids)}
            openAddOnMount={view.add}
            renderSummary={r => (
              <>
                <span className={formStyles.rowTitle}>{r.institution}</span>
                <span className={formStyles.rowMeta}>
                  {[r.degree, r.field].filter(Boolean).join(', ')}{periodOf(r) ? ` · ${periodOf(r)}` : ''}
                </span>
              </>
            )}
          />
        );
      case 'certifications':
        return (
          <RecordSection
            title="Certifications"
            fields={CERTIFICATION_FIELDS}
            subscribe={subscribeCertifications}
            onCreate={createCertification}
            onUpdate={updateCertification}
            onDelete={deleteCertification}
            onReorder={ids => reorderCollection('certifications', ids)}
            openAddOnMount={view.add}
            renderSummary={r => (
              <>
                <span className={formStyles.rowTitle}>{r.credential}</span>
                <span className={formStyles.rowMeta}>
                  {[r.issuer, r.code, r.status].filter(Boolean).join(' · ')}
                </span>
              </>
            )}
          />
        );
      default: return null;
    }
  };

  return (
    <div className={`${styles.page} admin-ui`}>
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setNavOpen(true)}
            aria-label="Open sections menu"
          >
            <MdMenu aria-hidden="true" />
          </button>
          <Monogram size={30} />
          <span className={styles.topbarTitle}>Admin</span>
        </div>
        <div className={styles.topbarRight}>
          <span className={styles.userEmail}>{user.email}</span>
          <button type="button" className="btn-primary" onClick={() => navigate('/')}>
            <MdHome aria-hidden="true" /> <span className={styles.hideNarrow}>View site</span>
          </button>
          <button type="button" className="btn-cancel" onClick={handleSignOut}>
            <MdLogout aria-hidden="true" /> <span className={styles.hideNarrow}>Sign out</span>
          </button>
        </div>
      </header>

      <div className={styles.shell}>
        {navOpen && (
          <div className={styles.navBackdrop} onClick={() => setNavOpen(false)} aria-hidden="true" />
        )}
        <aside
          className={[styles.nav, navOpen ? styles.navOpen : ''].join(' ')}
          aria-label="Sections"
        >
          {GROUPS.map(group => (
            <div key={group} className={styles.navGroup}>
              <p className={styles.navGroupLabel}>{group}</p>
              {SECTIONS.filter(s => s.group === group).map(s => {
                const isActive = s.id === view.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={[styles.navItem, isActive ? styles.navItemActive : ''].join(' ')}
                    style={toneStyle(s.tone)}
                    onClick={() => openSection(s.id)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={styles.navIcon} aria-hidden="true">{s.icon}</span>
                    <span className={styles.navLabel}>{s.title}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        <main className={styles.content} ref={scrollWrapperRef}>
          <div className={styles.contentInner} ref={scrollContentRef}>
            <div className={styles.sectionHead} style={toneStyle(activeSection.tone)}>
              <span className={styles.sectionIcon} aria-hidden="true">{activeSection.icon}</span>
              <div>
                <h1 className={styles.sectionTitle}>{activeSection.title}</h1>
                <p className={styles.sectionDesc}>{activeSection.desc}</p>
              </div>
            </div>
            <div key={view.id} className={styles.sectionBody} style={toneStyle(activeSection.tone)}>
              {renderSection()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
