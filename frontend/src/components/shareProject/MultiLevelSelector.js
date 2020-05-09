import React from "react";
import { List, ListItem, ListItemText, ListItemIcon, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles(theme => {
  return {
    wrapper: {
      margin: "0 auto",
      display: "table"
    },
    list: {
      display: "inline-block",
      marginTop: theme.spacing(8),
      marginLeft: theme.spacing(8)
    },
    subList: props => {
      return {
        display: "inline-block",
        marginTop: theme.spacing(8 + props.offset * 8),
        verticalAlign: "top"
      };
    },
    listItem: {
      border: "1px solid black",
      borderTop: 0,
      height: theme.spacing(8),
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(1)
    },
    subListItem: {
      borderLeft: 0
    },
    firstItem: {
      borderTop: "1px solid black"
    },
    borderLeft: {
      borderLeft: "1px solid black"
    },
    icon: {
      margin: "0 auto"
    },
    expanded: {
      color: "white"
    },
    hidden: {
      display: "none"
    },
    selectedWrapper: {
      display: "inline-block",
      verticalAlign: "top",
      marginTop: theme.spacing(10),
      marginLeft: theme.spacing(16)
    },
    selectedItemsHeader: {
      fontWeight: "bold"
    },
    selectedItem: {
      background: theme.palette.primary.main,
      color: "white",
      marginBottom: theme.spacing(1),
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
        color: "white"
      }
    },
    selectedItemIcon: {
      paddingLeft: theme.spacing(2),
      color: "red"
    },
    listWrapper: {
      display: "inline-block",
      width: 650
    }
  };
});

export default function MultiLevelSelector({
  selected,
  setSelected,
  itemsToSelectFrom,
  maxSelections,
  itemNamePlural
}) {
  const [expanded, setExpanded] = React.useState("agriculture");

  const classes = useStyles();

  const onClickExpand = key => {
    if (expanded === key) setExpanded(null);
    else setExpanded(key);
  };

  const onClickSelect = item => {
    if (selected.length >= maxSelections) alert("You can only choose up to 3 " + itemNamePlural);
    setSelected([...selected, item]);
  };

  const onClickUnselect = item => {
    console.log("unselecting on click!");
    console.log(item);
    console.log(
      selected
        .slice(0, selected.indexOf(item))
        .concat(selected.slice(selected.indexOf(item) + 1, selected.length))
    );
    setSelected(
      selected
        .slice(0, selected.indexOf(item))
        .concat(selected.slice(selected.indexOf(item) + 1, selected.length))
    );
  };

  return (
    <>
      <div className={classes.wrapper}>
        <div className={classes.listWrapper}>
          <ListToChooseFrom
            itemsToSelectFrom={itemsToSelectFrom}
            onClickExpand={onClickExpand}
            expanded={expanded}
            onClickSelect={onClickSelect}
            selected={selected}
          />
        </div>
        <div className={classes.selectedWrapper}>
          <Typography component="h2" variant="h5" className={classes.selectedItemsHeader}>
            {selected.length > 0
              ? "Selected " + itemNamePlural
              : "Select up to " + maxSelections + " " + itemNamePlural}
          </Typography>
          <List>
            {selected.map((item, index) => (
              <ListItem
                key={item.key + "selected"}
                button
                className={`${classes.listItem} ${index == 0 && classes.firstItem} ${
                  classes.selectedItem
                }`}
                onClick={() => onClickUnselect(item)}
                disableRipple
              >
                <ListItemText>{item.name}</ListItemText>
                <ListItemIcon className={classes.selectedItemIcon}>
                  <CloseIcon />
                </ListItemIcon>
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    </>
  );
}

function ListToChooseFrom({
  className,
  isSubList,
  parentEl,
  parentList,
  itemsToSelectFrom,
  onClickExpand,
  expanded,
  onClickSelect,
  selected
}) {
  const index = isSubList ? parentList.indexOf(parentEl) : 0;
  const subListHeightCorrection = isSubList
    ? Math.min(index, Math.max(0, itemsToSelectFrom.length - parentList.length + index))
    : 0;
  const offset = index - subListHeightCorrection;

  const classes = useStyles({ offset: offset });
  return (
    <>
      <List
        className={`${!isSubList && classes.list} ${isSubList &&
          (expanded === parentEl.key ? classes.subList : classes.hidden)} ${className}`}
      >
        {itemsToSelectFrom.map((item, index) => (
          <ListItem
            button
            disabled={selected.includes(item)}
            classes={{
              root: `${classes.listItem} 
                      ${index == 0 && classes.firstItem} 
                      ${isSubList && classes.subListItem} 
                      ${isSubList && index >= parentList.length && classes.borderLeft}`,
              selected: classes.expanded
            }}
            key={item.key}
            selected={expanded === item.key}
            onClick={() => {
              if (item.subcategories && item.subcategories.length) return onClickExpand(item.key);
              else return onClickSelect(item);
            }}
            disableRipple
          >
            <ListItemText primary={item.name} />
            {item.subcategories && item.subcategories.length ? (
              <ListItemIcon>
                <ArrowForwardIosIcon
                  className={`${classes.icon} ${expanded === item.key && classes.expanded}`}
                />
              </ListItemIcon>
            ) : (
              ""
            )}
          </ListItem>
        ))}
      </List>
      {itemsToSelectFrom.map(item => {
        return item.subcategories && item.subcategories.length ? (
          <ListToChooseFrom
            isSubList
            parentEl={item}
            parentList={itemsToSelectFrom}
            itemsToSelectFrom={item.subcategories}
            key={item.key + item.subcategories.length}
            expanded={expanded}
            onClickExpand={onClickExpand}
            selected={selected}
            onClickSelect={onClickSelect}
          />
        ) : null;
      })}
    </>
  );
}
