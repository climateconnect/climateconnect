import React from "react";
import PropTypes from "prop-types";
import GenericDialog from "./GenericDialog";
import MultiLevelSelector from "../general/MultiLevelSelector";
import skillsToChooseFrom from "../../../public/data/skills.json";
import categoriesToChooseFrom from "../../../public/data/project_categories.json";

export default function MultiLevelSelectDialog({
  items,
  onClose,
  open,
  type,
  maxSelections,
  itemsToChooseFrom,
  selectedItems,
  setSelectedItems,
  dragAble
}) {
  const handleClose = () => {
    setSelectedItems(items ? items : []);
    onClose();
  };

  const applySkills = () => {
    onClose(selectedItems);
  };

  const itemNamePlural = type;

  const possibleItems = itemsToChooseFrom
    ? itemsToChooseFrom
    : type === "skills"
    ? skillsToChooseFrom
    : type === "project categories" && categoriesToChooseFrom;

  return (
    <GenericDialog
      onClose={handleClose}
      open={open}
      title={"Add " + itemNamePlural}
      useApplyButton={true}
      onApply={applySkills}
      applyText={"Save"}
      topBarFixed
    >
      <MultiLevelSelector
        itemsToSelectFrom={possibleItems}
        maxSelections={maxSelections ? maxSelections : 10}
        itemNamePlural={itemNamePlural}
        selected={selectedItems}
        setSelected={setSelectedItems}
        isInPopup
        dragAble={dragAble}
      />
    </GenericDialog>
  );
}

MultiLevelSelectDialog.propTypes = {
  open: PropTypes.bool.isRequired
};
