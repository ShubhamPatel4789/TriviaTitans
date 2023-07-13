import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TriviaManagementPage from './Components/TriviaManagementPage';
import QuestionManagementPage from './Components/QuestionManagementPage';




const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<QuestionManagementPage />} />
                <Route path="/trivia" element={<TriviaManagementPage />} />
            </Routes>
        </Router>
    );
};

export default App;
