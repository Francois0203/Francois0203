import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const admin   = require('firebase-admin');

const HERE = path.dirname(fileURLToPath(import.meta.url));

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

export async function closeFirestore() {
  try {
    await Promise.all(admin.apps.filter(Boolean).map(a => a.delete()));
  } catch {
    // Nothing useful to do if teardown itself fails.
  }
}

export { admin };
