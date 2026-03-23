import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDUhi3HdUBBaKV9A-oViFvWDRRDL6lYXK4",
  authDomain: "spice-garden-c03ad.firebaseapp.com",
  projectId: "spice-garden-c03ad",
  storageBucket: "spice-garden-c03ad.firebasestorage.app",
  messagingSenderId: "216630919157",
  appId: "1:216630919157:web:63e14efadcdb2c28ccaabc",
  measurementId: "G-JCDR6JWQLC",
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);

export { RecaptchaVerifier, signInWithPhoneNumber };
export type { ConfirmationResult };
