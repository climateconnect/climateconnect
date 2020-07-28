import React from "react";
import { TextField, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SelectField from "../general/SelectField";
import MultiLevelSelectDialog from "../dialogs/MultiLevelSelectDialog";

const useStyles = makeStyles(theme => {
  return {
    flexContainer: props => ({
      display: "flex",
      justifyContent: props.justifyContent,
      marginBottom: theme.spacing(1)
    }),
    verticalFlexContainer: {
      flexDirection: "column"
    },
    iconLabel: {
      display: "flex",
      alignItems: "center"
    },
    field: {
      display: "flex",
      width: 190
    },
    filterElement: props => ({
      marginRight: theme.spacing(props.filterElementMargin),
      minHeight: 40
    }),
    overlayField: {
      marginBottom: theme.spacing(2),
      width: "100%"
    },
    applyButton: {
      height: 40,
      display: "flex"
    },
    applyButtonContainer: {
      display: "flex",
      justifyContent: "flex-end"
    },
    outlinedField: {
      borderColor: theme.palette.primary.main,
      borderWidth: 2
    }
  };
});

export default function Filters({
  possibleFilters,
  handleApplyFilters,
  handleValueChange,
  withApplyButton,
  applyButtonFixedWidth,
  currentFilters,
  handleClickDialogOpen,
  open,
  handleClickDialogClose,
  isInOverlay,
  justifyContent,
  setSelectedItems,
  selectedItems
}) {
  const classes = useStyles({
    justifyContent: justifyContent ? justifyContent : "space-around",
    filterElementMargin: justifyContent && justifyContent != "space-around" ? 1 : 0
  });
  return (
    <>
      <div className={`${classes.flexContainer} ${isInOverlay && classes.verticalFlexContainer}`}>
        {possibleFilters.map(filter => {
          if (filter.type === "text") {
            return (
              <TextField
                key={filter.key}
                label={
                  <div className={classes.iconLabel}>
                    <filter.icon fontSize="inherit" />
                    {filter.title}
                  </div>
                }
                type={filter.type}
                value={currentFilters[filter.key]}
                className={`${classes.field} ${classes.filterElement} ${isInOverlay &&
                  classes.overlayField}`}
                variant="outlined"
                size="small"
                onChange={event => handleValueChange(filter.key, event.target.value)}
                InputProps={{
                  classes: {
                    notchedOutline: currentFilters[filter.key] && classes.outlinedField
                  }
                }}
              />
            );
          }
          if (filter.type === "select" || filter.type === "multiselect") {
            return (
              <SelectField
                options={filter.options}
                className={`${classes.field} ${classes.filterElement} ${isInOverlay &&
                  classes.overlayField}`}
                multiple={filter.type === "multiselect"}
                values={filter.type === "multiselect" && currentFilters[filter.key]}
                label={
                  <div className={classes.iconLabel}>
                    <filter.icon fontSize="inherit" />
                    {filter.title}
                  </div>
                }
                InputProps={{
                  classes: {
                    notchedOutline:
                      currentFilters[filter.key] &&
                      currentFilters[filter.key.length] &&
                      classes.outlinedField
                  }
                }}
                key={filter.key}
                size="small"
                isInOverlay={isInOverlay}
                defaultValues={currentFilters[filter.key]}
                onChange={event => {
                  handleValueChange(filter.key, event.target.value);
                }}
              />
            );
          }

          if (filter.type === "openMultiSelectDialogButton") {
            const curSelectedItems = selectedItems[filter.key];
            const handleSetSelectedItems = newSelectedItems => {
              setSelectedItems({ ...selectedItems, [filter.key]: newSelectedItems });
            };
            if (!filter.showIf || currentFilters[filter.showIf.key] === filter.showIf.value) {
              return (
                <div key={filter.key}>
                  <Button
                    variant="outlined"
                    className={`${classes.filterElement} ${isInOverlay && classes.overlayField}`}
                    onClick={() => handleClickDialogOpen(filter.key)}
                  >
                    {filter.title}
                  </Button>
                  <MultiLevelSelectDialog
                    open={open[filter.key] ? true : false}
                    onClose={selectedSkills => handleClickDialogClose(filter.key, selectedSkills)}
                    type={filter.itemType}
                    itemsToChooseFrom={filter.itemsToChooseFrom}
                    items={currentFilters[filter.key]}
                    selectedItems={curSelectedItems}
                    setSelectedItems={handleSetSelectedItems}
                  />
                </div>
              );
            }
          }
        })}
        {withApplyButton && (
          <div className={applyButtonFixedWidth && classes.applyButtonContainer}>
            <Button
              color="primary"
              onClick={handleApplyFilters}
              variant="contained"
              className={classes.applyButton}
            >
              Apply
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
