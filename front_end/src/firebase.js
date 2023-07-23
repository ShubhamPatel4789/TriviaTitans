import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyDtnWmSTJzvTjmZSODH36z-uEf9RsjqX2I",
  authDomain: "sdp17-82abe.firebaseapp.com",
  projectId: "sdp17-82abe",
  storageBucket: "sdp17-82abe.appspot.com",
  messagingSenderId: "717390504965",
  appId: "1:717390504965:web:3f12baecd4d31750f3286c"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
