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

/*
 * App Check (reCAPTCHA Enterprise, part of Google Cloud Fraud Defense). It starts on page load,
 * invisibly - no checkbox - and proves to Firebase that requests come from this site in a real
 * browser. The sendMessage function refuses calls without it. It stays off until a site key is
 * set, and must start before Firestore or Auth are used.
 * Local development: set FIREBASE_APPCHECK_DEBUG_TOKEN=true in .env.local, then register the token
 * the browser console prints under App Check -> Apps -> Manage debug tokens. false or empty = off.
 */
const appCheckKey = import.meta.env.FIREBASE_APPCHECK_SITE_KEY;
if (appCheckKey) {
  const debugToken = String(import.meta.env.FIREBASE_APPCHECK_DEBUG_TOKEN ?? '').trim();
  if (import.meta.env.DEV && debugToken && debugToken !== 'false') self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken === 'true' ? true : debugToken;
  initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(appCheckKey), isTokenAutoRefreshEnabled: true });
}

export const db             = getFirestore(app);
export const auth           = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
