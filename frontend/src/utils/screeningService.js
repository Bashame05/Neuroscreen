import { db } from '../firebase';
import { collection, addDoc, query, getDocs, orderBy, Timestamp, where } from 'firebase/firestore';

/**
 * Saves a completed screening result to the user's document in Firestore.
 * 
 * @param {string} userId - The unique ID of the user.
 * @param {Object} screeningData - The result data to save.
 */
export const saveScreeningResult = async (userId, screeningData) => {
  if (!userId) {
    console.error("User ID is required to save screening results.");
    return;
  }

  try {
    const screeningsRef = collection(db, 'users', userId, 'screenings');
    const docRef = await addDoc(screeningsRef, {
      ...screeningData,
      date: Timestamp.now()
    });
    console.log("Screening result saved with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving screening result: ", error);
    throw error;
  }
};

/**
 * Fetches the screening history for a specific user.
 * 
 * @param {string} userId - The unique ID of the user.
 * @returns {Promise<Array>} - A list of screening records.
 */
export const getScreeningHistory = async (userId) => {
  if (!userId) return [];

  try {
    const screeningsRef = collection(db, 'users', userId, 'screenings');
    const q = query(screeningsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date()
    }));
  } catch (error) {
    console.error("Error fetching screening history: ", error);
    return [];
  }
};
