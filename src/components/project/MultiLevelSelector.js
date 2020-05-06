import React from "react";
import { List, ListItem, ListItemText, ListItemIcon, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";

const useStyles = makeStyles(theme => {
  return {
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
    }
  };
});

export default function MultiLevelSelector({ itemsToSelectFrom }) {
  const [selected, setSelected] = React.useState([]);
  const [expanded, setExpanded] = React.useState("agriculture");

  const onClickExpand = key => {
    if (expanded === key) setExpanded(null);
    else setExpanded(key);
  };

  const onClickSelect = item => {
    console.log(item);
    setSelected([...selected, item]);
  };

  return (
    <>
      <div>
        <ListToChooseFrom
          itemsToSelectFrom={itemsToSelectFrom}
          onClickExpand={onClickExpand}
          expanded={expanded}
          onClickSelect={onClickSelect}
          selected={selected}
        />
      </div>
      <div>
        <Typography>Selected Items</Typography>
        <List>
          {selected.map(item => (
            <ListItem key={item.key}>
              <ListItemText>{item.name}</ListItemText>
            </ListItem>
          ))}
        </List>
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
            disabled={selected.includes(item.key)}
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
