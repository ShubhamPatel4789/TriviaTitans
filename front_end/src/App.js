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
  accessKeyId: 'ASIAZSAR76KNUSKCMY26',
  secretAccessKey: 'zaFN3Hm7gnxN873cz0E7H9mQrhSWAUvzgJe2FWCY',
  sessionToken:'FwoGZXIvYXdzEGcaDCpgZ5Q6hrYzsrnAgiLAAckfbeA1dylUuNIbZJhkTl2uI2bTSX6UuEFc70J3PV/DhdrOc/ibeNG08dLJm3mCh+Dubu/Jh91x4FN0n77Uwl6HPpuPlzua8Kw7Oy/nBOWjHIETLqJi5jNc4b7lgORPzm+J9KgOzleiuCGFQD+4uJgX/9LRn/3IFslPL+FGUhyMaGTxgHuqWFoUHSzeLp8OjpPXzROnhftx8ELFK3sNoEme2n8tCOwxP7eDg4VPzxeF56URAd5XuI+h3ol93a9XRyjBrKmmBjIti9y4DvPl9mDNwH2wj5G5nBJRS8cWRQC/8qEHJcnUh9GAAyeTSejiOIFn8c83',
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
