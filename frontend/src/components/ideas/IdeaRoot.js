import { Avatar, Card, Grid, makeStyles, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';
import { getImageUrl } from "../../../public/lib/imageOperations";
import theme from '../../themes/theme';


const useStyles = makeStyles({
    root: {
        width: '700px',
        borderColor: theme.palette.primary.main
    },
    closeStyle: {
        borderRadius: '30px'
    },
    ideaInfo: {
        width: '80%',
        marginTop: '30px',
        marginLeft: '30px'
    },
    userInfo: {
        marginTop: '20px'
    },
    userName: {
        marginLeft: '10px',
        marginTop: '5px'
    },
    name: {
        fontWeight: 'bold',
    },
    shortDescription: {
        fontWeight: 'normal',
        opacity: 1
    }
})

export default function IdeaRoot({idea, onIdeaClose}) {
    const classes = useStyles();
    console.log(idea.user.thumbnail_image)
    const ideaCreator = `${idea.user.first_name} ${idea.user.last_name}`
    const handleIdeaEditClose = (e) => {
        onIdeaClose(e)
        console.log("dip closing")
    }

    return (
        <Card variant="outlined" className={classes.root}>
            <CloseIcon className={classes.closeStyle} onClick={handleIdeaEditClose}/>
            <div className={classes.ideaInfo}>
                <Typography className={classes.name} variant="h5">{idea.name}</Typography>
                <Typography variant="body1">{idea.short_description}</Typography>
                <Grid container className={classes.userInfo}>
                    <Grid item>
                        <Avatar alt={idea.user.url_slug} src={getImageUrl(idea.user.thumbnail_image)}/>
                    </Grid>
                    <Grid item className={classes.userName}>
                        <Typography variant="body1">{ideaCreator}</Typography>
                    </Grid>
                </Grid>
            </div>
        </Card>
    )
}