
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

// YOUR FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyc-bVcFMQUDGobkvqfQy_lKRbjv0Nm_9K4",
  authDomain: "the-cozy-touch.firebaseapp.com",
  projectId: "the-cozy-touch",
  storageBucket: "the-cozy-touch.firebasestorage.app",
  messagingSenderId: "198877941259",
  appId: "1:198877941259:web:c50fb63ca941659393810e"
};

// We will replace this after creating the admin account.
export const ADMIN_UID = "LnHTX5SsPpcRFTGYDnuLGBzSGDl2";

// INITIALIZE FIREBASE
const app = initializeApp(firebaseConfig);

// FIREBASE SERVICES
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
