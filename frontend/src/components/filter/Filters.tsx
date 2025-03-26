import { Button, TextField, Theme, Tooltip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getRadiusFilterOptions from "../../../public/data/radiusFilterOptions";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import MultiLevelSelectDialog from "../dialogs/MultiLevelSelectDialog";
import SelectField from "../general/SelectField";
import LocationSearchBar from "../search/LocationSearchBar";
import { FilterContext } from "../context/FilterContext";

const useStyles = makeStyles<Theme, { filterElementMargin: number; justifyContent: any }>(
  (theme) => {
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
      openMultiSelectButton: {
        border: `1px solid ${theme.palette.grey[500]} !important`,
      },
    };
  }
);

export default function Filters({
  handleClickDialogClose,
  handleClickDialogOpen,
  handleClickDialogSave,
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
}: any) {
  const { locale } = useContext(UserContext);
  const { filters: currentFilters, errorMessage } = useContext(FilterContext);

  const texts = getTexts({ page: "filter_and_search", locale: locale });
  const classes = useStyles({
    justifyContent: justifyContent ? justifyContent : "space-around",
    filterElementMargin: justifyContent && justifyContent != "space-around" ? 1 : 0,
  });
  const radiusFilterOptions = getRadiusFilterOptions();
  return (
    <>
      {errorMessage && (
        <div className={classes.errorMessageWrapper}>
          <Typography color="error">{errorMessage}</Typography>
        </div>
      )}

      <div className={`${classes.flexContainer} ${isInOverlay && classes.verticalFlexContainer}`}>
        {/* Map over the potential filters for each specific tab. For example, on the Members tab,
         the possible filters might be the location filter object, and the skills filter object. */}
        {possibleFilters.map((filter) => {
          // Get the current values for each potential filter
          // from what could already be previously selected
          const currentFilterValue = currentFilters[filter.key];

          let component;
          if (filter.type === "text") {
            component = (
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
            component = (
              <div>
                <SelectField
                  options={filter.options}
                  className={`${classes.field} ${classes.filterElement} ${
                    isInOverlay && classes.overlayField
                  }`}
                  multiple={filter.type === "multiselect"}
                  values={filter.type === "multiselect" && currentFilters[filter.key]}
                  controlled={filter.type === "select"}
                  controlledValue={filter.type === "select" && currentFilters[filter.key]}
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
                  //TODO(unused) defaultValues={currentFilters[filter.key]}
                  onChange={(event) => {
                    handleValueChange(filter.key, event.target.value);
                  }}
                />
              </div>
            );
          }

          if (filter.type === "openMultiSelectDialogButton") {
            // Only perform one React state change if there's an initial
            // set of selected categories
            const curSelectedItems = selectedItems[filter.key];

            /**
             * Update the selected items object with new entries. New selected items is
             * an array of objects.
             */
            const handleSetSelectedItems = (newSelectedItems) => {
              setSelectedItems({
                ...selectedItems,
                [filter.key]: newSelectedItems,
              });
            };

            // TODO: what is the showIf property used for?
            if (!filter.showIf || currentFilters[filter.showIf.key] === filter.showIf.value) {
              component = (
                <div key={filter.key}>
                  <Button
                    variant="outlined"
                    color="grey"
                    className={`${classes.openMultiSelectButton} ${classes.filterElement} ${
                      isInOverlay && classes.overlayField
                    }`}
                    onClick={() => handleClickDialogOpen(filter.key)}
                  >
                    {filter.title}
                  </Button>
                  {/* For example, this could be the Skills dialog */}
                  <MultiLevelSelectDialog
                    options={filter.options}
                    onClose={() => handleClickDialogClose(filter.key)}
                    onSave={(selectedSkills) => handleClickDialogSave(filter.key, selectedSkills)}
                    open={open[filter.key] ? true : false}
                    selectedItems={curSelectedItems}
                    setSelectedItems={handleSetSelectedItems}
                    type={filter.itemType}
                    title={texts["add_" + filter.itemType.replace(" ", "_")]}
                  />
                </div>
              );
            }
          }

          if (filter.type === "location") {
            const handleLocationSelect = (location) => {
              handleValueChange(filter.key, location);
            };
            component = (
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
                  filterMode
                  label={
                    <div className={classes.iconLabel}>
                      <filter.icon fontSize="inherit" />
                      {filter.title}
                    </div>
                  }
                />
                <SelectField
                  key={filter.key}
                  className={classes.radiusField}
                  label={texts.radius_km}
                  options={radiusFilterOptions}
                  /*TODO(unused) type={filter.type} */
                  controlled
                  controlledValue={{ name: currentFilters.radius }}
                  /*TODO(unused) variant="outlined" */
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

          if (filter.tooltipText) {
            return (
              <Tooltip arrow placement="top" title={filter.tooltipText} key={filter.key + "."}>
                {component}
              </Tooltip>
            );
          } else {
            return component;
          }
        })}
      </div>
    </>
  );
}
