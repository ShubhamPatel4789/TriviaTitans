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
            </Routes>
            <Footer />
        </Router>
    );
};

export default App;
