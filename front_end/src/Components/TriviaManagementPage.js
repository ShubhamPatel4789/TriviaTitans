import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    TextField,
    Button,
    Grid,
    Typography,
} from '@material-ui/core';
import axios from 'axios';
import Select from 'react-select';

const difficultyLevels = ['easy', 'medium', 'difficult'];
const timeframes = [5, 10, 15, 20];


const useStyles = makeStyles((theme) => ({
    formControl: {
        minWidth: 200,
    },
    textField: {
        maxWidth: '100%',
    },
    button: {
        marginTop: theme.spacing(2),
    },
    formContainer: {
        maxWidth: 400,
        margin: 'auto',
        marginTop: theme.spacing(4),
        padding: theme.spacing(2),
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: theme.spacing(1),
        backgroundColor: theme.palette.background.paper,
    },
}));

const TriviaManagementPage = () => {
    const classes = useStyles();
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState(null);
    const [difficulty, setDifficulty] = useState(null);
    const [timeframe, setTimeframe] = useState(null);
    const [triviaName, setTriviaName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        // Fetch categories from API
        axios.get('https://us-east1-sdp17-392601.cloudfunctions.net/getAllCategories')
            .then((response) => {
                const categoryOptions = response.data.categories.map((category) => ({
                    value: category,
                    label: category,
                }));
                setCategories(categoryOptions);
            })
            .catch((error) => {
                console.error('Failed to fetch categories:', error);
            });
    }, []);

    const handleCategoryChange = (selectedOption) => {
        setCategory(selectedOption);
    };

    const handleDifficultyChange = (selectedOption) => {
        setDifficulty(selectedOption);
    };

    const handleTimeframeChange = (selectedOption) => {
        setTimeframe(selectedOption);
    };

    const handleTriviaNameChange = (event) => {
        setTriviaName(event.target.value);
    };

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };

    const handleCreateGame = () => {
        if (!category || !difficulty || !timeframe) {
            return;
        }

        const newGame = {
            triviaName,
            category: category.value,
            difficultyLevel: difficulty.value,
            timeframe: timeframe.value,
            shortDescription: description,
        };

        axios.post('https://us-east1-sdp17-392601.cloudfunctions.net/createtrivia', newGame, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                console.log('Trivia game created:', response.data);
                window.alert('Trivia game has been created!');

            })
            .catch((error) => {
                console.error('Failed to create trivia game:', error);

            });
    };

    return (
        <div className={classes.formContainer}>
            <Typography variant="h5" align="center" gutterBottom>
                Trivia Management Page
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Select
                        className={classes.formControl}
                        options={categories}
                        value={category}
                        onChange={handleCategoryChange}
                        placeholder="Select category"
                    />
                </Grid>

                <Grid item xs={12}>
                    <Select
                        className={classes.formControl}
                        options={difficultyLevels.map((level) => ({
                            value: level,
                            label: level,
                        }))}
                        value={difficulty}
                        onChange={handleDifficultyChange}
                        placeholder="Select difficulty"
                    />
                </Grid>

                <Grid item xs={12}>
                    <Select
                        className={classes.formControl}
                        options={timeframes.map((time) => ({
                            value: time,
                            label: time + ' mins',
                        }))}
                        value={timeframe}
                        onChange={handleTimeframeChange}
                        placeholder="Select timeframe"
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        className={classes.textField}
                        id="trivia-name"
                        label="Trivia Name"
                        fullWidth
                        value={triviaName}
                        onChange={handleTriviaNameChange}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        className={classes.textField}
                        id="description"
                        label="Description"
                        multiline
                        rows={4}
                        fullWidth
                        value={description}
                        onChange={handleDescriptionChange}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Button
                        className={classes.button}
                        variant="contained"
                        color="primary"
                        onClick={handleCreateGame}
                    >
                        Create Trivia Game
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default TriviaManagementPage;
