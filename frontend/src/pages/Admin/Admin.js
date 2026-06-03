import React, { useState } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { IoSettingsSharp } from 'react-icons/io5';
import useAuth from '../../hooks/useAuth';
import { signInWithGoogle, signOutUser } from '../../firebase/auth';
import {
  subscribeExperience, createExperience, updateExperience, deleteExperience,
  subscribeEducation,  createEducation,  updateEducation,  deleteEducation,
} from '../../firebase/admin';
import { useToast } from '../../components';
import ProfileSection   from './sections/ProfileSection';
import SkillsSection    from './sections/SkillsSection';
import InterestsSection from './sections/InterestsSection';
import SocialsSection   from './sections/SocialsSection';
import RecordSection    from './sections/RecordSection';
import GitHubSection    from './sections/GitHubSection';
import MessagesSection  from './sections/MessagesSection';
import styles from './Admin.module.css';

const TABS = [
  { id: 'profile',    label: 'Profile'    },
  { id: 'skills',     label: 'Skills'     },
  { id: 'experience', label: 'Experience' },
  { id: 'education',  label: 'Education'  },
  { id: 'interests',  label: 'Interests'  },
  { id: 'socials',    label: 'Socials'    },
  { id: 'github',     label: 'GitHub'     },
  { id: 'messages',   label: 'Messages'   },
];

const EXPERIENCE_FIELDS = [
  { key: 'company',     label: 'Company',     type: 'text',     required: true  },
  { key: 'role',        label: 'Role',        type: 'text',     required: true  },
  { key: 'type',        label: 'Type',        type: 'text'                      },
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

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab]           = useState('profile');
  const [signingIn, setSigningIn] = useState(false);

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

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <IoSettingsSharp size={20} className={styles.topbarIcon} />
          <span className={styles.topbarTitle}>Portfolio Admin</span>
        </div>
        <div className={styles.topbarRight}>
          {user.photoURL && <img src={user.photoURL} alt="" className={styles.avatar} />}
          <span className={styles.userEmail}>{user.email}</span>
          <button type="button" onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>

      <nav className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={[styles.tabBtn, tab === t.id ? styles.tabBtnActive : ''].join(' ')}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className={styles.content}>
        <h2 className={styles.sectionTitle}>{TABS.find(t => t.id === tab)?.label}</h2>

        {tab === 'profile'  && <ProfileSection />}
        {tab === 'skills'   && <SkillsSection />}

        {tab === 'experience' && (
          <RecordSection
            title="Experience"
            fields={EXPERIENCE_FIELDS}
            subscribe={subscribeExperience}
            onCreate={createExperience}
            onUpdate={updateExperience}
            onDelete={deleteExperience}
            renderSummary={r => (
              <>
                <strong>{r.role}</strong>
                <span style={{ color: 'var(--secondary-text-color)' }}>{r.company}{r.period ? ` · ${r.period}` : ''}</span>
              </>
            )}
          />
        )}

        {tab === 'education' && (
          <RecordSection
            title="Education"
            fields={EDUCATION_FIELDS}
            subscribe={subscribeEducation}
            onCreate={createEducation}
            onUpdate={updateEducation}
            onDelete={deleteEducation}
            renderSummary={r => (
              <>
                <strong>{r.institution}</strong>
                <span style={{ color: 'var(--secondary-text-color)' }}>
                  {[r.degree, r.field].filter(Boolean).join(', ')}{r.period ? ` · ${r.period}` : ''}
                </span>
              </>
            )}
          />
        )}

        {tab === 'interests' && <InterestsSection />}
        {tab === 'socials'   && <SocialsSection />}
        {tab === 'github'    && <GitHubSection />}
        {tab === 'messages'  && <MessagesSection />}
      </main>
    </div>
  );
};

export default Admin;
