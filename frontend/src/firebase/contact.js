import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './index';
import { CONTACT_RETENTION_DAYS } from '../content/legal';

// expireAt drives the Firestore TTL policy on contacts, which deletes the message on that date.
export const submitContactForm = async ({ name, email, message }) => {
  await addDoc(collection(db, 'contacts'), {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    createdAt: serverTimestamp(),
    expireAt: Timestamp.fromMillis(Date.now() + CONTACT_RETENTION_DAYS * 864e5),
  });
};
