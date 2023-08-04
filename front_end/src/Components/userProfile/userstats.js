import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const Userstats = () => {
    const location = useLocation();
    const userId = location.state?.userId;
    const [user, setUser] = useState('');

    useEffect(() => {
        fetchUserStatistics();
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
                        </TableRow>

                    </TableBody>}
                </Table>
            </TableContainer>
        </div>
    );

};

export default Userstats;
