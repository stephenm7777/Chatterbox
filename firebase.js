// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const auth = getAuth(app);