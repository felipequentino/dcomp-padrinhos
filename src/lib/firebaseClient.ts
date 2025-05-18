import { getApps, getApp, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {

    apiKey: "AIzaSyBfD8M7tz7IPi5OnQMft6UITscFHegYuWY",
  
    authDomain: "padrinhos-dcomp.firebaseapp.com",
  
    projectId: "padrinhos-dcomp",
  
    storageBucket: "padrinhos-dcomp.firebasestorage.app",
  
    messagingSenderId: "1091514360068",
  
    appId: "1:1091514360068:web:46c863b3fd58b539283051"
  
  };
  

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
