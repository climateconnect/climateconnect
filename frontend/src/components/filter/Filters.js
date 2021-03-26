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
  selectedItems,
  locationInputRef,
  locationOptionsOpen,
  handleSetLocationOptionsOpen,
  errorMessage,
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
            // TODO(Piper): delineate between current filters, and what toi pass
            // to the copmonents

            // TODO: how do we mark the options as selected from query param
            // TODO: fix the bug where the checkbox isn't being checked
            console.log("Current filter value within select or multiselect from: ");
            console.log(currentFilterValue);
            // console.log(`${currentFilters}`);
            // console.log(currentFilters[filter.key]);
            // debugger;
            return (
              <SelectField
                options={filter.options}
                className={`${classes.field} ${classes.filterElement} ${
                  isInOverlay && classes.overlayField
                }`}
                multiple={filter.type === "multiselect"}
                // TODO(Piper): fix this values array
                // Error: Material-UI: The `value` prop must be an array when using the `Select` component with `multiple`.
                // Right now... it's currentFilters[filter.key] ==> { } -> "in progress"
                // Which makes me think that currentFilters is getting updated when it shouldn't be
                // This is original
                values={filter.type === "multiselect" && currentFilters[filter.key]}
                // values={filter.type === "multiselect" && [currentFilterValue]}
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
                // defaultValue={currentFilters}
                // TODO(piper): check on this
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

            // TODO(piper): why is filter.key collaboration?

            // useEffect(() => {});

            // TODO: fix inifinite loop
            // Insert if not there

            // debugger;

            let alreadySelected = false;
            for (const [key, value] of Object.entries(currentFilters)) {
              if (key === filter.key && currentFilterValue && !alreadySelected) {
                // category matches query param, then update

                // TODO(Piper): if one of the "currently selected filter values"
                // matches one of the itemsToChooseFrom in the multiselect range, e.g. the
                // query param &category="Lowering food waste" -- category matches
                // "categories"... then we immediately insert that object
                // into the currently selected items to update the state.
                // debugger;

                // TODO: how do we know id, parent_tag, and ???
                // Do we have to get those from the mutiselect?!
                const newlySelectedItems = {
                  id: 2,
                  name: currentFilterValue, // Lowering food waste
                  parent_tag: 1,
                  key: 2,
                };

                // TODO: make this a set
                // Get unique list of selected items to pass downwards to MultiLevel
                const listOfItems = new Set(selectedItems[filter.key].map((item) => item.name));
                console.log(listOfItems);

                if (!listOfItems.has(currentFilterValue)) {
                  selectedItems[filter.key].push(newlySelectedItems);
                  // unique
                  _.uniq(selectedItems[filter.key]);
                }

                // if (!_.includes(selectedItems[filter.key], newlySelectedItems)) {
                //   selectedItems[filter.key].push(newlySelectedItems);
                // }

                // Insert into new items if it's not already there.

                console.log(selectedItems);

                // setSelectedItems({
                //   ...selectedItems,
                //   [filter.key]: newlySelectedItems,
                // });

                alreadySelected = true;
              }
            }

            // http://localhost:3000/browse?&status=In%20Progress&category=Lowering%20food%20waste&

            // console.log(selectedItems);
            // console.log(filter.key);
            // console.log(currentFilters);

            // console.log("Multi cur selected:");
            // console.log(currentFilterValue);

            // debugger;

            // TODO(Piper): I think this is where item selection is occurring
            /**
             * Update the selected items object with new entries. New selected items is
             * an array of objects.
             */
            const handleSetSelectedItems = (newSelectedItems) => {
              debugger;
              // console.log("Handling selected items...");
              // console.log(newSelectedItems);

              // TODO: need to persist query param url

              // filter.key should be categories?

              // TODO(PipeR): need to fix the dismissal of the list item here.
              for (const [key, value] of Object.entries(currentFilters[filter.key])) {
                // So if we're in categories
                if (key === filter.key) {
                  // upodate with the selected items...?
                  // TODO(piper) might need to come back to this feature...
                  // newSelectedItems.forEach(item => {
                  //   // value being the array of categories?
                  //   value.forEach(category => {
                  //     if (item === category) {
                  //       currentFilters
                  //     }
                  //   })
                  // })
                }
              }

              // Update the filter array (categoreis)

              handleApplyFilters(filter.key);

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

        {/* TODO(piper): remove apply button */}
        {/* {withApplyButton && (
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
        )} */}
      </div>
    </>
  );
}
