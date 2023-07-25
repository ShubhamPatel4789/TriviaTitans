import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LandingPage from './Components/LandingPage/LandingPage';
import InviteUsers from './Components/InviteUsersPage/InviteUsersPage'
import TeamStatistics from './Components/TeamStatistics/TeamStatistics';
import HomePage from './Components/HomePage/HomePage';
function App() {
  
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/landing-page/" element={<LandingPage />} />
          <Route path="/invite-users/:teamName" element={<InviteUsers />} />
          <Route path="/teamStatistics/" element={<TeamStatistics />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
