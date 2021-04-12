import { Button, TextField, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import MultiLevelSelectDialog from "../dialogs/MultiLevelSelectDialog";
import SelectField from "../general/SelectField";
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
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "filter_and_search", locale: locale });
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
      <div className={`${classes.flexContainer} ${isInOverlay && classes.verticalFlexContainer}`}>
        {possibleFilters.map((filter) => {
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
                value={currentFilters[filter.key]}
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
                  defaultValues={currentFilters[filter.key]}
                  onChange={(event) => {
                    handleValueChange(filter.key, event.target.value);
                  }}
                />
              </div>
            );
          }

          if (filter.type === "openMultiSelectDialogButton") {
            const curSelectedItems = selectedItems[filter.key];
            const handleSetSelectedItems = (newSelectedItems) => {
              setSelectedItems({ ...selectedItems, [filter.key]: newSelectedItems });
            };
            if (!filter.showIf || currentFilters[filter.showIf.key] === filter.showIf.value) {
              component = (
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
                    onClose={(selectedSkills) => handleClickDialogClose(filter.key, selectedSkills)}
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
                  label={texts.radius_km}
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
        {withApplyButton && (
          <div className={applyButtonFixedWidth && classes.applyButtonContainer}>
            <Button
              color="primary"
              onClick={handleApplyFilters}
              variant="contained"
              className={classes.applyButton}
            >
              {texts.apply}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
