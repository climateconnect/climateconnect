import React from "react";
import { TextField, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SelectField from "../general/SelectField";
import MultiLevelSelectDialog from "../dialogs/MultiLevelSelectDialog";

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
  handleClickDialogClose
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
          if (filter.type === "openMultiSelectDialogButton") {
            if (!filter.showIf || currentFilters[filter.showIf.key] === filter.showIf.value) {
              return (
                <>
                  <Button variant="outlined" onClick={() => handleClickDialogOpen(filter.key)}>
                    {filter.title}
                  </Button>
                  <MultiLevelSelectDialog
                    open={open[filter.key]}
                    onClose={selectedSkills => handleClickDialogClose(filter.key, selectedSkills)}
                    type={filter.itemsToChooseFromType}
                    items={currentFilters[filter.key]}
                  />
                </>
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
