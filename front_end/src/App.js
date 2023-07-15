import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LandingPage from './Components/LandingPage/LandingPage';
import InviteUsers from './Components/InviteUsers/InviteUsers'
function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/invite-users" element={<InviteUsers />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
