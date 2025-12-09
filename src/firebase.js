// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// DO NOT CHANGE – copied from your existing HTML files :contentReference[oaicite:0]{index=0} :contentReference[oaicite:1]{index=1}
const firebaseConfig = {
  apiKey: 'AIzaSyDmKYixyC_JmNWZu66MGL7iWz---z8ldkc',
  authDomain: 'scoreboard-ea2ca.firebaseapp.com',
  databaseURL:
    'https://scoreboard-ea2ca-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'scoreboard-ea2ca',
  storageBucket: 'scoreboard-ea2ca.firebasestorage.app',
  messagingSenderId: '848590546',
  appId: '1:848590546:web:8a27a9e4cca19af7c6df0b',
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
