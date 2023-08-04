import React from 'react';
import { Container, Typography, Link,  } from '@mui/material';
import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles((theme) => ({
    footer: {
        marginTop: theme.spacing(4),
        padding: theme.spacing(2),
        backgroundColor: '#454EB8',
        color: theme.palette.primary.contrastText,
    },
}));

const Footer = () => {
    const classes = useStyles();

    return (
        <footer className={classes.footer}>
            <Container maxWidth="lg">
                <Typography variant="h6" align="center" gutterBottom>
                    Trivia Titans
                </Typography>
                <Typography variant="body2" align="center">
                    © {new Date().getFullYear()} All rights reserved
                </Typography>
            </Container>
        </footer>
    );
};

export default Footer;
