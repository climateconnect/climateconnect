import React from "react";
import Link from "next/link";
import { Icon, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    root: {
      textAlign: "center",
      marginBottom: theme.spacing(8)
    },
    linkText: {
      textDecoration: "underline",
      color: "inherit"
    }
  };
});

export default function InfoLink({ data }) {
  const classes = useStyles();

  return (
    <Typography variant="h4" color="primary" className={classes.root}>
      <Link href={data.href} target="_blank" rel="noopener noreferrer" className={classes.linkText}>
        <a className={classes.linkText}>
          <Icon className={data.icon} />
          {data.text}
        </a>
      </Link>
    </Typography>
  );
}

/*const LinkContainer = styled.div`
  margin: 0 auto;
  margin-bottom: 50px;
  span {
    display: inline-block;
    margin-right: 10px;
    font-size: 32px;
  }
  h2 {
    display: inline-block;
    margin-top: 0px;
    vertical-align: top;
  }
  a {
    color: hsla(185, 56%, 30%, 1);
  }
`;*/
