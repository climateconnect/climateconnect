import React from "react";
import PropTypes from "prop-types";

import categoriesToChooseFrom from "../../../public/data/project_categories.json";
import GenericDialog from "./GenericDialog";
import MultiLevelSelector from "../general/MultiLevelSelector";
import skillsToChooseFrom from "../../../public/data/skills.json";

export default function MultiLevelSelectDialog({
  dragAble,
  items,
  itemsToChooseFrom,
  maxSelections,
  onClose,
  open,
  selectedItems,
  setSelectedItems,
  type,
}) {
  const handleClose = () => {
    setSelectedItems(items ? items : []);
    onClose();
  };

  // When clicking "Save" to close the
  // dialog, we want to apply the filters,
  // update the persisted URL, and refectch the data
  const applySkills = () => {
    onClose(selectedItems);
  };

  const itemNamePlural = type;
  const possibleItems = itemsToChooseFrom
    ? itemsToChooseFrom
    : type === "skills"
    ? skillsToChooseFrom
    : type === "project categories" && categoriesToChooseFrom;

  // Alphabetize options by name
  possibleItems.sort((a, b) => {
    if (a?.name?.toUpperCase() < b?.name?.toUpperCase()) {
      return -1;
    }

    if (a?.name?.toUpperCase() > b?.name?.toUpperCase()) {
      return 1;
    }

    return 0;
  });

  return (
    <GenericDialog
      applyText={"Save"}
      onApply={applySkills}
      onClose={handleClose}
      open={open}
      title={"Add " + itemNamePlural}
      topBarFixed
      useApplyButton={true}
    >
      <MultiLevelSelector
        dragAble={dragAble}
        isInPopup
        itemNamePlural={itemNamePlural}
        itemsToSelectFrom={possibleItems}
        maxSelections={maxSelections ? maxSelections : 10}
        selected={selectedItems}
        setSelected={setSelectedItems}
      />
    </GenericDialog>
  );
}

MultiLevelSelectDialog.propTypes = {
  open: PropTypes.bool.isRequired,
};
