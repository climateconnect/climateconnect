import React from "react";
import { TextField, Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import _ from "lodash";

import SelectField from "../general/SelectField";
import MultiLevelSelectDialog from "../dialogs/MultiLevelSelectDialog";
import LocationSearchBar from "../search/LocationSearchBar";

const useStyles = makeStyles((theme) => {
  return {
    flexContainer: (props) => ({
      display: "flex",
      justifyContent: props.justifyContent,
      marginBottom: theme.spacing(1),
    }),
    verticalFlexContainer: {
      flexDirection: "column",
      marginTop: theme.spacing(2),
    },
    iconLabel: {
      display: "flex",
      alignItems: "center",
    },
    field: {
      display: "flex",
      width: 190,
    },
    locationFieldWrapper: {
      width: 290,
      display: "flex",
      borderRadius: 0,
      marginRight: theme.spacing(1),
    },
    locationField: {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderRight: 0,
    },
    overlayLocationField: {
      flexGrow: 1,
    },
    radiusField: {
      width: 110,
    },
    radiusInput: {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      borderLeft: 0,
    },
    filterElement: (props) => ({
      marginRight: theme.spacing(props.filterElementMargin),
      minHeight: 40,
    }),
    overlayField: {
      marginBottom: theme.spacing(2),
      width: "100%",
    },
    applyButton: {
      height: 40,
      display: "flex",
    },
    applyButtonContainer: {
      display: "flex",
      justifyContent: "flex-end",
    },
    outlinedField: {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
    errorMessageWrapper: {
      textAlign: "center",
      marginBottom: theme.spacing(1),
    },
  };
});

export default function Filters({
  currentFilters,
  errorMessage,
  handleApplyFilters,
  handleClickDialogClose,
  handleClickDialogOpen,
  handleSetLocationOptionsOpen,
  handleValueChange,
  isInOverlay,
  justifyContent,
  locationInputRef,
  locationOptionsOpen,
  open,
  possibleFilters,
  selectedItems,
  setSelectedItems,
}) {
  const classes = useStyles({
    justifyContent: justifyContent ? justifyContent : "space-around",
    filterElementMargin: justifyContent && justifyContent != "space-around" ? 1 : 0,
  });

  return (
    <>
      {errorMessage && (
        <div className={classes.errorMessageWrapper}>
          <Typography color="error">{errorMessage}</Typography>
        </div>
      )}

      {/* TODO(piper): add this functionality to all elements where we apply new filters */}
      <div className={`${classes.flexContainer} ${isInOverlay && classes.verticalFlexContainer}`}>
        {possibleFilters.map((filter) => {
          // Get the current values for each potential filter
          // from what could already be previously selected
          const currentFilterValue = currentFilters[filter.key];

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
                value={currentFilterValue}
                className={`${classes.field} ${classes.filterElement} ${
                  isInOverlay && classes.overlayField
                }`}
                variant="outlined"
                size="small"
                onChange={(event) => handleValueChange(filter.key, event.target.value)}
                InputProps={{
                  classes: {
                    notchedOutline: currentFilters[filter.key] && classes.outlinedField,
                  },
                }}
              />
            );
          }

          // Select and multiselect
          if (filter.type === "select" || filter.type === "multiselect") {
            return (
              <SelectField
                options={filter.options}
                className={`${classes.field} ${classes.filterElement} ${
                  isInOverlay && classes.overlayField
                }`}
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
                      classes.outlinedField,
                  },
                }}
                key={filter.key}
                size="small"
                isInOverlay={isInOverlay}
                // TODO(piper): check on this
                // defaultValue={currentFilters}
                defaultValues={currentFilters[filter.key]}
                onChange={(event) => {
                  handleValueChange(filter.key, event.target.value);
                }}
              />
            );
          }

          if (filter.type === "openMultiSelectDialogButton") {
            //  TODO(piper): could potentially
            // pre-select / force selection at this point?
            const curSelectedItems = selectedItems[filter.key];

            // Only perform one React state change if there's an initial
            // set of selected categories

            // http://localhost:3000/browse?&status=In%20Progress&category=Lowering%20food%20waste&

            /**
             * Update the selected items object with new entries. New selected items is
             * an array of objects.
             */
            const handleSetSelectedItems = (newSelectedItems) => {
              // debugger;
              // console.log("Handling selected items...");
              // console.log(newSelectedItems);

              // filter.key should be categories?

              // TODO(PipeR): need to fix the dismissal of the list item here.
              // for (const [key, value] of Object.entries(currentFilters[filter.key])) {
              //   // So if we're in categories
              //   if (key === filter.key) {
              //     // upodate with the selected items...?
              //     // TODO(piper) might need to come back to this feature...
              //     // newSelectedItems.forEach(item => {
              //     //   // value being the array of categories?
              //     //   value.forEach(category => {
              //     //     if (item === category) {
              //     //       currentFilters
              //     //     }
              //     //   })
              //     // })
              //   }
              // }

              // TODO(piper); new...
              // Update the filter array (categoreis) when selected,
              // to persist the query param in the URL
              // handleApplyFilters(filter.key);
              // handleSelectedListItemToFilters(newSelectedItems);

              // Value is an array of selected items
              // TODO(piper): an array of strings, or array of arrays for values?
              // And update the visaul selected items
              setSelectedItems({
                ...selectedItems,
                [filter.key]: newSelectedItems,
              });
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
                    items={currentFilters[filter.key]}
                    itemsToChooseFrom={filter.itemsToChooseFrom}
                    onClose={(selectedSkills) => handleClickDialogClose(filter.key, selectedSkills)}
                    // TODO(Piper): passing this through the selected item
                    onDismissOfItem={handleApplyFilters}
                    open={open[filter.key] ? true : false}
                    selectedItems={curSelectedItems}
                    setSelectedItems={handleSetSelectedItems}
                    type={filter.itemType}
                  />
                </div>
              );
            }
          }

          if (filter.type === "location") {
            const handleLocationSelect = (location) => {
              handleValueChange(filter.key, location);
            };
            return (
              <div
                className={`${classes.locationFieldWrapper} ${isInOverlay && classes.overlayField}`}
                key={filter.key}
              >
                <LocationSearchBar
                  smallInput
                  onSelect={handleLocationSelect}
                  inputClassName={!isInOverlay ? classes.field : classes.overlayLocationField}
                  value={currentFilters[filter.key]}
                  textFieldClassName={classes.locationField}
                  onChange={(value) => handleValueChange(filter.key, value)}
                  locationInputRef={locationInputRef}
                  open={locationOptionsOpen}
                  handleSetOpen={handleSetLocationOptionsOpen}
                  label={
                    <div className={classes.iconLabel}>
                      <filter.icon fontSize="inherit" />
                      {filter.title}
                    </div>
                  }
                />
                <TextField
                  key={filter.key}
                  className={classes.radiusField}
                  label="Radius(km)"
                  type={filter.type}
                  value={currentFilters.radius}
                  variant="outlined"
                  size="small"
                  onChange={(event) => handleValueChange("radius", event.target.value)}
                  InputProps={{
                    classes: {
                      root: classes.radiusInput,
                    },
                  }}
                />
              </div>
            );
          }
        })}
      </div>
    </>
  );
}
