import {
  Button,
  CircularProgress,
  Container,
  makeStyles,
  TextField,
  Typography
} from "@material-ui/core";
import React, { useContext, useEffect } from "react";
import { apiRequest } from "../../../public/lib/apiOperations";
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
    width: 265,
  },
  translationLoader: {
    color: "white",
  },
}));

// @textsToTranslate: Metadata object showing which keys of the data object are translateable.
// Example: [{textKey: "short_description", rows: 5, headlineTextKey: "summary"}]
export default function TranslateTexts({
  data,
  handleSetData,
  onSubmit,
  saveAsDraft,
  goToPreviousStep,
  handleChangeTranslationContent,
  translations,
  targetLanguage,
  pageName,
  textsToTranslate,
  arrayTranslationKeys,
  introTextKey,
}) {
  console.log(translations)
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: pageName, locale: locale });
  const targetLanguageTexts = getTexts({ page: pageName, locale: targetLanguage })
  const [waitingForTranslation, setWaitingForTranslation] = React.useState(false);

  if (translations[targetLanguage]) console.log(translations[targetLanguage]);

  useEffect(() => {
    initializeTranslationsObject();
  }, []);

  const initializeTranslationsObject = () => {
    if (!translations[targetLanguage]) {
      const initializedObject = {};
      if(arrayTranslationKeys){
        for (const key of arrayTranslationKeys) {
          initializedObject[key] = [];
        }
      }
      handleChangeTranslationContent(targetLanguage, { ...initializedObject }, false);
    }
  };

  const onClickPreviousStep = () => {
    goToPreviousStep();
  };

  const handleOriginalTextChange = (newValue, dataKey) => {
    handleSetData({
      [dataKey]: newValue,
    });
  };

  const handleTranslationChange = (newValue, dataKey, indexInArray) => {
    const newTranslationsObject = {
      [dataKey]: newValue,
    };
    //If it's an array, pass the whole array as the value
    if (indexInArray || indexInArray === 0) {
      const arrayValue = [...translations[targetLanguage][dataKey]];
      arrayValue[indexInArray] = newValue;
      newTranslationsObject[dataKey] = [...arrayValue];
    }
    handleChangeTranslationContent(targetLanguage, { ...newTranslationsObject }, true);
  };

  const automaticallyTranslateProject = async () => {
    setWaitingForTranslation(true);
    try {
      const payloadTexts = textsToTranslate.reduce((obj, textToTranslate) => {
        obj[textToTranslate.textKey] = data[textToTranslate.textKey]
        return obj
      },{})
      const response = await apiRequest({
        method: "post",
        url: "/api/translate_many/",
        payload: {
          texts: payloadTexts,
          target_language: "en",
        },
        locale: locale,
        shouldThrowError: true,
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

  console.log(introTextKey)
  console.log(texts[introTextKey])
  console.log(texts)

  return (
    <Container className={classes.root}>
      <form onSubmit={onSubmit}>
        <Typography className={classes.explanation} color="secondary">
          {introTextKey && texts[introTextKey]}
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
            {waitingForTranslation ? (
              <CircularProgress className={classes.translationLoader} size={23} />
            ) : (
              texts.automatically_translate
            )}
          </Button>
          <Button variant="contained" color="primary" type="submit">
            {texts.skip_and_publish}
          </Button>
        </div>
        <div className={classes.translationBlocksHeader}>
          {textsToTranslate.map((textObj, index) => (
            <TranslationBlock
              key={index}
              data={data}
              headlineTextKey={textObj.headlineTextKey}
              dataKey={textObj.textKey}
              rows={textObj.rows}
              handleOriginalTextChange={handleOriginalTextChange}
              handleTranslationChange={handleTranslationChange}
              translations={translations}
              targetLanguage={targetLanguage}
              texts={texts}
              targetLanguageTexts={targetLanguageTexts}
            />
          ))}
          {/*data?.helpful_connections?.length > 0 &&
            data.helpful_connections.map((connection, index) => (
              <TranslationBlock
                key={index}
                data={data}
                dataKey="helpful_connections"
                headlineTextKey="helpful_connections"
                rows={1}
                indexInArray={index}
                isInArray
                handleOriginalTextChange={handleOriginalTextChange}
                handleTranslationChange={handleTranslationChange}
                translations={translations}
                targetLanguage={targetLanguage}
                noHeadline={index > 0}
              />
            ))*/}
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
  data,
  dataKey,
  handleOriginalTextChange,
  handleTranslationChange,
  translations,
  targetLanguage,
  isInArray,
  indexInArray,
  noHeadline,
  texts,
  targetLanguageTexts,
}) {
  const classes = useStyles();
  console.log(texts[headlineTextKey])
  return (
    <div className={classes.translationBlock}>
      <TranslationBlockElement
        headline={texts[headlineTextKey]}
        noHeadline={noHeadline}
        rows={rows}
        content={
          isInArray ? data[dataKey][indexInArray] : data[dataKey]
        }
        handleContentChange={(event) =>
          handleOriginalTextChange(event.target.value, dataKey)
        }
      />
      <TranslationBlockElement
        headline={targetLanguageTexts[headlineTextKey]}
        noHeadline={noHeadline}
        rows={rows}
        isTranslation
        content={
          translations[targetLanguage] &&
          (isInArray
            ? translations[targetLanguage][dataKey][indexInArray]
            : translations[targetLanguage][dataKey])
        }
        handleContentChange={(event) =>
          handleTranslationChange(event.target.value, dataKey, indexInArray)
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
