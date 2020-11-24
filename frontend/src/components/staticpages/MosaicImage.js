import React from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { toDate } from "date-fns";

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative",
    height: "100%",
    ["&:after"]: {
      content: "",
      display: "block",
      paddingBottom: "100%"
    }
  },
  table: {
    position: "absolute",
    height: "100%",
    width: "66%",
    right: 0,
    borderSpacing: 0,
    borderCollapse: "collapse"
  },
  item: {
    width: "100%"
  }
}));

export default function MosaicImage({ items, itemsPerLine, itemsPerRow }) {
  const itemsToRender = getMatrix(items, itemsPerLine, itemsPerRow);
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <table cellPadding="0" cellSpacing="0" className={classes.table} spacing={0}>
        {itemsToRender.map((line, lineIndex) => (
          <tr key={lineIndex}>
            {line.map((element, index) => (
              <td key={lineIndex + " " + index}>
                <img className={classes.item} src={element.src} alt={element.alt} />
              </td>
            ))}
          </tr>
        ))}
      </table>
    </div>
  );
}

const getMatrix = (items, numberPerLine, numberPerRow) => {
  const matrix = [];
  for (let i = 0; i < numberPerRow; i++) {
    const line = [];
    for (let j = 0; j < numberPerLine; j++) {
      const item = items[i * numberPerLine + j]
      if(item)
        line.push(item)
      else
        line.push({src: "", alt: ""})
    }
    console.log(line)
    matrix.push(line);
  }
  return matrix;
};
