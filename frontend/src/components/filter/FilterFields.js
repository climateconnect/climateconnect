import React from "react";
import { TextField, Button, Typography, Chip, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SelectField from "../general/SelectField";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import theme from "../../themes/theme";

const useStyles = makeStyles(theme => {
  return {
    flexContainer: {
      display: "flex",
      justifyContent: "space-around",
      marginBottom: theme.spacing(1)
    },
    iconLabel: {
      display: "flex",
      alignItems: "center"
    },
    field: {
      display: "flex",
      width: 200
    },
    applyButton: {
      height: 40,
      display: "flex",
      width: "100%"
    },
    applyButtonContainer: {
      width: 200,
      display: "flex",
      justifyContent: "flex-end"
    },
    outlinedField: {
      borderColor: theme.palette.primary.main,
      borderWidth: 2
    },
    selectedBlock: {
      display: "inline-flex",
      alignItems: "center",
      marginBottom: theme.spacing(1),
      flexWrap: "wrap"
    },
    selectedToolTip: {
      marginRight: theme.spacing(1)
    },
    selectedChip: {
      margin: theme.spacing(1)
    }
  };
});

export default function FilterFields({ type, className, applyFilters, possibleFilters }) {
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const possibleFiltersFirstHalf = possibleFilters.slice(0, Math.ceil(possibleFilters.length / 2));
  const possibleFiltersSecondHalf = possibleFilters.slice(
    Math.ceil(possibleFilters.length / 2),
    possibleFilters.length
  );

  const [currentFilters, setCurrentFilters] = React.useState(
    possibleFilters.reduce((map, obj) => {
      if (obj.type === "multiselect") {
        if(obj.key === "status")
          map[obj.key] = ["Cancelled", "Successfully finished"]
        else if(obj.key === "organization_type")
          map[obj.key] = ["NGO", "Volunteer group"]
        else
          map[obj.key] = [];
      }
      else map[obj.key] = "";
      return map;
    }, {})
  );

  const handleValueChange = (key, newValue) => {
    setCurrentFilters({ ...currentFilters, [key]: newValue });
  };

  const handleApplyFilters = () => {
    applyFilters(type, currentFilters);
  };

  const handleUnselectFilter = (filterName, filterKey) => {
    setCurrentFilters({
      ...currentFilters,
      [filterKey]: currentFilters[filterKey]
        .slice(0, currentFilters[filterKey].indexOf(filterName))
        .concat(
          currentFilters[filterKey].slice(
            currentFilters[filterKey].indexOf(filterName) + 1,
            currentFilters[filterKey].length
          )
        )
    });
  };

  return (
    <div className={className}>
      {isMediumScreen ? (
        <>
          <Filters
            possibleFilters={possibleFiltersFirstHalf}
            handleApplyFilters={handleApplyFilters}
            handleValueChange={handleValueChange}
            isMediumScreen={isMediumScreen}
            currentFilters={currentFilters}
          />
          <Filters
            possibleFilters={possibleFiltersSecondHalf}
            handleApplyFilters={handleApplyFilters}
            handleValueChange={handleValueChange}
            isMediumScreen={isMediumScreen}
            currentFilters={currentFilters}
            withApplyButton={true}
            applyButtonFixedWidth={true}
          />
        </>
      ) : (
        <Filters
          possibleFilters={possibleFilters}
          handleApplyFilters={handleApplyFilters}
          handleValueChange={handleValueChange}
          isMediumScreen={isMediumScreen}
          currentFilters={currentFilters}
          withApplyButton={true}
        />
      )}
      {
        <SelectedFilters
          currentFilters={currentFilters}
          possibleFilters={possibleFilters}
          handleUnselectFilter={handleUnselectFilter}
        />
      }
    </div>
  );
}

function Filters({
  possibleFilters,
  handleApplyFilters,
  handleValueChange,
  withApplyButton,
  applyButtonFixedWidth,
  currentFilters
}) {
  const classes = useStyles();
  return (
    <>
      <div className={classes.flexContainer}>
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
                className={classes.field}
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
                className={classes.field}
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
                defaultValues={currentFilters[filter.key]}
                onChange={event => {
                  handleValueChange(filter.key, event.target.value);
                }}
              />
            );
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

function SelectedFilters({ currentFilters, possibleFilters, handleUnselectFilter }) {
  const classes = useStyles();
  return (
    <div>
      <Typography>Selected Filters</Typography>
      {Object.keys(currentFilters).map(key => {
        if (
          currentFilters[key] &&
          Array.isArray(currentFilters[key]) &&
          currentFilters[key].length
        ) {
          const filterMetadata = possibleFilters.find(f => f.key === key);
          return (
            <div key={key} className={classes.selectedBlock}>
              <Tooltip title="Delete" className={classes.selectedToolTip}>
                <filterMetadata.icon />
              </Tooltip>
              {currentFilters[key].map(filter => (
                <Chip
                  className={classes.selectedChip}
                  key={filter}
                  label={filter}
                  onDelete={() => handleUnselectFilter(filter, filterMetadata.key)}
                />
              ))}
            </div>
          );
        }
      })}
    </div>
  );
}
