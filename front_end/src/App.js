import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './Components/LandingPage/LandingPage';
import InviteUsers from './Components/InviteUsersPage/InviteUsersPage'
import UserRegister from './Components/register/userRegister';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebaseConfig from './firebaseConfig';
import Login from './Components/login/login';
import MultiFactorAuth from './Components/multiFactorAuthenticationPage/mfaauth';
import SingleFactorAuth from './Components/multiFactorAuthenticationPage/loginauth';
import AWS from 'aws-sdk';
import EditProfile from './Components/userProfile/editUserProfile';
import Userstats from './Components/userProfile/userstats';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


AWS.config.update({
  accessKeyId: 'ASIAZSAR76KN7IE57LMF',
  secretAccessKey: 'TaVZQRe9Y3SgIqGYqqKNwlu0u5L9WElCEWYLZ/7G',
  sessionToken:'FwoGZXIvYXdzEFYaDHLWTEp8/OICaLYntiLAAVV20IqR/OaTzSwGW4j+4IYeGr3Fm51eY6GybTwxRuvGlc6UTy2ptvkRRLzVXHeg3h72ahE8dduGwNRMvn7q8RnRQql3BXso31cxqgkr2HAmxocICz+SBJy3EdY5wK9pZWM8hR8vQFlnkScggOchLHzx2NsDVXYk44uwfxWQeFkVhiD5n28/BXd2nL3LV6LHiv/R/4qX2YwYPOWWCPyZaXbBfy+pretbskon5hbcWD/eCyzMl3/vvC9BMunHgRptzCji0qWmBjItsObdMNph84UQee2c5qxy0b05igb31pOYtnvp1lST4c19YZntQMZrYsRZ3GRg',
  region: 'us-east-1'
});

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/landingpage" element={<LandingPage />} />
          <Route path="/register" element={<UserRegister />} />
          <Route path="/" element={<Login />} />
          <Route path="/mfa" element={<MultiFactorAuth />} />
          <Route path="/loginmfa" element={<SingleFactorAuth />} />
          <Route path="/userdetials" element={<EditProfile />} />
          <Route path="/userstats" element={<Userstats />} />
          <Route path="/invite-users/:teamName" element={<InviteUsers />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
