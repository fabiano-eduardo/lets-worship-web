// Firebase configuration and initialization

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate required config
function validateConfig(): boolean {
  const requiredKeys = ["apiKey", "authDomain", "projectId"];
  for (const key of requiredKeys) {
    if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
      console.warn(`Missing Firebase config: ${key}`);
      return false;
    }
  }
  return true;
}

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (validateConfig()) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  console.log({ auth });
}

export { app, auth };
export const isFirebaseConfigured = (): boolean =>
  app !== null && auth !== null;
