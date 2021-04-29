import React from "react";
import PropTypes from "prop-types";

import categoriesToChooseFrom from "../../../public/data/project_categories.json";
import GenericDialog from "./GenericDialog";
import MultiLevelSelector from "../general/MultiLevelSelector";
import skillsToChooseFrom from "../../../public/data/skills.json";

export default function MultiLevelSelectDialog({
  dragAble,
  itemsToChooseFrom,
  maxSelections,
  onClose,
  open,
  selectedItems,
  setSelectedItems,
  type,
}) {
  /**
   * When clicking "Save" to close the
   * dialog, we want to apply the filters,
   * update the persisted URL, refetch the data,
   * and close the dialog.
   */
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
      onClose={onClose}
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
