import React from "react";
import {
  Typography,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@material-ui/core";
import PlaceIcon from "@material-ui/icons/Place";
import BarChartIcon from "@material-ui/icons/BarChart";
import GroupIcon from "@material-ui/icons/Group";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  root: {
    display: "flex"
  },
  media: {
    width: 250,
    backgroundSize: "cover"
  }
});

export default function ProjectPreview({ project }) {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardMedia
        className={classes.media}
        title={project.name}
        image={`https://picsum.photos/200/200`}
      />
      <CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {project.name}
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <PlaceIcon />
              </ListItemIcon>
              <ListItemText primary={project.location} />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary={project.organisation_name} />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary={`Impact: ${project.impact}`} />
            </ListItem>
          </List>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
