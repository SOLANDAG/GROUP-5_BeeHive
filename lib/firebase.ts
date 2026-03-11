import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDkuLnvgJz-3198SIczbIeaHoULOnypXCU",
  authDomain: "group-5-beehive.firebaseapp.com",
  projectId: "group-5-beehive",
  storageBucket: "group-5-beehive.appspot.com",
  messagingSenderId: "881489198429",
  appId: "1:881489198429:web:b79a5edb1c5c0e9a0dfcb4",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);