// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkuLnvgJz-3198SIczbIeaHoULOnypXCU",
  authDomain: "group-5-beehive.firebaseapp.com",
  projectId: "group-5-beehive",
  storageBucket: "group-5-beehive.firebasestorage.app",
  messagingSenderId: "881489198429",
  appId: "1:881489198429:web:b79a5edb1c5c0e9a0dfcb4"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);