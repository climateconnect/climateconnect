import { Button, Container, TextField, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useState } from "react";
import { apiRequest } from "../../../public/lib/apiOperations";
import getProjectTexts from "../../../public/texts/project_texts";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import NavigationButtons from "../general/NavigationButtons";
import ButtonLoader from "../general/ButtonLoader";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  explanation: {
    margin: "0 auto",
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: theme.spacing(1.5),
  },
  translationBlocksHeader: {
    marginTop: theme.spacing(3),
  },
  translationBlock: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
  },
  translationBlockElement: {
    flexGrow: 0.48,
  },
  topButtonRow: {
    display: "inline-flex",
    width: "100%",
    justifyContent: "center",
    marginTop: theme.spacing(2),
  },
  translateButton: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
    width: 265,
  },
}));

export default function TranslateProject({
  projectData,
  handleSetProjectData,
  onSubmit,
  saveAsDraft,
  goToPreviousStep,
  handleChangeTranslationContent,
  translations,
  targetLanguage,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const [waitingForTranslation, setWaitingForTranslation] = useState(false);

  if (translations[targetLanguage]) console.log(translations[targetLanguage]);

  const onClickPreviousStep = () => {
    goToPreviousStep();
  };

  const handleOriginalTextChange = (newValue, projectDataKey) => {
    handleSetProjectData({
      [projectDataKey]: newValue,
    });
  };

  const handleTranslationChange = (newValue, projectDataKey, indexInArray) => {
    const newTranslationsObject = {
      [projectDataKey]: newValue,
    };
    //If it's an array, pass the whole array as the value
    if (indexInArray || indexInArray === 0) {
      const arrayValue = [...translations[targetLanguage][projectDataKey]];
      arrayValue[indexInArray] = newValue;
      newTranslationsObject[projectDataKey] = [...arrayValue];
    }
    handleChangeTranslationContent(targetLanguage, { ...newTranslationsObject }, true);
  };

  const automaticallyTranslateProject = async () => {
    setWaitingForTranslation(true);
    try {
      const response = await apiRequest({
        method: "post",
        url: "/api/translate_many/",
        payload: {
          texts: {
            name: projectData.name,
            short_description: projectData.short_description,
            description: projectData.description,
          },
          target_language: "en",
        },
        locale: locale,
      });
      const translations = response.data.translations;
      const translationsObject = Object.keys(translations).reduce(function (obj, key) {
        if (Array.isArray(translations[key]))
          obj[key] = translations[key].map((t) => t?.translated_text);
        else obj[key] = translations[key]?.translated_text;
        return obj;
      }, {});
      console.log(translationsObject);
      handleChangeTranslationContent(targetLanguage, translationsObject);
      setWaitingForTranslation(false);
    } catch (e) {
      console.log(e);
      console.log(e?.response?.data);
      setWaitingForTranslation(false);
    }
  };

  return (
    <Container className={classes.root}>
      <form onSubmit={onSubmit}>
        <Typography className={classes.explanation} color="secondary">
          {texts.translate_project_intro}
        </Typography>
        <div className={classes.topButtonRow}>
          <Button onClick={goToPreviousStep} variant="contained">
            {texts.back}
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={classes.translateButton}
            onClick={automaticallyTranslateProject}
          >
            {waitingForTranslation ? <ButtonLoader /> : texts.automatically_translate}
          </Button>
          <Button variant="contained" color="primary" type="submit">
            {texts.skip_and_publish}
          </Button>
        </div>
        <div className={classes.translationBlocksHeader}>
          <TranslationBlock
            projectData={projectData}
            headlineTextKey="project_name"
            projectDataKey="name"
            rows={1}
            handleOriginalTextChange={handleOriginalTextChange}
            handleTranslationChange={handleTranslationChange}
            translations={translations}
            targetLanguage={targetLanguage}
          />
          <TranslationBlock
            projectData={projectData}
            headlineTextKey="summary"
            projectDataKey="short_description"
            rows={5}
            handleOriginalTextChange={handleOriginalTextChange}
            handleTranslationChange={handleTranslationChange}
            translations={translations}
            targetLanguage={targetLanguage}
          />
          <TranslationBlock
            projectData={projectData}
            projectDataKey="description"
            headlineTextKey="project_description"
            rows={15}
            handleOriginalTextChange={handleOriginalTextChange}
            handleTranslationChange={handleTranslationChange}
            translations={translations}
            targetLanguage={targetLanguage}
          />
        </div>
        <NavigationButtons
          className={classes.block}
          onClickPreviousStep={onClickPreviousStep}
          nextStepButtonType="publish"
          saveAsDraft={saveAsDraft}
        />
      </form>
    </Container>
  );
}

//@textKey: the key of the headline text in public/texts/project_texts.js
function TranslationBlock({
  headlineTextKey,
  rows,
  projectData,
  projectDataKey,
  handleOriginalTextChange,
  handleTranslationChange,
  translations,
  targetLanguage,
  isInArray,
  indexInArray,
  noHeadline,
}) {
  const texts = getProjectTexts({});
  const classes = useStyles();
  return (
    <div className={classes.translationBlock}>
      <TranslationBlockElement
        headline={texts[headlineTextKey][targetLanguage]}
        noHeadline={noHeadline}
        rows={rows}
        content={
          isInArray ? projectData[projectDataKey][indexInArray] : projectData[projectDataKey]
        }
        handleContentChange={(event) =>
          handleOriginalTextChange(event.target.value, projectDataKey)
        }
      />
      <TranslationBlockElement
        headline={texts[headlineTextKey][targetLanguage]}
        noHeadline={noHeadline}
        rows={rows}
        isTranslation
        content={
          translations[targetLanguage] &&
          (isInArray
            ? translations[targetLanguage][projectDataKey][indexInArray]
            : translations[targetLanguage][projectDataKey])
        }
        handleContentChange={(event) =>
          handleTranslationChange(event.target.value, projectDataKey, indexInArray)
        }
      />
    </div>
  );
}

function TranslationBlockElement({ headline, rows, content, handleContentChange, noHeadline }) {
  const classes = useStyles();
  return (
    <div className={classes.translationBlockElement}>
      {!noHeadline && (
        <Typography color="primary" className={classes.sectionHeader}>
          {headline}
        </Typography>
      )}
      <TextField
        rows={rows}
        variant="outlined"
        fullWidth
        multiline
        value={content}
        onChange={handleContentChange}
      />
    </div>
  );
}
