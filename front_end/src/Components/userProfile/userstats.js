import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const Userstats = () => {

    const userId = localStorage.getItem('userId');
    const [user, setUser] = useState('');
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        fetchUserStatistics();
        fetchAllUsers();
        console.log('User ID user stats:', userId);
    }, []);

    const fetchUserStatistics = async () => {
        try {
            const response = await axios.post(
                'https://rlohu2l7bk.execute-api.us-east-1.amazonaws.com/stage1',
                {
                    body: JSON.stringify({
                        "userId": userId,
                    }),
                }
            );
            setUser(JSON.parse(response.data.body));
            console.log('User statistics:', response.data);
        } catch (error) {
            console.error('Error fetching user statistics:', error);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const response = await axios.get(
                'https://your-api-url.com/all-users' // Replace with the actual API URL
            );
            setAllUsers(response.data);
            console.log('All users:', response.data);
        } catch (error) {
            console.error('Error fetching all users:', error);
        }
    };

    const compareAchievements = (otherUser) => {
        if (user.totalPoints > otherUser.totalPoints) {
            return `${user.name} has more total points than ${otherUser.name}`;
        } else if (user.totalPoints < otherUser.totalPoints) {
            return `${otherUser.name} has more total points than ${user.name}`;
        } else {
            return `${user.name} and ${otherUser.name} have the same total points`;
        }
    };
    

    return (
        <div>
            <h2>User Statistics</h2>
            <TableContainer component={Paper}>
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
                            <TableCell>Compare Achievements</TableCell>
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
            </TableContainer>
        </div>
    );
};

export default Userstats;
