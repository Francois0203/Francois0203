import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './index';

const send = httpsCallable(getFunctions(app, 'europe-west1'), 'sendMessage');

// Sends a letter through the server, which checks for spam and limits how often one person can write.
// company is the hidden trap field, elapsed is how long the form was open.
export const submitContactForm = async ({ name, email, message, company = '', elapsed = 0 }) => {
  try {
    await send({ name: name.trim(), email: email.trim(), message: message.trim(), company, elapsed });
  } catch (err) {
    const tooMany = err?.code === 'functions/resource-exhausted';
    const error = new Error(tooMany ? 'limit' : 'failed');
    error.limit = tooMany ? (err.message === 'everyone' ? 'everyone' : 'sender') : null;
    throw error;
  }
};
