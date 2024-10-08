// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyiBg7M418a5F0VW7uHLzpTtO2fou7g6U",
  authDomain: "chatterbox-e329c.firebaseapp.com",
  projectId: "chatterbox-e329c",
  storageBucket: "chatterbox-e329c.appspot.com",
  messagingSenderId: "293387970762",
  appId: "1:293387970762:web:4ac39d1559141bb28e6c33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const database = getDatabase(app);
const storage = getStorage(app);

export { auth, database, storage };