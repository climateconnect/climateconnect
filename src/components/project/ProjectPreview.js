import React from "react";
import Router from "next/router";
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
    display: "flex",
    height: 138
  },
  media: {
    width: 250,
    backgroundSize: "cover"
  }
});

export default function ProjectPreview({ project }) {
  const classes = useStyles();

  return (
    <Card
      className={classes.root}
      variant="outlined"
      onClick={() => {
        Router.push(`/projects/${project.id}`);
      }}
    >
      <CardMedia
        className={classes.media}
        component={"img"}
        title={project.name}
        image={project.image}
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
