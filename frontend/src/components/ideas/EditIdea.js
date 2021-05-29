import React from 'react';
import {makeStyles, Paper, Typography} from '@material-ui/core';
import theme from '../../themes/theme'


const useStyles = makeStyles({
    root: {
        width: '700px',
        borderColor: theme.palette.primary.main
    },
    ideaInfo: {
        width: '80%',
        marginTop: '30px',
        marginLeft: '30px'
    },
    name: {
        fontWeight: 'bold',
    },
    shortDescription: {
        fontWeight: 'normal',
        opacity: 1
    }
})

export default function EditIdea({idea}) {
    const classes = useStyles();
    console.log(idea.user);
    return (
        <Paper variant="outlined" className={classes.root}>
            <div className={classes.ideaInfo}>
                <Typography className={classes.name} variant="h5">{idea.name}</Typography>
                <Typography variant="body1">{idea.short_description}</Typography>
            </div>
        </Paper>
    )
}