import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config.js';

// Collection name for password generation logs
const PASSWORD_LOGS_COLLECTION = 'passwordLogs';

/**
 * Log password generation metadata to Firestore
 * @param {Object} metadata - The metadata to log
 * @param {string} metadata.uid - User ID
 * @param {number} metadata.length - Password length
 * @param {Object} metadata.options - Password generation options
 * @param {number} metadata.strengthScore - Password strength score
 */
export const logPasswordGeneration = async (metadata) => {
  try {
    const docRef = await addDoc(collection(db, PASSWORD_LOGS_COLLECTION), {
      uid: metadata.uid,
      length: metadata.length,
      options: metadata.options,
      strengthScore: metadata.strengthScore,
      createdAt: serverTimestamp()
    });
    
    console.log('Password generation logged with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error logging password generation:', error);
    throw error;
  }
};
