import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import MultiLevelSelector from "../general/MultiLevelSelector";
import GenericDialog from "./GenericDialog";
import SaveIcon from "@mui/icons-material/Save";

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
   * update the persisted URL, re-fetch the data,
   * and close the dialog.
   */
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });

  const applySkills = (shouldSave: boolean) => {
    if (onSave && shouldSave) {
      onSave(selectedItems);
    }
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
  const getTitle = () => {
    if (title) {
      return title;
    } else {
      if (locale === "de") {
        return `${itemNamePlural} ${texts.add}`;
      }
      //For english and other locales
      return texts.add + " " + itemNamePlural;
    }
  };

  const renderedTitle = getTitle();

  return (
    <GenericDialog
      applyText={texts.save}
      applyIcon={{ icon: SaveIcon }}
      onApply={() => applySkills(true)}
      onClose={() => applySkills(false)}
      open={open}
      title={renderedTitle}
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
