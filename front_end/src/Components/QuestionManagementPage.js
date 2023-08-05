import React, { useEffect, useState } from 'react';
import {
    // Import Material-UI components for UI design
    Container,
    Typography,
    Button,
    Grid,
    Box,
    Paper,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    Tabs,
    Tab,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
    // Styling for question cards
    questionCard: {
        padding: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    // Styling for answer text
    answerText: {
        fontWeight: 'bold',
        marginTop: theme.spacing(1),
    },
    editDialog: {
        minWidth: 400,
    },
    dropdownContainer: {
        marginBottom: theme.spacing(2),
    },
    categoryList: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginBottom: theme.spacing(2),
    },
    categoryItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: theme.spacing(1),
    },
}));

const QuestionManagementPage = () => {
    // Initialize state variables using the useState hook
    const classes = useStyles();
    const [questions, setQuestions] = useState([]);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [editedQuestion, setEditedQuestion] = useState('');
    const [editedOptions, setEditedOptions] = useState({
        OptionA: '',
        OptionB: '',
        OptionC: '',
        OptionD: '',
        DifficultyLevel: '',
        Answer: '',
        Explanation: '',
    });
    const [openEditDialog, setOpenEditDialog] = useState(false);
    // Fetch questions and categories when the component mounts
    const [newQuestion, setNewQuestion] = useState({
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        difficultyLevel: '',
        category: '',
        answer: '',
        explanation: '',
    });
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [categories, setCategories] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [openAddCategoryDialog, setOpenAddCategoryDialog] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        fetchQuestions();
        fetchCategories();
    }, []);

    // Function to fetch questions from the server
    const fetchQuestions = async () => {
        try {
            const response = await axios.get('https://us-east1-sdp17-392601.cloudfunctions.net/getAllQuestions');
            setQuestions(response.data.questions);
        } catch (error) {
            console.log(error);
        }
    };

    // Function to fetch categories from the server
    const fetchCategories = async () => {
        try {
            const response = await axios.get('https://us-east1-sdp17-392601.cloudfunctions.net/getAllCategories');
            setCategories(response.data.categories);
        } catch (error) {
            console.log(error);
        }
    };

    // Function to handle editing a question
    const handleEditQuestion = (questionId) => {
        const questionToEdit = questions.find((question) => question.id === questionId);
        if (questionToEdit) {
            setEditingQuestion(questionToEdit);
            setEditedQuestion(questionToEdit.Question);
            setEditedOptions({
                OptionA: questionToEdit.OptionA,
                OptionB: questionToEdit.OptionB,
                OptionC: questionToEdit.OptionC,
                OptionD: questionToEdit.OptionD,
                DifficultyLevel: questionToEdit.DifficultyLevel,
                Answer: questionToEdit.Answer,
                Explanation: questionToEdit.Explanation,
            });
            setOpenEditDialog(true);
        }
    };

    // Function to close the edit dialog
    const handleCloseEditDialog = () => {
        setEditingQuestion(null);
        setEditedQuestion('');
        setEditedOptions({
            OptionA: '',
            OptionB: '',
            OptionC: '',
            OptionD: '',
            DifficultyLevel: '',
            Answer: '',
            Explanation: '',
        });
        setOpenEditDialog(false);
    };

    // Function to handle changes in the new question form
    const handleNewQuestionChange = (field, value) => {
        setNewQuestion((prevQuestion) => ({
            ...prevQuestion,
            [field]: value,
        }));
    };

    // Function to save an edited question
    const handleSaveEditedQuestion = async () => {
        if (!editingQuestion) return;

        const updatedQuestion = {
            ...editingQuestion,
            Question: editedQuestion,
            OptionA: editedOptions.OptionA,
            OptionB: editedOptions.OptionB,
            OptionC: editedOptions.OptionC,
            OptionD: editedOptions.OptionD,
            DifficultyLevel: editedOptions.DifficultyLevel,
            Answer: editedOptions.Answer,
            Explanation: editedOptions.Explanation,
        };

        try {
            await axios.put(`https://us-east1-sdp17-392601.cloudfunctions.net/editQuestion?document_id=${editingQuestion.id}`, updatedQuestion);
            fetchQuestions();
            handleCloseEditDialog();
        } catch (error) {
            console.log(error);
        }
    };

    // Function to delete a question
    const handleDeleteQuestion = async (questionId) => {
        try {
            const questionToDelete = questions.find((question) => question.id === questionId);
            if (questionToDelete) {
                await axios.delete(`https://us-east1-sdp17-392601.cloudfunctions.net/deletequestion?document_id=${questionToDelete.id}`);
                fetchQuestions();
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Function to add a new question
    const handleAddQuestion = () => {
        setOpenAddDialog(true);
    };

    const handleCloseAddDialog = () => {
        setNewQuestion({
            question: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            difficultyLevel: '',
            category: '',
            answer: '',
            explanation: '',
        });
        setOpenAddDialog(false);
    };

    // Function to save a new question
    const handleSaveNewQuestion = async () => {
        const { question, optionA, optionB, optionC, optionD, difficultyLevel, category, answer, explanation } = newQuestion;

        const newQuestionData = {
            Category: category,
            Question: question,
            OptionA: optionA,
            OptionB: optionB,
            OptionC: optionC,
            OptionD: optionD,
            Answer: answer,
            DifficultyLevel: difficultyLevel,
            Explanation: explanation,
        };

        try {
            await axios.post('https://us-east1-sdp17-392601.cloudfunctions.net/addquestion', JSON.stringify(newQuestionData), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            fetchQuestions();
            handleCloseAddDialog();
        } catch (error) {
            console.log(error);
        }
    };

    // Function to handle tab change
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    // Function to delete a category
    const handleDeleteCategory = async (category) => {
        try {
            await axios.delete(`https://us-east1-sdp17-392601.cloudfunctions.net/deleteCategory?category=${category}`);
            fetchCategories();
        } catch (error) {
            console.log(error);
        }
    };

    // Function to add a new category
    const handleAddCategory = () => {
        setOpenAddCategoryDialog(true);
    };

    // Function to close the add category dialog
    const handleCloseAddCategoryDialog = () => {
        setNewCategory('');
        setOpenAddCategoryDialog(false);
    };

    const handleSaveNewCategory = async () => {
        try {
            const newCategoryData = {
                Category: newCategory,
            };

            await axios.post('https://us-east1-sdp17-392601.cloudfunctions.net/addCategory', newCategoryData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            fetchCategories();
            handleCloseAddCategoryDialog();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Container maxWidth="md">


            <Tabs value={currentTab} onChange={handleTabChange} centered>
                <Tab label="Question Management" />
                <Tab label="Category Management" />
            </Tabs>
            <br />
            <br />
            {currentTab === 0 && (
                <Box my={4}>
                    <Grid container spacing={2}>
                        {questions.map((question) => (
                            <Grid item xs={12} sm={6} key={question.id}>
                                <Paper className={classes.questionCard}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        {question.Question}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        Option A: {question.OptionA}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        Option B: {question.OptionB}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        Option C:{question.OptionC}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        Option D: {question.OptionD}
                                    </Typography>
                                    <Typography variant="body1" className={classes.answerText}>
                                        Answer: {question.Answer}
                                    </Typography>
                                    <Typography variant="body1" className={classes.answerText}>
                                        Explanation: {question.Explanation}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        Difficulty Level: {question.DifficultyLevel}
                                    </Typography>
                                    <Box mt={2}>
                                        {/* Buttons to edit and delete the question */}
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleEditQuestion(question.id)}
                                            style={{ marginRight: '8px' }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => handleDeleteQuestion(question.id)}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
            {/* Display category list */}
            {currentTab === 1 && (
                <Box my={4} className={classes.categoryList}>
                    {categories.map((category) => (
                        <div key={category} className={classes.categoryItem}>
                            {/* Display category name and delete button */}
                            <Typography variant="body1">{category}</Typography>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => handleDeleteCategory(category)}
                            >
                                Delete
                            </Button>
                        </div>
                    ))}
                </Box>
            )}
            {/* Buttons to add a new question or category */}
            <Box mt={4}>
                {currentTab === 0 && (
                    <Button variant="contained" color="primary" onClick={handleAddQuestion}>
                        Add Question
                    </Button>
                )}
                {currentTab === 1 && (
                    <Button variant="contained" color="primary" onClick={handleAddCategory}>
                        Add Category
                    </Button>
                )}
            </Box>
            {/* Dialog for editing a question */}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog} className={classes.editDialog}>
                <DialogTitle>Edit Question</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Question"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={editedQuestion}
                        onChange={(e) => setEditedQuestion(e.target.value)}
                    />
                    <TextField
                        label="Option A"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={editedOptions.OptionA}
                        onChange={(e) => setEditedOptions({ ...editedOptions, OptionA: e.target.value })}
                    />
                    <TextField
                        label="Option B"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={editedOptions.OptionB}
                        onChange={(e) => setEditedOptions({ ...editedOptions, OptionB: e.target.value })}
                    />
                    <TextField
                        label="Option C"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={editedOptions.OptionC}
                        onChange={(e) => setEditedOptions({ ...editedOptions, OptionC: e.target.value })}
                    />
                    <TextField
                        label="Option D"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={editedOptions.OptionD}
                        onChange={(e) => setEditedOptions({ ...editedOptions, OptionD: e.target.value })}
                    />
                    <div className={classes.dropdownContainer}>
                        <Typography variant="body1">Difficulty Level</Typography>
                        <Select
                            label="Difficulty Level"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={editedOptions.DifficultyLevel}
                            onChange={(e) => setEditedOptions({ ...editedOptions, DifficultyLevel: e.target.value })}
                        >
                            <MenuItem value="easy">Easy</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="difficult">Difficult</MenuItem>
                        </Select>
                    </div>
                    <TextField
                        label="Answer"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={editedOptions.Answer}
                        onChange={(e) => setEditedOptions({ ...editedOptions, Answer: e.target.value })}
                    />
                    <TextField
                        label="Explanation"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={editedOptions.Explanation}
                        onChange={(e) => setEditedOptions({ ...editedOptions, Explanation: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveEditedQuestion} color="primary">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Dialog for adding a new question */}
            <Dialog open={openAddDialog} onClose={handleCloseAddDialog} className={classes.editDialog}>
                <DialogTitle>Add Question</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Question"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newQuestion.question}
                        onChange={(e) => handleNewQuestionChange('question', e.target.value)}
                    />
                    <TextField
                        label="Option A"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newQuestion.optionA}
                        onChange={(e) => handleNewQuestionChange('optionA', e.target.value)}
                    />
                    <TextField
                        label="Option B"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newQuestion.optionB}
                        onChange={(e) => handleNewQuestionChange('optionB', e.target.value)}
                    />
                    <TextField
                        label="Option C"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newQuestion.optionC}
                        onChange={(e) => handleNewQuestionChange('optionC', e.target.value)}
                    />
                    <TextField
                        label="Option D"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newQuestion.optionD}
                        onChange={(e) => handleNewQuestionChange('optionD', e.target.value)}
                    />
                    <TextField
                        label="Answer"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newQuestion.answer}
                        onChange={(e) => handleNewQuestionChange('answer', e.target.value)}
                    />
                    <TextField
                        label="Explanation"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newQuestion.explanation}
                        onChange={(e) => handleNewQuestionChange('explanation', e.target.value)}
                    />
                    <div className={classes.dropdownContainer}>
                        <Typography variant="body1">Difficulty Level</Typography>
                        <Select
                            label="Difficulty Level"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={newQuestion.difficultyLevel}
                            onChange={(e) => handleNewQuestionChange('difficultyLevel', e.target.value)}
                        >
                            <MenuItem value="easy">Easy</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="difficult">Difficult</MenuItem>
                        </Select>
                    </div>

                    <div className={classes.dropdownContainer}>
                        <Typography variant="body1">Category</Typography>
                        <Select
                            label="Category"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={newQuestion.category}
                            onChange={(e) => handleNewQuestionChange('category', e.target.value)}
                        >
                            {categories.map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category}
                                </MenuItem>
                            ))}
                        </Select>
                        <br />
                        <div>
                            <Typography style={{ color: 'red' }}>
                                If the category you want to add does not exist, you can go to the Category Management Tab and add the category.
                            </Typography>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveNewQuestion} color="primary">
                        Save Question
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Dialog for adding a new category */}
            <Dialog open={openAddCategoryDialog} onClose={handleCloseAddCategoryDialog} className={classes.editDialog}>
                <DialogTitle>Add Category</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Category"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddCategoryDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveNewCategory} color="primary">
                        Save Category
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default QuestionManagementPage;
