import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyCcReSI8FoR3SC6Kt0_2ZQMqLvnfndIGE4",
  authDomain: "sdp17-392601.firebaseapp.com",
  projectId: "sdp17-392601",
  storageBucket: "sdp17-392601.appspot.com",
  messagingSenderId: "171588375686",
  appId: "1:171588375686:web:05f561a41ade4019f72d07"
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
