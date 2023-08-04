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

import LandingPage from './Components/LandingPage';
import InviteUsersPage from './Components/InviteUsersPage';
import TeamStatistics from  './Components/TeamStatistics';
import Administration from './Components/Administration';
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
