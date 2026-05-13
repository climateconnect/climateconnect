import React, { useContext, useState } from "react";
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowDropDownCircleOutlinedIcon from "@mui/icons-material/ArrowDropDownCircleOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import makeStyles from "@mui/styles/makeStyles";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import { RegistrationField } from "../../types";
import RegistrationFieldEditor from "./RegistrationFieldEditor";

const MAX_FIELDS = 5;

const useStyles = makeStyles((theme) => ({
  fieldPaper: {
    marginBottom: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
  },
  fieldHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(0.5),
  },
  controlsRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.25),
  },
  fieldFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing(0.5),
  },
}));

type Props = {
  fields: RegistrationField[];
  onFieldsChange: (_updated: RegistrationField[]) => void;
};

export default function RegistrationFieldList({ fields, onFieldsChange }: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale });

  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);

  const handleOpenAddMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleCloseAddMenu = () => {
    setAddMenuAnchor(null);
  };

  const handleAddField = (fieldType: "checkbox" | "option_select") => {
    const newOrder = fields.length;
    const newField: RegistrationField = {
      field_type: fieldType,
      order: newOrder,
      is_required: false,
      settings: fieldType === "checkbox" ? { description: "" } : { title: "" },
      options: fieldType === "option_select" ? [] : undefined,
      _clientKey: `new_${Date.now()}_${Math.random()}`,
    };
    onFieldsChange([...fields, newField]);
    handleCloseAddMenu();
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...fields];
    const above = updated[index - 1];
    updated[index - 1] = { ...updated[index], order: index - 1 };
    updated[index] = { ...above, order: index };
    onFieldsChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === fields.length - 1) return;
    const updated = [...fields];
    const below = updated[index + 1];
    updated[index + 1] = { ...updated[index], order: index + 1 };
    updated[index] = { ...below, order: index };
    onFieldsChange(updated);
  };

  const handleDeleteField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i }));
    onFieldsChange(updated);
  };

  const handleFieldChange = (index: number, updatedField: RegistrationField) => {
    const updated = [...fields];
    updated[index] = updatedField;
    onFieldsChange(updated);
  };

  const isAtMax = fields.length >= MAX_FIELDS;

  return (
    <Box>
      {fields.map((field, index) => (
        <Paper
          key={field._clientKey ?? (field.id != null ? String(field.id) : `idx_${index}`)}
          variant="outlined"
          className={classes.fieldPaper}
        >
          <Box className={classes.fieldHeader}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {field.field_type === "checkbox" ? (
                <CheckBoxOutlinedIcon fontSize="small" color="action" />
              ) : (
                <ArrowDropDownCircleOutlinedIcon fontSize="small" color="action" />
              )}
              <Typography variant="subtitle2" color="textSecondary">
                {field.field_type === "checkbox"
                  ? texts.field_type_checkbox
                  : texts.field_type_option_select}
              </Typography>
            </Box>
            <Box className={classes.controlsRow}>
              <Tooltip title={texts.move_field_up}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    aria-label={texts.move_field_up}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={texts.move_field_down}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === fields.length - 1}
                    aria-label={texts.move_field_down}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
          <Divider sx={{ mb: 1.5 }} />
          <RegistrationFieldEditor
            field={field}
            onChange={(updated) => handleFieldChange(index, updated)}
          />
          <Divider sx={{ mt: 1.5 }} />
          <Box className={classes.fieldFooter}>
            <FormControlLabel
              control={
                <Switch
                  checked={field.is_required}
                  onChange={(e) =>
                    handleFieldChange(index, { ...field, is_required: e.target.checked })
                  }
                  color="primary"
                  size="small"
                />
              }
              label={texts.registration_field_required}
            />
            <Tooltip title={texts.delete_field}>
              <IconButton
                size="small"
                onClick={() => handleDeleteField(index)}
                aria-label={texts.delete_field}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      ))}
      <Button
        variant="outlined"
        size="small"
        startIcon={<AddIcon />}
        onClick={isAtMax ? undefined : handleOpenAddMenu}
        disabled={isAtMax}
        aria-label={texts.add_registration_field}
        sx={{ mt: fields.length > 0 ? 0.5 : 0 }}
      >
        {isAtMax ? texts.max_registration_fields_reached : texts.add_registration_field}
      </Button>
      <Menu anchorEl={addMenuAnchor} open={Boolean(addMenuAnchor)} onClose={handleCloseAddMenu}>
        <MenuItem onClick={() => handleAddField("checkbox")}>
          <ListItemIcon>
            <CheckBoxOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{texts.field_type_checkbox}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAddField("option_select")}>
          <ListItemIcon>
            <ArrowDropDownCircleOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{texts.field_type_option_select}</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
