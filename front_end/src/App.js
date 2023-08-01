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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


AWS.config.update({
  accessKeyId: 'ASIAZSAR76KNQPTVMTM4',
  secretAccessKey: 'dqabGJVE0mGRfziOddG3N/Cy/eacQjsJ1mPGOFCi',
  sessionToken:'FwoGZXIvYXdzEEEaDJmA5qQFpBBi4tt0XSLAAexRUOUFiUfuXs9yU4NkC2OSglj1FGNieRx6u9A5KLO68qnTkht0iE3yZV2Prf1ABH8Bj+obx46K60vf5Wzlq9YoZLLc4wCU2VEDBpF6zaoTSkjcqSrEw2V5D2hX2vzEDLHeEvRB2ULHeFFACaSmViNO56PLfBvrPyArXAGTId7AnF6unlmK/XmKUEwxOfDsgIfx54OXTB3OdUk0Pic7sCcmvPZFwUAkb8b8YupNW4ycGjnUq9HPemZ78bQzQV5oFSjIiKGmBjIt7gV3DDlVyJsxffhL1mwEI9+5SzneNl/ChNo7Z94c1X4om8X4r8+8l4DFcHas',
  region: 'us-east-1'
});

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<UserRegister />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mfa" element={<MultiFactorAuth />} />
          <Route path="/loginmfa" element={<SingleFactorAuth />} />
          <Route path="/invite-users/:teamName" element={<InviteUsers />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
