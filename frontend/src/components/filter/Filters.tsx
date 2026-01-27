import { Button, TextField, Theme, Tooltip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getRadiusFilterOptions from "../../../public/data/radiusFilterOptions";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import { FilterContext } from "../context/FilterContext";
import MultiLevelSelectDialog from "../dialogs/MultiLevelSelectDialog";
import SelectField from "../general/SelectField";
import LocationSearchBar from "../search/LocationSearchBar";

const useStyles = makeStyles<Theme, { justifyContent: any }>((theme) => {
  return {
    flexContainer: (props) => ({
      display: "flex",
      flexWrap: "wrap",
      columnGap: theme.spacing(2),
      rowGap: theme.spacing(1),
      paddingInline: theme.spacing(2),
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
      minWidth: 220,
    },
    locationBox: {
      width: 330,
    },
    locationFieldWrapper: {
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
      width: 125,
    },
    radiusInput: {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      borderLeft: 0,
    },
    filterElement: {
      minHeight: 40,
    },
    overlayField: {
      marginBottom: theme.spacing(2),
      width: "100%",
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
});

// Helper component for icon labels
const IconLabel = ({ Icon, title }) => {
  const classes = useStyles({ justifyContent: "flex-start" });
  return (
    <div className={classes.iconLabel}>
      <Icon fontSize="inherit" />
      {title}
    </div>
  );
};

// Text filter component
const TextFilter = ({ filter, value, onChange, isInOverlay, classes }) => {
  return (
    <TextField
      label={<IconLabel Icon={filter.icon} title={filter.title} />}
      type="text"
      value={value}
      className={`${classes.field} ${classes.filterElement} ${isInOverlay && classes.overlayField}`}
      variant="outlined"
      size="small"
      onChange={(event) => onChange(filter.key, event.target.value)}
      InputProps={{
        classes: {
          notchedOutline: value && classes.outlinedField,
        },
      }}
    />
  );
};

// Select/Multiselect filter component
const SelectFilter = ({ filter, value, onChange, isInOverlay, classes }) => {
  const isMultiselect = filter.type === "multiselect";

  return (
    <SelectField
      options={filter.options}
      className={`${classes.field} ${classes.filterElement} ${isInOverlay && classes.overlayField}`}
      multiple={isMultiselect}
      values={isMultiselect && value}
      controlled={!isMultiselect}
      controlledValue={!isMultiselect && value}
      label={<IconLabel Icon={filter.icon} title={filter.title} />}
      InputProps={{
        classes: {
          notchedOutline: value && value.length && classes.outlinedField,
        },
      }}
      size="small"
      isInOverlay={isInOverlay}
      onChange={(event) => onChange(filter.key, event.target.value)}
    />
  );
};

// Multi-level select dialog button component
const MultiSelectDialogFilter = ({
  filter,
  selectedItems,
  setSelectedItems,
  open,
  handleClickDialogOpen,
  handleClickDialogClose,
  handleClickDialogSave,
  isInOverlay,
  classes,
  texts,
}) => {
  const curSelectedItems = selectedItems[filter.key];

  const handleSetSelectedItems = (newSelectedItems) => {
    setSelectedItems({
      ...selectedItems,
      [filter.key]: newSelectedItems,
    });
  };

  return (
    <>
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
      <MultiLevelSelectDialog
        options={filter.options}
        onClose={() => handleClickDialogClose(filter.key)}
        onSave={(selectedItems) => handleClickDialogSave(filter.key, selectedItems)}
        open={open[filter.key] || false}
        selectedItems={curSelectedItems}
        setSelectedItems={handleSetSelectedItems}
        type={filter.itemType}
        title={texts["add_" + filter.itemType.replace(" ", "_")]}
      />
    </>
  );
};

// Location filter component
const LocationFilter = ({
  filter,
  value,
  radiusValue,
  onChange,
  isInOverlay,
  classes,
  locationInputRef,
  locationOptionsOpen,
  handleSetLocationOptionsOpen,
  texts,
}) => {
  const radiusFilterOptions = getRadiusFilterOptions();

  return (
    <div className={`${classes.locationFieldWrapper} ${isInOverlay && classes.overlayField}`}>
      <LocationSearchBar
        smallInput
        onSelect={(location) => onChange(filter.key, location)}
        inputClassName={
          !isInOverlay ? `${classes.field} ${classes.locationBox}` : classes.overlayLocationField
        }
        value={value}
        textFieldClassName={classes.locationField}
        onChange={(value) => onChange(filter.key, value)}
        locationInputRef={locationInputRef}
        open={locationOptionsOpen}
        handleSetOpen={handleSetLocationOptionsOpen}
        filterMode
        label={<IconLabel Icon={filter.icon} title={filter.title} />}
      />
      <SelectField
        className={classes.radiusField}
        label={texts.radius_km}
        options={radiusFilterOptions}
        controlled
        controlledValue={{ name: radiusValue }}
        size="small"
        onChange={(event) => onChange("radius", event.target.value)}
        InputProps={{
          classes: {
            root: classes.radiusInput,
          },
        }}
      />
    </div>
  );
};

// Main component
export default function Filters({
  errorMessage,
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
  const { filters: currentFilters } = useContext(FilterContext);
  const texts = getTexts({ page: "filter_and_search", locale: locale });
  const classes = useStyles({ justifyContent: justifyContent || "space-around" });

  const shouldShowFilter = (filter) => {
    if (!filter.showIf) return true;
    return currentFilters[filter.showIf.key] === filter.showIf.value;
  };

  const renderFilter = (filter) => {
    const currentFilterValue = currentFilters[filter.key];

    let component;

    switch (filter.type) {
      case "text":
        component = (
          <TextFilter
            filter={filter}
            value={currentFilterValue}
            onChange={handleValueChange}
            isInOverlay={isInOverlay}
            classes={classes}
          />
        );
        break;

      case "select":
      case "multiselect":
        component = (
          <SelectFilter
            filter={filter}
            value={currentFilterValue}
            onChange={handleValueChange}
            isInOverlay={isInOverlay}
            classes={classes}
          />
        );
        break;

      case "openMultiSelectDialogButton":
        if (!shouldShowFilter(filter)) return null;

        component = (
          <MultiSelectDialogFilter
            filter={filter}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            open={open}
            handleClickDialogOpen={handleClickDialogOpen}
            handleClickDialogClose={handleClickDialogClose}
            handleClickDialogSave={handleClickDialogSave}
            isInOverlay={isInOverlay}
            classes={classes}
            texts={texts}
          />
        );
        break;

      case "location":
        component = (
          <LocationFilter
            filter={filter}
            value={currentFilterValue}
            radiusValue={currentFilters.radius}
            onChange={handleValueChange}
            isInOverlay={isInOverlay}
            classes={classes}
            locationInputRef={locationInputRef}
            locationOptionsOpen={locationOptionsOpen}
            handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
            texts={texts}
          />
        );
        break;

      default:
        return null;
    }

    if (filter.tooltipText) {
      return (
        <Tooltip arrow placement="top" title={filter.tooltipText} key={filter.key}>
          {component}
        </Tooltip>
      );
    }

    return <div key={filter.key}>{component}</div>;
  };

  return (
    <>
      {errorMessage && (
        <div className={classes.errorMessageWrapper}>
          <Typography color="error">{errorMessage}</Typography>
        </div>
      )}

      <div className={`${classes.flexContainer} ${isInOverlay && classes.verticalFlexContainer}`}>
        {possibleFilters.map(renderFilter)}
      </div>
    </>
  );
}
