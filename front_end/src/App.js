import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TriviaManagementPage from './Components/TriviaManagementPage';
import QuestionManagementPage from './Components/QuestionManagementPage';
import ViewAllTriviaPage from './Components/ViewAllTriviaPage';
import TriviaGamePage from './Components/TriviaGamePage';
import Leaderboards from './Components/Leaderboards';
import GameplayData from './Components/GameplayData';
import Header from './Components/Header';
import Footer from './Components/Footer';
import TeamManagement from './Components/TeamManagement';
import UserRegister from './Components/register/userRegister';
import MultiFactorAuth from './Components/multiFactorAuthenticationPage/mfaauth';
import SingleFactorAuth from './Components/multiFactorAuthenticationPage/loginauth';
import EditProfile from './Components/userProfile/editUserProfile';
import Userstats from './Components/userProfile/userstats';
import LandingPage from './Components/LandingPage';
import InviteUsersPage from './Components/InviteUsersPage';
import TeamStatistics from  './Components/TeamStatistics';
import Administration from './Components/Administration';
import AWS from 'aws-sdk';
import Login from './Components/login/login';


AWS.config.update({
    accessKeyId: 'ASIAZSAR76KN6DBHJ4XL',
    secretAccessKey: '33xRZu1p6+i0ifPKuRev+2WSm116kR/sZQ6eyiOB',
    sessionToken:'FwoGZXIvYXdzEJ3//////////wEaDKEjIwfX2TGgRVtH2SLAAY0k0r32iG0qBX+SbmsxDWZ2eX0ugc3XxLRCQKBAlNzs0HsAyzLr6eaUMeXNaKB46AcGQW+AAUxlI7Cj4dMM5Y7jZ5LAbK9iDLY0YdR4Z8BOQICqmp/33ZbA1FiYwC64+y37a/GJmKPn56BbOO9q21thgEt8l8rDMjk2on99RPg3AYokHDVKb5tUUIC1h/cp0ZpncHURA1K/5/+2//rlhIVVrpKRpqp4cOsvFo47/F67W074UVivHhn2NNjFcYFwgSj7pbWmBjItt2iR6nXKlXi3PZc2sIMMvoAVDnJXwS9qupO+wsh9wym/D5I05bvzlPVTi+BW',
    region: 'us-east-1'
  });

const App = () => {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<QuestionManagementPage />} />
                <Route path="/trivia" element={<TriviaManagementPage />} />
                <Route path="/browse-games" element={<ViewAllTriviaPage />} />
                <Route path="/play" element={<TriviaGamePage />} />
                <Route path="/leaderboards" element={<Leaderboards />} />
                <Route path="/gameplay" element={<GameplayData />} />
                <Route path="/teamManagement" element={<TeamManagement />} />
                <Route path="/register" element={<UserRegister />} />
                <Route path="/login" element={<Login />} />
                <Route path="/mfa" element={<MultiFactorAuth />} />
                <Route path="/loginmfa" element={<SingleFactorAuth />} />
                <Route path="/userdetails" element={<EditProfile />} />
                <Route path="/userstats" element={<Userstats />} />
                <Route path="/landing-page/" element={<LandingPage />} />
                <Route path="/invite-users/:teamName" element={<InviteUsersPage />} />
                <Route path="/teamStatistics/" element={<TeamStatistics />} />
                <Route path="/administration" element={<Administration />} />     
            </Routes>
            <Footer />
        </Router>
    );
};

export default App;
