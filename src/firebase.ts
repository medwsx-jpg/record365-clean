import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyADYjPx4P37Jq7fl1a514opmEpWCPbFCqQ',
  authDomain: 'rental-dispute-app.firebaseapp.com',
  projectId: 'rental-dispute-app',
  storageBucket: 'rental-dispute-app.firebasestorage.app',
  messagingSenderId: '79048702854',
  appId: '1:79048702854:web:1215214c6afd9018f5ca07',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
