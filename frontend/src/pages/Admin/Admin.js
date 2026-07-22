import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { IoSettingsSharp } from 'react-icons/io5';
import {
  MdPerson, MdBadge, MdEditNote, MdBuild, MdWork, MdSchool, MdFavorite,
  MdShare, MdVolunteerActivism, MdMailOutline, MdMenu, MdHome,
} from 'react-icons/md';
import useAuth from '../../hooks/useAuth';
import { signInWithGoogle, signOutUser } from '../../firebase/auth';
import {
  subscribeExperience, createExperience, updateExperience, deleteExperience,
  subscribeEducation,  createEducation,  updateEducation,  deleteEducation,
} from '../../firebase/admin';
import { useToast, KebabMenu } from '../../components';
import ProfileSection         from './sections/ProfileSection';
import PersonalDetailsSection from './sections/PersonalDetailsSection';
import SkillsSection          from './sections/SkillsSection';
import InterestsSection from './sections/InterestsSection';
import SocialsSection   from './sections/SocialsSection';
import RecordSection    from './sections/RecordSection';
import GitHubSection    from './sections/GitHubSection';
import MessagesSection  from './sections/MessagesSection';
import DonationSection  from './sections/DonationSection';
import SiteCopySection  from './sections/SiteCopySection';
import styles from './Admin.module.css';

const EXPERIENCE_FIELDS = [
  { key: 'company',     label: 'Company',     type: 'text',     required: true  },
  { key: 'role',        label: 'Role',        type: 'text',     required: true  },
  { key: 'type',        label: 'Type',        type: 'text'                      },
  { key: 'location',    label: 'Location',    type: 'text'                      },
  { key: 'period',      label: 'Period',      type: 'text'                      },
  { key: 'start',       label: 'Start',       type: 'text'                      },
  { key: 'end',         label: 'End',         type: 'text'                      },
  { key: 'description', label: 'Description', type: 'textarea'                  },
  { key: 'tags',        label: 'Tech tags',   type: 'tags'                      },
  { key: 'order',       label: 'Order',       type: 'number'                    },
];

const EDUCATION_FIELDS = [
  { key: 'institution', label: 'Institution', type: 'text',     required: true  },
  { key: 'degree',      label: 'Degree',      type: 'text'                      },
  { key: 'field',       label: 'Field',       type: 'text'                      },
  { key: 'period',      label: 'Period',      type: 'text'                      },
  { key: 'start',       label: 'Start',       type: 'text'                      },
  { key: 'end',         label: 'End',         type: 'text'                      },
  { key: 'description', label: 'Description', type: 'textarea'                  },
  { key: 'tags',        label: 'Tags',        type: 'tags'                      },
  { key: 'order',       label: 'Order',       type: 'number'                    },
];

// The settings tree. `group` buckets items in the sidebar; `quickAdd` adds a
// three-dots menu on that row for jumping straight into "Add entry".
const GROUPS = ['Identity', 'Content', 'Projects', 'Inbox'];

const SECTIONS = [
  { id: 'profile',    group: 'Identity', title: 'Profile & Contact', icon: <MdPerson /> },
  { id: 'personal',   group: 'Identity', title: 'Personal Details',  icon: <MdBadge /> },
  { id: 'copy',       group: 'Content',  title: 'Site Copy',         icon: <MdEditNote /> },
  { id: 'skills',     group: 'Content',  title: 'Skills',            icon: <MdBuild /> },
  { id: 'experience', group: 'Content',  title: 'Experience',        icon: <MdWork />,   quickAdd: true },
  { id: 'education',  group: 'Content',  title: 'Education',         icon: <MdSchool />, quickAdd: true },
  { id: 'interests',  group: 'Content',  title: 'Interests',         icon: <MdFavorite /> },
  { id: 'socials',    group: 'Content',  title: 'Social Links',      icon: <MdShare /> },
  { id: 'donation',   group: 'Content',  title: 'Donation',          icon: <MdVolunteerActivism /> },
  { id: 'github',     group: 'Projects', title: 'GitHub Projects',   icon: <FaGithub /> },
  { id: 'messages',   group: 'Inbox',    title: 'Messages',          icon: <MdMailOutline /> },
];

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [view, setView]           = useState({ id: 'profile' }); // { id, add }
  const [signingIn, setSigningIn] = useState(false);
  const [navOpen, setNavOpen]     = useState(false); // mobile drawer

  const openSection = (id, add = false) => {
    setView({ id, add });
    setNavOpen(false); // close the mobile drawer after picking a section
  };

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
      showToast('error', 'Sign-in failed', 'Could not sign in with Google');
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try { await signOutUser(); }
    catch { showToast('error', 'Error', 'Sign-out failed'); }
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
            <IoSettingsSharp size={40} className={styles.authIcon} />
            <h2 className={styles.authTitle}>Portfolio Admin</h2>
            <p className={styles.authSub}>Sign in with your Google account to continue.</p>
            <button onClick={handleSignIn} disabled={signingIn}>
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
            <button type="button" onClick={handleSignOut}>Sign Out</button>
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
            openAddOnMount={view.add}
            renderSummary={r => (
              <>
                <strong>{r.role}</strong>
                <span style={{ color: 'var(--secondary-text-color)' }}>{r.company}{r.period ? ` · ${r.period}` : ''}</span>
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
            openAddOnMount={view.add}
            renderSummary={r => (
              <>
                <strong>{r.institution}</strong>
                <span style={{ color: 'var(--secondary-text-color)' }}>
                  {[r.degree, r.field].filter(Boolean).join(', ')}{r.period ? ` · ${r.period}` : ''}
                </span>
              </>
            )}
          />
        );
      default: return null;
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setNavOpen(true)}
            aria-label="Open sections menu"
          >
            <MdMenu aria-hidden="true" />
          </button>
          <IoSettingsSharp size={20} className={styles.topbarIcon} />
          <span className={styles.topbarTitle}>Portfolio Admin</span>
        </div>
        <div className={styles.topbarRight}>
          <span className={styles.userEmail}>{user.email}</span>
          <button type="button" className="btn-outline" onClick={() => navigate('/')}>
            <MdHome aria-hidden="true" /> View site
          </button>
          <button type="button" onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>

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
                  <div
                    key={s.id}
                    className={[styles.navItem, isActive ? styles.navItemActive : ''].join(' ')}
                  >
                    <button
                      type="button"
                      className={styles.navItemBtn}
                      onClick={() => openSection(s.id)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className={styles.navIcon} aria-hidden="true">{s.icon}</span>
                      <span className={styles.navLabel}>{s.title}</span>
                    </button>
                    {s.quickAdd && (
                      <div className={styles.navKebab}>
                        <KebabMenu
                          ariaLabel={`${s.title} options`}
                          items={[
                            { label: 'Add entry',      onSelect: () => openSection(s.id, true) },
                            { label: 'Manage entries', onSelect: () => openSection(s.id) },
                          ]}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </aside>

        <main className={styles.content}>
          <h2 className={styles.sectionTitle}>{activeSection.title}</h2>
          <div key={view.id} className={styles.sectionBody}>
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
