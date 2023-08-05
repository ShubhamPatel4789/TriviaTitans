import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const Userstats = () => {

    const userId = localStorage.getItem('userEmail');
    const [user, setUser] = useState('');
    const [userTeam, setUserTeam] = useState([]);
    const [globalUser, setGlobalUser] = useState([]);

    useEffect(() => {
        console.log('User ID user stats:', userId);
        fetchUserStatistics();
        fetchUserTeamStatistics();
        globalUserStatistics();
        console.log('User ID user stats:', userId);
    }, []);

    const fetchUserStatistics = async () => {
        try {
            const response = await axios.post(
                'https://q9hqoptz1b.execute-api.us-east-1.amazonaws.com/stage1',
                {
                    body: JSON.stringify({
                        "userId": userId,
                    }),
                }
            );
            console.log(response.data);
            setUser(JSON.parse(response.data.body));
            console.log('User statistics:', response.data);
        } catch (error) {
            console.error('Error fetching user statistics:', error);
        }
    };

    const fetchUserTeamStatistics = async () => {
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
            setUserTeam(JSON.parse(response.data.body));
            console.log('User teams:', response.data);
        } catch (error) {
            console.error('Error fetching user statistics:', error);
        }
    };

    const globalUserStatistics = async () => {
        try {
            const response = await axios.post(
                'https://c1c0eu2ub2.execute-api.us-east-1.amazonaws.com/stage1',
            );
            console.log(response.data);
            setGlobalUser(JSON.parse(response.data.body));
            console.log('User teams:', response.data);
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
                            <TableCell>User ID</TableCell>
                            <TableCell>Total Score</TableCell>
                            <TableCell>Wins</TableCell>
                            <TableCell>Losses</TableCell>
                            <TableCell>Wins/Loss ratio</TableCell>
                            <TableCell>Total Points</TableCell>
                            <TableCell>Achievements</TableCell>
                        </TableRow>
                    </TableHead>
                    {user && <TableBody>
                        <TableRow>
                            <TableCell>{user.user_id}</TableCell>
                            <TableCell>{user.games_played}</TableCell>
                            <TableCell>{user.wins}</TableCell>
                            <TableCell>{user.losses}</TableCell>
                            <TableCell>{(user.wins / user.losses).toFixed(2)}</TableCell>
                            <TableCell>{user.total_points}</TableCell>

                        </TableRow>
                    </TableBody>}
                </Table>
            </TableContainer>

            <h2>User Team Statistics</h2>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Game ID</TableCell>
                            <TableCell>Team Name</TableCell>
                            <TableCell>Team Score</TableCell>
                            <TableCell>Category</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {userTeam.map((dataItem, index) => (
                            <TableRow key={index}>
                                <TableCell>{dataItem.user_id}</TableCell>
                                <TableCell>{dataItem.game_id}</TableCell>
                                <TableCell>{dataItem.team_name}</TableCell>
                                <TableCell>{dataItem.total_score}</TableCell>
                                <TableCell>{dataItem.category}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <h2>Global Leaderboard</h2>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User ID</TableCell>
                            <TableCell>Total Score</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(globalUser).map(([userId, totalScore]) => (
                            <TableRow key={userId}>
                                <TableCell>{userId}</TableCell>
                                <TableCell>{totalScore}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>


        </div>
    );
};

export default Userstats;
