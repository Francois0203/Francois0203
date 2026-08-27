import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const admin   = require('firebase-admin');

const HERE = path.dirname(fileURLToPath(import.meta.url));

/**
 * Project id, so a local run needs no extra env var: taken from the repo's own
 * .firebaserc unless overridden.
 */
export function projectId() {
  const fromEnv = process.env.FIREBASE_PROJECT
    || process.env.GOOGLE_CLOUD_PROJECT
    || process.env.GCLOUD_PROJECT;
  if (fromEnv) return fromEnv;

  try {
    const rc = JSON.parse(fs.readFileSync(path.join(HERE, '..', '..', '.firebaserc'), 'utf-8'));
    return rc?.projects?.default ?? null;
  } catch {
    return null;
  }
}

/**
 * Firestore handle for the sync scripts.
 *
 * CI passes a service-account JSON in SERVICE_ACCOUNT. Without it we fall back
 * to application-default credentials, so a local run only needs
 * `gcloud auth application-default login`.
 */
export async function initFirestore() {
  const raw = process.env.SERVICE_ACCOUNT;
  const project = raw ? null : projectId();

  if (raw) {
    let creds;
    try {
      creds = JSON.parse(raw);
    } catch (err) {
      throw new Error(`SERVICE_ACCOUNT is not valid JSON: ${err.message}`);
    }
    admin.initializeApp({ credential: admin.credential.cert(creds) });
  } else {
    if (!project) {
      throw new Error(
        'No credentials. Either set SERVICE_ACCOUNT to a service-account JSON, or run\n' +
        '  gcloud auth application-default login\n' +
        'and set FIREBASE_PROJECT (no .firebaserc default could be read).',
      );
    }
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId:  project,
      });
    } catch (err) {
      throw new Error(
        `Application-default credentials unavailable (${err.message}).\n` +
        'Run `gcloud auth application-default login`, or set SERVICE_ACCOUNT.',
      );
    }
  }

  // Resolve the credential now rather than on first query: initializeApp is
  // lazy, so without this a missing credential surfaces as a raw stack trace
  // from deep inside the Firestore client instead of the message above.
  try {
    await admin.app().options.credential.getAccessToken();
  } catch (err) {
    throw new Error(
      `Credentials were rejected (${err.message}).
` +
      'Run `gcloud auth application-default login`, or set SERVICE_ACCOUNT to a ' +
      'service-account JSON.',
    );
  }

  console.log(raw ? 'Auth: service account' : `Auth: application-default credentials, project ${project}`);
  return admin.firestore();
}

/**
 * Releases the Firestore client. Without this, exiting while its gRPC handles
 * are still open aborts the process on Windows (libuv assertion, exit code 127)
 * instead of returning the intended code.
 */
export async function closeFirestore() {
  try {
    await Promise.all(admin.apps.filter(Boolean).map(a => a.delete()));
  } catch {
    // Nothing useful to do if teardown itself fails.
  }
}

export { admin };
