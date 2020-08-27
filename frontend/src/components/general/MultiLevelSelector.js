import React from "react";
import { List, ListItem, ListItemText, ListItemIcon, Typography, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const useStyles = makeStyles(theme => {
  return {
    wrapper: props => ({
      margin: "0 auto",
      display: props.flexWrapper ? "flex" : "block",
      marginTop: props.marginTop ? theme.spacing(8) : 0,
      [theme.breakpoints.down("sm")]: {
        marginTop: theme.spacing(4),
        display: "block"
      }
    }),
    list: {
      display: "inline-block",
      maxWidth: "50%",
      [theme.breakpoints.down("md")]: {
        marginLeft: theme.spacing(0)
      }
    },
    subList: props => {
      return {
        display: "inline-block",
        marginTop: theme.spacing(props.offset * 8),
        verticalAlign: "top",
        maxWidth: "50%"
      };
    },
    narrowScreenSubList: {
      display: "block",
      padding: 0,
      width: "90%",
      marginLeft: "10%"
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
    narrowScreenSubListItem: {
      borderLeft: "1px solid black",
      borderTop: 0
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
      marginLeft: theme.spacing(16),
      [theme.breakpoints.down("md")]: {
        marginLeft: theme.spacing(2)
      }
    },
    narrowScreenSelectedWrapper: {
      marginLeft: theme.spacing(2),
      display: "block",
      margin: "0 auto",
      textAlign: "center"
    },
    selectedItemsHeader: {
      fontWeight: "bold"
    },
    selectedItem: {
      background: theme.palette.primary.main,
      color: "white",
      marginBottom: theme.spacing(1),
      borderTop: "1px solid black",
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
        color: "white"
      }
    },
    firstSelectedItem: {
      border: "5px solid black"
    },
    selectedItemIcon: {
      paddingLeft: theme.spacing(2),
      color: "red"
    },
    listWrapper: {
      display: "inline-block",
      width: 700,
      [theme.breakpoints.down("md")]: {
        width: 650 - theme.spacing(8),
        margin: "0 auto"
      },
      [theme.breakpoints.down("xs")]: {
        width: "auto",
        margin: "0 auto"
      }
    },
    narrowScreenListWrapper: {
      maxWidth: 650 - theme.spacing(8),
      width: "auto",
      display: "block",
      margin: "0 auto"
    },
    selectedList: {
      maxWidth: 350,
      margin: "0 auto"
    },
    divider: {
      backgroundColor: "black",
      marginBottom: theme.spacing(1)
    },
    subListLastItem: {
      borderBottom: 0
    },
    itemUnderExpandedSubList: {
      borderTop: "1px solid black"
    }
  };
});

export default function MultiLevelSelector({
  selected,
  setSelected,
  itemsToSelectFrom,
  maxSelections,
  itemNamePlural,
  isInPopup,
  dragAble
}) {
  const [expanded, setExpanded] = React.useState(null);

  const useStylesProps = {
    marginTop: !isInPopup,
    flexWrapper: !isInPopup
  };

  const classes = useStyles(useStylesProps);

  const onClickExpand = key => {
    if (expanded === key) setExpanded(null);
    else setExpanded(key);
  };

  const onClickSelect = item => {
    if (selected.length >= maxSelections)
      alert("You can only choose up to " + maxSelections + " " + itemNamePlural);
    else setSelected([...selected, item]);
  };

  const onClickUnselect = item => {
    setSelected(
      selected
        .slice(0, selected.indexOf(item))
        .concat(selected.slice(selected.indexOf(item) + 1, selected.length))
    );
  };

  const moveItem = (sourcePosition, destinationPosition) => {
    const ret = selected;
    const [removed] = ret.splice(sourcePosition, 1);
    ret.splice(destinationPosition, 0, removed);
    setSelected(ret);
  };

  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));
  return (
    <>
      <div className={classes.wrapper}>
        {(isNarrowScreen || isInPopup) && (
          <>
            <SelectedList
              selected={selected}
              itemNamePlural={itemNamePlural}
              maxSelections={maxSelections}
              onClickUnselect={onClickUnselect}
              className={`${classes.selectedWrapper} ${(isNarrowScreen || isInPopup) &&
                classes.narrowScreenSelectedWrapper}`}
              dragAble={dragAble}
              moveItem={moveItem}
            />
            {selected.length > 0 && <Divider className={classes.divider} />}
          </>
        )}
        <ListToChooseWrapper
          itemsToSelectFrom={itemsToSelectFrom}
          onClickExpand={onClickExpand}
          expanded={expanded}
          onClickSelect={onClickSelect}
          selected={selected}
          isNarrowScreen={isNarrowScreen}
          isInPopup={isInPopup}
          className={classes.listWrapper}
        />
        {!(isNarrowScreen || isInPopup) && (
          <SelectedList
            selected={selected}
            itemNamePlural={itemNamePlural}
            maxSelections={maxSelections}
            onClickUnselect={onClickUnselect}
            className={classes.selectedWrapper}
            dragAble={dragAble}
            moveItem={moveItem}
          />
        )}
      </div>
    </>
  );
}

function ListToChooseWrapper({
  itemsToSelectFrom,
  onClickExpand,
  expanded,
  onClickSelect,
  selected,
  className,
  isInPopup,
  isNarrowScreen
}) {
  const classes = useStyles();
  return (
    <div className={className}>
      <ListToChooseFrom
        itemsToSelectFrom={itemsToSelectFrom}
        onClickExpand={onClickExpand}
        expanded={expanded}
        onClickSelect={onClickSelect}
        selected={selected}
        className={`${(isNarrowScreen || isInPopup) && classes.narrowScreenListWrapper}`}
        isInPopup={isInPopup}
        isNarrowScreen={isNarrowScreen}
      />
    </div>
  );
}

function SelectedList({
  selected,
  itemNamePlural,
  maxSelections,
  className,
  onClickUnselect,
  dragAble,
  moveItem
}) {
  const classes = useStyles({});

  const onDragEnd = result => {
    // dropped outside the list
    if (!result.destination) return;

    moveItem(result.source.index, result.destination.index);
  };

  if (dragAble)
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {provided => (
            <List
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={classes.selectedList}
            >
              {selected.map((item, index) => {
                return (
                  <Draggable key={item.id} draggableId={"draggable" + item.id} index={index}>
                    {provided => {
                      return (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          key={index}
                          button
                          className={`
                            ${classes.listItem} 
                            ${index == 0 && classes.firstItem} 
                            ${classes.selectedItem}
                            ${index == 0 && classes.firstSelectedItem}
                          `}
                          onClick={() => onClickUnselect(item)}
                          disableRipple
                        >
                          <ListItemText>{item.name}</ListItemText>
                          <ListItemIcon className={classes.selectedItemIcon}>
                            <CloseIcon />
                          </ListItemIcon>
                        </ListItem>
                      );
                    }}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
    );
  else
    return (
      <div className={className}>
        <Typography component="h2" variant="h5" className={classes.selectedItemsHeader}>
          {selected.length > 0
            ? "Selected " + itemNamePlural
            : "Select between 1 and " + maxSelections + " " + itemNamePlural + "!"}
        </Typography>
        <List className={classes.selectedList}>
          {selected.map((item, index) => (
            <ListItem
              key={index}
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
  selected,
  isNarrowScreen,
  isInPopup
}) {
  const index = isSubList ? parentList.indexOf(parentEl) : 0;
  const subListHeightCorrection = isSubList
    ? Math.min(index, Math.max(0, itemsToSelectFrom.length - parentList.length + index))
    : 0;
  const offset = isNarrowScreen || isInPopup ? 0 : index - subListHeightCorrection;
  const classes = useStyles({ offset: offset });
  return (
    <>
      <List
        className={`${!isSubList && classes.list} 
                    ${isSubList &&
                      (expanded === parentEl.key
                        ? isNarrowScreen || isInPopup
                          ? classes.narrowScreenSubList
                          : classes.subList
                        : classes.hidden)} 
                    ${className}`}
      >
        {itemsToSelectFrom.map((item, index) => (
          <React.Fragment key={item.key}>
            <ListItem
              button
              disabled={selected.filter(s => s.key === item.key).length === 1}
              classes={{
                root: `${classes.listItem} 
                        ${index == 0 && classes.firstItem} 
                        ${isSubList && classes.subListItem} 
                        ${isSubList &&
                          (isNarrowScreen || isInPopup) &&
                          classes.narrowScreenSubListItem}
                        ${isSubList &&
                          index === itemsToSelectFrom.length - 1 &&
                          (isNarrowScreen || isInPopup) &&
                          classes.subListLastItem}
                        ${!isSubList &&
                          itemsToSelectFrom[index - 1] &&
                          expanded === itemsToSelectFrom[index - 1].key &&
                          (isNarrowScreen || isInPopup) &&
                          classes.itemUnderExpandedSubList}
                        ${isSubList && index >= parentList.length && classes.borderLeft}`,
                selected: classes.expanded
              }}
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
                  {isNarrowScreen || isInPopup ? (
                    expanded === item.key ? (
                      <ExpandLessIcon
                        className={`${classes.icon} ${expanded === item.key && classes.expanded}`}
                      />
                    ) : (
                      <ExpandMoreIcon
                        className={`${classes.icon} ${expanded === item.key && classes.expanded}`}
                      />
                    )
                  ) : (
                    <ArrowForwardIosIcon
                      className={`${classes.icon} ${expanded === item.key && classes.expanded}`}
                    />
                  )}
                </ListItemIcon>
              ) : (
                ""
              )}
            </ListItem>
            {(isNarrowScreen || isInPopup) && item.subcategories && item.subcategories.length ? (
              <ListToChooseFrom
                isSubList
                parentEl={item}
                parentList={itemsToSelectFrom}
                itemsToSelectFrom={item.subcategories}
                key={item.key + "innersublist"}
                expanded={expanded}
                onClickExpand={onClickExpand}
                selected={selected}
                onClickSelect={onClickSelect}
                isNarrowScreen={isNarrowScreen}
                isInPopup={isInPopup}
              />
            ) : (
              <></>
            )}
          </React.Fragment>
        ))}
      </List>
      {!(isNarrowScreen || isInPopup) &&
        itemsToSelectFrom.map(item => {
          return item.subcategories && item.subcategories.length ? (
            <ListToChooseFrom
              isSubList
              parentEl={item}
              parentList={itemsToSelectFrom}
              itemsToSelectFrom={item.subcategories}
              key={item.key + "outersublist"}
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
