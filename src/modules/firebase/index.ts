import { initializeApp } from "firebase/app";

// import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

initializeApp(firebaseConfig);

const admin = require("firebase-admin");
const serviceKey = require("../../../meemos-world-cef639c3bb6f.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceKey),
  databaseURL: "https://meemos-db.firebaseio.com",
});

const db = admin.firestore();

export { db };
