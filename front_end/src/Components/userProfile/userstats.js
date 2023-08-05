import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const Userstats = () => {

    const userId = localStorage.getItem('userEmail');
    const [user, setUser] = useState('');
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        console.log('User ID user stats:', userId);
        fetchUserStatistics();
        console.log('User ID user stats:', userId);
    }, []);

    const fetchUserStatistics = async () => {
        try {
            const response = await axios.post(
                'https://fwqdy26uz7.execute-api.us-east-1.amazonaws.com/stage1',
                {
                    body: JSON.stringify({
                        "user_Id": userId,
                    }),
                }
            );
            console.log(response.data);
            setUser(JSON.parse(response.data));
            console.log('User statistics:', response.data);
        } catch (error) {
            console.error('Error fetching user statistics:', error);
        }
    };

  
  
    return (
        <div>
            <h2>User Statistics</h2>
            {/* <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Games Played</TableCell>
                            <TableCell>Wins</TableCell>
                            <TableCell>Losses</TableCell>
                            <TableCell>Wins/Loss ratio</TableCell>
                            <TableCell>Total Points</TableCell>
                            <TableCell>Team Affiliations</TableCell>
                            <TableCell>Achievements</TableCell>
                        </TableRow>
                    </TableHead>
                    {user && <TableBody>
                        <TableRow>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.gamesPlayed}</TableCell>
                            <TableCell>{user.wins}</TableCell>
                            <TableCell>{user.losses}</TableCell>
                            <TableCell>{(user.wins / user.losses).toFixed(2)}</TableCell>
                            <TableCell>{user.totalPoints}</TableCell>
                            <TableCell>{user.teamAffiliations.join(', ')}</TableCell>
                            <TableCell>{user.achievements.join(', ')}</TableCell>
                            <TableCell>
                                {allUsers.map((otherUser) => (
                                    <button
                                        key={otherUser.id}
                                        onClick={() => compareAchievements(otherUser)}
                                    >
                                        Compare with {otherUser.name}
                                    </button>
                                ))}
                            </TableCell>
                        </TableRow>
                    </TableBody>}
                </Table>
            </TableContainer> */}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User name</TableCell>
                            <TableCell>Game ID</TableCell>
                            <TableCell>Team Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Total Score</TableCell>
                        </TableRow>
                    </TableHead>
                    <h1>user</h1>
                    {user && <TableBody>
                        <TableRow>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.gamesPlayed}</TableCell>
                            <TableCell>{user.wins}</TableCell>
                            <TableCell>{user.losses}</TableCell>
                    
                        </TableRow>
                    </TableBody>}
                </Table>
            </TableContainer>
        </div>
    );
};

export default Userstats;
