import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <AppBar position="static" style={{ backgroundColor: '#454EB8' }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Trivia Titans
                </Typography>

                <Button color="inherit" component={Link} to="/landing-page">
                    Home
                </Button>
                <Button color="inherit" component={Link} to="/questionmanagement">
                    Content Management
                </Button>
                <Button color="inherit" component={Link} to="/chatbot">
                    Chatbot
                </Button>
                <Button color="inherit" component={Link} to="/trivia">
                    Trivia Management
                </Button>
                <Button color="inherit" component={Link} to="/leaderboards">
                    Leaderboard
                </Button>
                <Button color="inherit" component={Link} to="/gameplay">
                    Gameplay
                </Button>
                <Button color="inherit" component={Link} to="/teamManagement">
                    Team Management
                </Button>
                <Button color="inherit" component={Link} to="/userdetails">
                    User Profile
                </Button>
                <Button color="inherit" component={Link} to="/userstats">
                    User Statistics
                </Button>

            </Toolbar>
        </AppBar>
    );
};

export default Header;
