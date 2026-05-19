import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './index';

export const submitContactForm = async ({ name, email, message }) => {
  await addDoc(collection(db, 'contacts'), {
    name,
    email,
    message,
    createdAt: serverTimestamp(),
  });
};
