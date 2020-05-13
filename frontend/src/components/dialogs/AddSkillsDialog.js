import React from "react";
import PropTypes from "prop-types";
import GenericDialog from "./GenericDialog";
import MultiLevelSelector from "../shareProject/MultiLevelSelector";
import skillsToChooseFrom from "../../../public/data/skills.json";

export default function AddSkillsDialog({ skills, onClose, open }) {
  const [selectedSkills, setSelectedSkills] = React.useState(skills ? skills : []);

  const handleClose = () => {
    setSelectedSkills(skills?skills:[])
    onClose();
  };

  const applySkills = () => {
    onClose(selectedSkills);
  };

  return (
    <GenericDialog
      onClose={handleClose}
      open={open}
      title={"Add skills"}
      useApplyButton={true}
      onApply={applySkills}
      applyText={"Add"}
    >
      <MultiLevelSelector
        itemsToSelectFrom={skillsToChooseFrom}
        maxSelections={10}
        itemNamePlural="skills"
        selected={selectedSkills}
        setSelected={setSelectedSkills}
        isInPopup
      />
    </GenericDialog>
  );
}

AddSkillsDialog.propTypes = {
  open: PropTypes.bool.isRequired
};
