import PropTypes from "prop-types";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import MultiLevelSelector from "../general/MultiLevelSelector";
import GenericDialog from "./GenericDialog";

export default function MultiLevelSelectDialog({
  dragAble,
  options,
  maxSelections,
  onClose,
  onSave,
  open,
  selectedItems,
  setSelectedItems,
  type,
  title,
}: any) {
  /**
   * When clicking "Save" we want to apply the filters,
   * update the persisted URL, refetch the data,
   * and close the dialog.
   */
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });

  const applySkills = () => {
    if (onSave) onSave(selectedItems);
    onClose(selectedItems);
  };

  const itemNamePlural = texts[type];

  const possibleItems = options;

  // Alphabetize options by name
  possibleItems?.sort((a, b) => {
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
      applyText={texts.save}
      onApply={applySkills}
      onClose={onClose}
      open={open}
      title={title ? title : texts.add + " " + itemNamePlural}
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
