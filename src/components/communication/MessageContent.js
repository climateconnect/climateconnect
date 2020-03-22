import React from "react";
import PropTypes from "prop-types";
import Linkify from "react-linkify";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  link: {
    color: "inherit",
    "&:visited": {
      color: "inherit"
    }
  }
});

export default function MessageContent({ content }) {
  const classes = useStyles();
  //workaround to get target="_blank" because setting 'properties' on the Linkify component doesn't work
  const componentDecorator = (href, text, key) => (
    <a href={href} className={classes.link} key={key} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );

  return (
    <Linkify componentDecorator={componentDecorator}>
      {content.split("\n").map((i, key) => {
        if (!i.length) return <br key={key} />;
        return <div key={key}>{i ? i : " "}</div>;
      })}
    </Linkify>
  );
}

MessageContent.propTypes = {
  content: PropTypes.string.isRequired
};
