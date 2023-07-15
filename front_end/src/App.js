import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TriviaManagementPage from './Components/TriviaManagementPage';
import QuestionManagementPage from './Components/QuestionManagementPage';
import ViewAllTriviaPage from './Components/ViewAllTriviaPage';



const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<QuestionManagementPage />} />
                <Route path="/trivia" element={<TriviaManagementPage />} />
                <Route path="/browse-games" element={<ViewAllTriviaPage />} />
            </Routes>
        </Router>
    );
};

export default App;
