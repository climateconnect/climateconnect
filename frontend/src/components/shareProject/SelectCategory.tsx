import { Container, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import NavigationButtons from "../general/NavigationButtons";
import MultiLevelSelector from "../general/MultiLevelSelector";

const useStyles = makeStyles((theme) => {
  return {
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(8),
      marginBottom: theme.spacing(8),
    },
    stepsTracker: {
      maxWidth: 600,
      margin: "0 auto",
    },
    block: {
      marginBottom: theme.spacing(4),
    },
    backButton: {
      color: theme.palette.primary.main,
    },
    nextStepButton: {
      float: "right",
    },
    appealText: {
      textAlign: "center",
      fontWeight: "bold",
    },
    appealBox: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(-2),
    },
  };
});

export default function SelectCategory({
  project,
  handleSetProjectData,
  goToNextStep,
  goToPreviousStep,
  categoryOptions,
}) {
  const classes = useStyles();
  const [selectedCategories, setSelectedCategories] = React.useState(
    project.project_tags ? project.project_tags : []
  );
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });

  const onClickNextStep = () => {
    if (selectedCategories.length <= 0) alert(texts.please_choose_at_least_one_category);
    else if (selectedCategories.length > 3) alert(texts.you_can_only_choose_up_to_3_categories);
    else {
      handleSetProjectData({ project_tags: selectedCategories });
      goToNextStep();
    }
  };

  const onClickPreviousStep = () => {
    handleSetProjectData({ project_tags: selectedCategories });
    goToPreviousStep();
  };

  return (
    <Container maxWidth="lg">
      <div className={classes.appealBox}>
        <Typography className={classes.appealText}>
          {texts.you_can_combine_categories_text}
        </Typography>
        <Typography className={classes.appealText}>
          {texts.this_way_you_can_specify_what_you_are_doing_and_in_which_field}
        </Typography>
      </div>
      <div className={classes.block}>
        <MultiLevelSelector
          itemsToSelectFrom={categoryOptions}
          maxSelections={3}
          itemNamePlural="categories"
          selected={selectedCategories}
          setSelected={setSelectedCategories}
          dragAble={true}
        />
      </div>
      <NavigationButtons
        className={classes.block}
        onClickPreviousStep={onClickPreviousStep}
        onClickNextStep={onClickNextStep}
      />
    </Container>
  );
}
