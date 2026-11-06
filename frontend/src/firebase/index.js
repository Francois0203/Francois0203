import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.FIREBASE_API_KEY,
  authDomain:        import.meta.env.FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.FIREBASE_APP_ID,
  measurementId:     import.meta.env.FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);

// App Check proves requests come from this site (sendMessage refuses calls without it); it must start before Firestore or Auth.
// Locally, set FIREBASE_APPCHECK_DEBUG_TOKEN=true and register the printed token under App Check > Apps > Manage debug tokens.
const appCheckKey = import.meta.env.FIREBASE_APPCHECK_SITE_KEY;
if (appCheckKey) {
  const debugToken = String(import.meta.env.FIREBASE_APPCHECK_DEBUG_TOKEN ?? '').trim();
  if (import.meta.env.DEV && debugToken && debugToken !== 'false') self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken === 'true' ? true : debugToken;
  initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(appCheckKey), isTokenAutoRefreshEnabled: true });
}

export const db             = getFirestore(app);
export const auth           = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
