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

// Define difficulty levels and timeframes for the trivia game
const difficultyLevels = ['easy', 'medium', 'difficult'];
const timeframes = [5, 10, 15, 20];

// Define styles using Material-UI makeStyles
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
        paddingBottom: theme.spacing(8),
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: theme.spacing(1),
        backgroundColor: theme.palette.background.paper,
    },
}));

const TriviaManagementPage = () => {
    // Initialize state variables using the useState hook
    const classes = useStyles();
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState(null);
    const [difficulty, setDifficulty] = useState(null);
    const [timeframe, setTimeframe] = useState(null);
    const [triviaName, setTriviaName] = useState('');
    const [description, setDescription] = useState('');

    // Fetch categories from the API when the component mounts
    useEffect(() => {
        axios.get('https://us-east1-sdp17-392601.cloudfunctions.net/getAllCategories')
            .then((response) => {
                // Map fetched categories to options format for Select
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

    // Event handlers for changing category, difficulty, and timeframe
    const handleCategoryChange = (selectedOption) => {
        setCategory(selectedOption);
    };

    const handleDifficultyChange = (selectedOption) => {
        setDifficulty(selectedOption);
    };

    const handleTimeframeChange = (selectedOption) => {
        setTimeframe(selectedOption);
    };

    // Event handlers for changing trivia name and description
    const handleTriviaNameChange = (event) => {
        setTriviaName(event.target.value);
    };

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };

    // Function to create a new trivia game
    const handleCreateGame = () => {
        if (!category || !difficulty || !timeframe) {
            return;
        }

        // Construct new game object
        const newGame = {
            triviaName,
            category: category.value,
            difficultyLevel: difficulty.value,
            timeframe: timeframe.value,
            shortDescription: description,
        };

        // Send POST request to create the trivia game
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
            {/* Title */}
            <Typography variant="h5" align="center" gutterBottom>
                Trivia Management Page
            </Typography>

            {/* Form elements */}
            <Grid container spacing={2}>
                {/* Select category */}
                <Grid item xs={12}>
                    <Select
                        className={classes.formControl}
                        options={categories}
                        value={category}
                        onChange={handleCategoryChange}
                        placeholder="Select category"
                    />
                </Grid>

                {/* Select difficulty */}
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

                {/* Select timeframe */}
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

                {/* Enter trivia name */}
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

                {/* Enter description */}
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

                {/* Create game button */}
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
