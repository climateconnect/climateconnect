import {
  Container,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Theme,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { Fragment, useContext, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import FilterSearchBar from "../filter/FilterSearchBar";

const useStyles = makeStyles<
  Theme,
  { flexWrapper?: boolean; marginTop?: boolean; offset?: number }
>((theme) => {
  return {
    wrapper: (props) => ({
      margin: "0 auto",
      display: props.flexWrapper ? "flex" : "block",
      marginTop: props.marginTop ? theme.spacing(8) : 0,
      [theme.breakpoints.down("md")]: {
        marginTop: theme.spacing(4),
        display: "block",
      },
    }),
    list: {
      display: "inline-block",
      [theme.breakpoints.down("lg")]: {
        marginLeft: theme.spacing(0),
      },
    },
    subList: (props) => {
      return {
        display: "inline-block",
        marginTop: theme.spacing(props.offset! * 8),
        verticalAlign: "top",
        maxWidth: "50%",
      };
    },
    narrowScreenSubList: {
      display: "block",
      padding: 0,
      width: "90%",
      marginLeft: "10%",
    },

    listItem: {
      border: "1px solid black",
      borderTop: 0,
      height: theme.spacing(8),
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(1),
    },

    subListItem: {
      borderLeft: 0,
    },

    firstItem: {
      borderTop: "1px solid black",
    },

    narrowScreenSubListItem: {
      borderLeft: "1px solid black",
      borderTop: 0,
    },

    borderLeft: {
      borderLeft: "1px solid black",
    },

    icon: {
      margin: "0 auto",
    },
    expanded: {
      color: theme.palette.secondary.main,
    },
    hidden: {
      display: "none",
    },
    selectedWrapper: {
      display: "inline-block",
      verticalAlign: "top",
      marginLeft: theme.spacing(16),
      [theme.breakpoints.down("lg")]: {
        marginLeft: theme.spacing(2),
      },
    },
    narrowScreenSelectedWrapper: {
      marginLeft: theme.spacing(2),
      display: "block",
      margin: "0 auto",
      textAlign: "center",
    },
    selectedItemsHeader: {
      fontWeight: "bold",
      fontSize: "16px",
      color: theme.palette.background.default_contrastText,
    },
    selectedItem: {
      background: theme.palette.background.default_contrastText,
      color: "white",
      marginBottom: theme.spacing(1),
      borderTop: "1px solid black",
      "&:hover": {
        backgroundColor: theme.palette.background.default_contrastText,
        color: "white",
      },
    },
    firstSelectedItem: {
      border: "5px solid black",
    },
    selectedItemIcon: {
      paddingLeft: theme.spacing(2),
      color: "white",
    },
    listWrapper: {
      display: "inline-block",
      width: 700,
      [theme.breakpoints.down("lg")]: {
        width: `650 - ${theme.spacing(8)}`,
        margin: "0 auto",
      },
      [theme.breakpoints.down("sm")]: {
        width: "auto",
        margin: "0 auto",
      },
    },
    narrowScreenListWrapper: {
      maxWidth: `650 - ${theme.spacing(8)}`,
      width: "auto",
      display: "block",
      margin: "0 auto",
    },
    selectedList: {
      maxWidth: 350,
      margin: "0 auto",
    },
    divider: {
      borderColor: "black",
      marginBottom: theme.spacing(1),
    },
    subListLastItem: {
      borderBottom: 0,
    },
    // Ensure there's border on the last sublist item,
    // on the last parent list item. See GitHub issue #312
    finalListItem: {
      borderBottom: "1px solid black",
    },
    itemUnderExpandedSubList: {
      borderTop: "1px solid black",
    },
    searchBar: {
      display: "block",
      width: "100%",
    },
  };
});

export default function MultiLevelSelector({
  dragAble,
  isInPopup,
  itemNamePlural,
  itemsToSelectFrom,
  maxSelections,
  selected,
  setSelected,
}: any) {
  const [expanded, setExpanded] = useState(null);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "filter_and_search", locale: locale });
  const useStylesProps = {
    marginTop: !isInPopup,
    flexWrapper: !isInPopup,
  };

  const classes = useStyles(useStylesProps);

  const onClickExpand = (key) => {
    if (expanded === key) setExpanded(null);
    else setExpanded(key);
  };

  const onClickSelect = (item) => {
    if (selected.length >= maxSelections) {
      alert(texts.point_out_max_selections + " " + maxSelections + " " + itemNamePlural);
    } else {
      setSelected([...selected, item]);
    }
  };

  const onClickUnselect = (item) => {
    // When dismissing a selected filter chip, we also want to update the
    // window state to reflect the currently active filters, and fetch
    // the updated data from the server.
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

  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
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
              className={`${classes.selectedWrapper} ${
                (isNarrowScreen || isInPopup) && classes.narrowScreenSelectedWrapper
              }`}
              dragAble={dragAble}
              moveItem={moveItem}
              texts={texts}
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
          //TODO(unused) className={classes.listWrapper}
          texts={texts}
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
            texts={texts}
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
  isInPopup,
  isNarrowScreen,
  texts,
}) {
  const classes = useStyles({});

  // The first section should be the initial tab value
  const [searchValue, setSearchValue] = useState("");
  const handleSearchBarChange = (event) => setSearchValue(event?.target?.value);

  function filteredLists({ searchValue, itemsToSelectFrom }) {
    if (searchValue == "" || searchValue == null) {
      return itemsToSelectFrom;
    }
    return (
      itemsToSelectFrom
        // remove all inner items that do not match the search query
        .map((item) => {
          const itemCopy = Object.assign({}, item);
          itemCopy.subcategories = item.subcategories.filter((innerItem) => {
            return innerItem.name.toLowerCase().includes(searchValue.toLowerCase());
          });
          return itemCopy;
        })
        // remove all items who do not match the search, or have no inner matches
        .filter((item) => {
          return (
            item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.subcategories.length > 0
          );
        })
    );
  }

  return (
    <Container>
      <div /*TODO(undefined) className={classes.searchBarContainer} */>
        <FilterSearchBar
          label={texts.search_for_keywords}
          className={classes.searchBar}
          onChange={handleSearchBarChange}
          value={searchValue}
        />
        <ListToChooseFrom
          itemsToSelectFrom={filteredLists({ searchValue, itemsToSelectFrom })}
          onClickExpand={onClickExpand}
          expanded={expanded}
          onClickSelect={onClickSelect}
          selected={selected}
          className={`${(isNarrowScreen || isInPopup) && classes.narrowScreenListWrapper}`}
          isInPopup={isInPopup}
          isNarrowScreen={isNarrowScreen}
        />
      </div>
    </Container>
  );
}

function SelectedList({
  className,
  dragAble,
  itemNamePlural,
  maxSelections,
  moveItem,
  onClickUnselect,
  selected,
  texts,
}) {
  const classes = useStyles({});

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) return;

    moveItem(result.source.index, result.destination.index);
  };
  const DragDropContextComponent = DragDropContext as any;
  const DroppableComponent = Droppable as any;
  const DraggableComponent = Draggable as any;

  if (dragAble) {
    return (
      <DragDropContextComponent onDragEnd={onDragEnd}>
        <DroppableComponent droppableId="droppable">
          {(provided) => (
            <List
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={classes.selectedList}
            >
              {selected?.map((item, index) => {
                return (
                  <DraggableComponent
                    key={item.id}
                    draggableId={"draggable" + item.id}
                    index={index}
                  >
                    {(provided) => {
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
                  </DraggableComponent>
                );
              })}
              {provided.placeholder}
            </List>
          )}
        </DroppableComponent>
      </DragDropContextComponent>
    );
  }

  return (
    <div className={className}>
      {selected && Array.isArray(selected) && (
        <Typography component="h2" variant="h5" className={classes.selectedItemsHeader}>
          {selected.length > 0
            ? texts.selected + " " + itemNamePlural
            : texts.choose_between_on_and + maxSelections + " " + itemNamePlural + "!"}
        </Typography>
      )}
      {/* Shows the list of selected items. For example on /browse when you select "Categories" */}
      <List className={classes.selectedList}>
        {selected &&
          Array.isArray(selected) &&
          selected?.map((item, index) => (
            // Only show the item if it's valid
            <ListItem
              key={index}
              button
              className={`${classes.listItem} ${index == 0 && classes.firstItem} ${
                classes.selectedItem
              }`}
              onClick={() => onClickUnselect(item)}
              disableRipple
            >
              {/* If the .name property is undefined, render the item text directly */}
              <ListItemText>{item.name || item}</ListItemText>
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
  expanded,
  isInPopup,
  isNarrowScreen,
  isSubList,
  itemsToSelectFrom,
  onClickExpand,
  onClickSelect,
  parentEl,
  parentList,
  selected,
}: any) {
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
                    ${
                      isSubList &&
                      (expanded === parentEl.key
                        ? isNarrowScreen || isInPopup
                          ? classes.narrowScreenSubList
                          : classes.subList
                        : classes.hidden)
                    }
                    ${className}`}
      >
        {/* Map over all potential items; for example this could be the list
        of skills in the skills dialog */}
        {itemsToSelectFrom.map((item, index) => {
          // If current last item, is the last subcategory item
          // in the last item in the outer list, then ignore our
          // normal border styling, and paint the 1px bottom border.
          let isFinalListItem = false;
          if (index === itemsToSelectFrom.length - 1) {
            const lastParentListItem = parentList && parentList[parentList.length - 1];
            const lastParentListItemSubcategories = lastParentListItem?.subcategories;
            const finalItem =
              lastParentListItemSubcategories &&
              lastParentListItemSubcategories[lastParentListItemSubcategories.length - 1];

            // Does the current item match its parent's last item?
            if (item.name === finalItem?.name) {
              isFinalListItem = true;
            }
          }

          // We need to keep the key property in tact with the list
          // item properties. OR we just check to see if the "name"s
          // match, in which case they should already be selected.

          // convert selected to an Array if not
          selected = Array.isArray(selected) ? selected : [selected];

          const isDisabled =
            selected.filter(
              // If the item is a raw string, we also accept that if it matches
              // the name of the selected item. For example, the array could be
              // ["Crafts"].
              (selectedItem) => selectedItem.name === item.name || selectedItem === item.name
            ).length === 1;

          return (
            <Fragment key={item.key}>
              <ListItem
                button
                disabled={isDisabled}
                classes={{
                  root: `${classes.listItem}
                        ${index == 0 && classes.firstItem}
                        ${isSubList && classes.subListItem}
                        ${
                          isSubList &&
                          (isNarrowScreen || isInPopup) &&
                          classes.narrowScreenSubListItem
                        }

                        ${
                          isSubList &&
                          index === itemsToSelectFrom.length - 1 &&
                          (isNarrowScreen || isInPopup) &&
                          // If the list item is the absolute last
                          // item in a nested list, then still paint
                          // its bottom border.
                          (isFinalListItem ? classes.finalListItem : classes.subListLastItem)
                        }

                        ${
                          !isSubList &&
                          itemsToSelectFrom[index - 1] &&
                          expanded === itemsToSelectFrom[index - 1].key &&
                          (isNarrowScreen || isInPopup) &&
                          classes.itemUnderExpandedSubList
                        }
                        ${isSubList && index >= parentList.length && classes.borderLeft}`,
                  selected: classes.expanded,
                }}
                selected={expanded === item.key}
                onClick={() => {
                  if (item.subcategories && item.subcategories.length) {
                    return onClickExpand(item.key);
                  }

                  return onClickSelect(item);
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
              {/* Render the inner list items, if an outer list item has subcategories associated */}
              {(isNarrowScreen || isInPopup) && item.subcategories && item.subcategories.length ? (
                <ListToChooseFrom
                  expanded={expanded}
                  isInPopup={isInPopup}
                  isNarrowScreen={isNarrowScreen}
                  isSubList
                  itemsToSelectFrom={item.subcategories}
                  key={item.key + "innersublist"}
                  onClickExpand={onClickExpand}
                  onClickSelect={onClickSelect}
                  parentEl={item}
                  parentList={itemsToSelectFrom}
                  selected={selected}
                />
              ) : (
                <></>
              )}
            </Fragment>
          );
        })}
      </List>
      {/* Render the inner list items differently if not a narrow screen, or in a popup */}
      {!(isNarrowScreen || isInPopup) &&
        itemsToSelectFrom.map((item) => {
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
