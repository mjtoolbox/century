import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCteiYpqIebt8gu2LhMymi2Z-_9QvBZLIs",
    authDomain: "century-cb33e.firebaseapp.com",
    projectId: "century-cb33e",
    storageBucket: "century-cb33e.appspot.com",
    messagingSenderId: "744169967309",
    appId: "1:744169967309:web:bab7a81c4be01cb59a2384",
    measurementId: "G-KCJYQ86X3Y"
  };
   
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  // Initialize Firebase Authentication and get a reference to the service
  export const auth = getAuth(app);
  export default app;