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
import ChatBot from './Components/virtualAssitance/ChatBot';



AWS.config.update({
    accessKeyId: 'AKIAQHAP7NSQ7DZKVZIP',
    secretAccessKey: '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',
    region: 'us-east-1'
  });

const App = () => {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/questionmanagement" element={<QuestionManagementPage />} />
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
                <Route path="/chatbot" element={<ChatBot />} /> 
            </Routes>
            <Footer />
        </Router>
    );
};

export default App;
