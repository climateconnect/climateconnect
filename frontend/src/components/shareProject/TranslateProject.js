import { Button, CircularProgress, Container, makeStyles, TextField, Typography } from "@material-ui/core";
import axios from "axios";
import React, { useContext } from "react";
import getProjectTexts from "../../../public/texts/project_texts";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import BottomNavigation from "../general/BottomNavigation";

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
    width: 265
  },
  translationLoader: {
    color: "white",
  }
}));

export default function TranslateProject({
  projectData,
  handleSetProjectData,
  onSubmit,
  saveAsDraft,
  goToPreviousStep,
  handleChangeTranslationContent,
  changeToManualTranslation,
  translations,
  targetLanguage
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const [waitingForTranslation, setWaitingForTranslation] = React.useState(false)

  const onClickPreviousStep = () => {
    goToPreviousStep();
  };

  const handleOriginalTextChange = (newValue, projectDataKey) => {
    handleSetProjectData({
      [projectDataKey]: newValue,
    });
  };

  const handleTranslationChange = (newValue, projectDataKey) => {
    handleChangeTranslationContent(targetLanguage, {[projectDataKey]: newValue});
    changeToManualTranslation();
  };

  const automaticallyTranslateProject = async () => {
    setWaitingForTranslation(true)
    try{
      const response = await axios.post(
        process.env.API_URL + "/api/translate_many/",
        {
          texts: {
            short_description: projectData.short_description,
            description: projectData.description
          },
          target_language: "en"
        }
      )
      const translations = response.data.translations
      const translationsObject = Object.keys(translations).reduce(function(obj, key){
        obj[key] = translations[key]?.translated_text
        return obj
      }, {})
      handleChangeTranslationContent(targetLanguage, translationsObject)
      setWaitingForTranslation(false)
    } catch(e) {
      console.log(e)
      console.log(e?.response?.data)
      setWaitingForTranslation(false)
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
            {
              waitingForTranslation ?
                <CircularProgress className={classes.translationLoader} size={23}/>  
              :
                texts.automatically_translate
            }
          </Button>
          <Button variant="contained" color="primary" type="submit">
            {texts.skip_and_publish}
          </Button>
        </div>
        <div className={classes.translationBlocksHeader}>
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
        <BottomNavigation
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
}) {
  const texts = getProjectTexts({});
  const classes = useStyles();
  return (
    <div className={classes.translationBlock}>
      <TranslationBlockElement
        headline={texts[headlineTextKey][targetLanguage]}
        rows={rows}
        content={projectData[projectDataKey]}
        handleContentChange={(event) =>
          handleOriginalTextChange(event.target.value, projectDataKey)
        }
      />
      <TranslationBlockElement
        headline={texts[headlineTextKey][targetLanguage]}
        rows={rows}
        isTranslation
        content={translations[targetLanguage][projectDataKey]}
        handleContentChange={(event) => handleTranslationChange(event.target.value, projectDataKey)}
      />
    </div>
  );
}

function TranslationBlockElement({ headline, rows, content, handleContentChange }) {
  const classes = useStyles();
  return (
    <div className={classes.translationBlockElement}>
      <Typography color="primary" className={classes.sectionHeader}>
        {headline}
      </Typography>
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
