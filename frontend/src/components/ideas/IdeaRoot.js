import React, {useState, useContext} from 'react';
import { Avatar, Card, Grid, makeStyles, Typography, Slider } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import LocationOn from '@material-ui/icons/LocationOn';
import { getImageUrl } from "../../../public/lib/imageOperations";
import theme from '../../themes/theme';
import { apiRequest } from '../../../public/lib/apiOperations';
import Cookies from 'universal-cookie';
import UserContext from "../context/UserContext";


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
        marginTop: '1.25rem'
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
    },
    locationInfo: {
        marginTop: '1.25rem'
    },
    locationName: {
        marginLeft: '10px',
    }
})

export default function IdeaRoot({idea, onIdeaClose, ideaRating}) {
    const classes = useStyles();
    console.log("dip", ideaRating);
    const token = new Cookies().get("token");
    const { locale } = useContext(UserContext);
    const ideaCreator = `${idea.user.first_name} ${idea.user.last_name}`
    const handleIdeaEditClose = (e) => {
        onIdeaClose(e);
    }
    const handleRatingChange = (event, newRating) => {
        event.preventDefault();
        console.log(newRating);
        /* const payload = {
            rating: newRating
        }
        try {
            const response = await apiRequest({
                method: "post",
                url: `/api/ideas/${idea.url_slug}/rating/`,
                payload: payload,
                token: token,
                locale: locale
            })
            setIdeaRating(response.data.rating)
        } catch(err) {
            console.log(err);
        } */
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
                <Grid container className={classes.locationInfo}>
                    <Grid item>
                        <LocationOn/>
                    </Grid>
                    <Grid item className={classes.locationName}>
                        <Typography variant="body1">{idea.location}</Typography>
                    </Grid>
                </Grid>
                <div>
                    <Slider value={ideaRating} 
                        onChange={handleRatingChange} 
                        aria-labelledby="continuous-slider" 
                    />
                </div>
            </div>
        </Card>
    )
}