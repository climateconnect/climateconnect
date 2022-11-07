import {
  Button,
  CircularProgress,
  Container,
  makeStyles,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  Tooltip,
} from "@material-ui/core";
import _ from "lodash";
import React, { useContext, useEffect, useState } from "react";
import { apiRequest } from "../../../public/lib/apiOperations";
import { getNestedValue } from "../../../public/lib/generalOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import ConfirmDialog from "../dialogs/ConfirmDialog";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import VisibleFooterHeight from "../hooks/VisibleFooterHeight";
import SaveIcon from "@material-ui/icons/Save";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";

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
    marginTop: theme.spacing(1.5),
    overflowWrap: "break-word",
  },
  divider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  translationBlocksHeader: {
    marginTop: theme.spacing(3),
  },
  translationBlock: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),

    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "center",
      border: `1px solid ${theme.palette.grey[500]}`,
      borderRadius: 15,
      padding: theme.spacing(1),
    },
  },
  translationBlockElement: {
    [theme.breakpoints.up("md")]: {
      flexGrow: 0.48,
      flexBasis: 400,
    },
    [theme.breakpoints.down("sm")]: {
      flexGrow: 0.48,
      width: "100%",
    },
  },
  topButtonRow: {
    display: "inline-flex",
    alignItems: "flex-start",
    width: "100%",
    justifyContent: "center",
    marginTop: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(0),
    },
  },
  translateButton: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      minWidth: 100,
    },
    width: 265,
  },
  translationLoader: {
    color: "white",
  },
  submitOptions: {
    display: "flex",
    flexDirection: "column",
  },
  saveAsDraftButton: {
    marginTop: theme.spacing(1),
  },
  actionBar: (props) => ({
    backgroundColor: "#ECECEC",
    top: "auto",
    bottom: props.visibleFooterHeight,
    boxShadow: "-3px -3px 6px #00000029",
    zIndex: "1",
  }),
  containerButtonsActionBar: {
    display: "flex",
    justifyContent: "space-around",
  },
  backButton: {
    border: `1px solid #000000`,
  },
}));

// @textsToTranslate: Metadata object showing which keys of the data object are translateable.
// Example: [{textKey: "short_description", rows: 5, headlineTextKey: "summary"}]
export default function TranslateTexts({
  data,
  handleSetData,
  onSubmit,
  goToPreviousStep,
  handleChangeTranslationContent,
  translations,
  targetLanguage,
  pageName,
  textsToTranslate,
  arrayTranslationKeys,
  introTextKey,
  submitButtonText,
  saveAsDraft,
  loadingSubmit,
  loadingSubmitDraft,
  organization,
}) {
  const visibleFooterHeight = VisibleFooterHeight({});
  const classes = useStyles({ visibleFooterHeight: visibleFooterHeight });

  const { locale } = useContext(UserContext);
  //For the organization page, we need to retrieve the organization name to get the german text.
  //Therefore we pass organization even it this might not make sense in most cases.
  const texts = getTexts({
    page: pageName,
    locale: data.language ? data.language : locale,
    organization: organization,
  });
  const targetLanguageTexts = getTexts({
    page: pageName,
    locale: targetLanguage,
    organization: organization,
  });

  const localeTexts = getTexts({
    page: pageName,
    locale: locale,
    organization: organization,
  });
  const [waitingForTranslation, setWaitingForTranslation] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const belowSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  useEffect(() => {
    initializeTranslationsObject();
  }, []);

  const initializeTranslationsObject = () => {
    if (!translations[targetLanguage]) {
      const initializedObject = {};
      if (arrayTranslationKeys) {
        for (const key of arrayTranslationKeys) {
          initializedObject[key] = [];
        }
      }
      handleChangeTranslationContent(targetLanguage, { ...initializedObject }, false);
    }
  };

  const handleOriginalTextChange = (newValue, dataKey, data) => {
    const obj = data;
    _.set(obj, dataKey, newValue);
    handleSetData(obj);
  };

  const handleTranslationChange = (newValue, dataKey, indexInArray) => {
    const flatKey = dataKey.includes(".")
      ? dataKey.split(".")[dataKey.split(".").length - 1]
      : dataKey;
    const newTranslationsObject = {
      [flatKey]: newValue,
    };
    //If it's an array, pass the whole array as the value
    if (indexInArray || indexInArray === 0) {
      const arrayValue = [...translations[targetLanguage][flatKey]];
      arrayValue[indexInArray] = newValue;
      newTranslationsObject[flatKey] = [...arrayValue];
    }
    handleChangeTranslationContent(targetLanguage, { ...newTranslationsObject }, true);
  };

  const areTextsToTranslateEmpty = () => {
    const textsWithContent = textsToTranslate.filter((t) => {
      return getNestedValue(data, t.textKey) && getNestedValue(data, t.textKey).length > 0;
    });
    if (textsWithContent.length === 0) return "all";
    if (textsWithContent.length === textsToTranslate.length) {
      return "none";
    } else {
      return "some";
    }
  };

  const automaticallyTranslateTexts = async (force) => {
    if (areTextsToTranslateEmpty() === "all") {
      return;
    }
    if (
      force !== true &&
      areTextsToTranslateEmpty() !== "all" &&
      translations[targetLanguage].is_manual_translation
    ) {
      setConfirmDialogOpen(true);
      return;
    }
    setWaitingForTranslation(true);
    try {
      const payloadTexts = textsToTranslate.reduce((obj, textToTranslate) => {
        const flatKey = textToTranslate.textKey.includes(".")
          ? textToTranslate.textKey.split(".")[textToTranslate.textKey.split(".").length - 1]
          : textToTranslate.textKey;
        obj[flatKey] = getNestedValue(data, textToTranslate.textKey);
        return obj;
      }, {});
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

  const onConfirmDialogClose = async (confirmed) => {
    setConfirmDialogOpen(false);
    if (confirmed) await automaticallyTranslateTexts(true);
  };
  return (
    <Container className={classes.root}>
      <form onSubmit={onSubmit}>
        <Typography className={classes.explanation} color="secondary">
          {introTextKey && localeTexts[introTextKey]}
        </Typography>

        <TranslationActionButtonBar
          belowSmall={belowSmall}
          waitingForTranslation={waitingForTranslation}
          automaticallyTranslateTexts={automaticallyTranslateTexts}
          goToPreviousStep={goToPreviousStep}
          localeTexts={localeTexts}
          loadingSubmit={loadingSubmit}
          loadingSubmitDraft={loadingSubmitDraft}
          submitButtonText={submitButtonText}
          saveAsDraft={saveAsDraft}
          visibleFooterHeight={visibleFooterHeight}
        />
        <div className={classes.translationBlocksHeader}>
          {textsToTranslate.map((textObj, index) => {
            if (textObj.isArray) {
              return data[textObj.textKey].map((entry, index) => (
                <TranslationBlock
                  key={index}
                  data={data}
                  headlineTextKey={textObj.headlineTextKey}
                  dataKey={textObj.textKey}
                  indexInArray={index}
                  isInArray
                  rows={textObj.rows}
                  handleOriginalTextChange={handleOriginalTextChange}
                  handleTranslationChange={handleTranslationChange}
                  translations={translations}
                  targetLanguage={targetLanguage}
                  texts={texts}
                  targetLanguageTexts={targetLanguageTexts}
                />
              ));
            } else
              return (
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
                  maxCharacters={textObj.maxCharacters}
                  showCharacterCounter={textObj.showCharacterCounter}
                />
              );
          })}
        </div>
      </form>
      <ConfirmDialog
        onClose={onConfirmDialogClose}
        open={confirmDialogOpen}
        cancelText={texts.no}
        confirmText={texts.yes}
        text={texts.confirm_overwrite_all_texts}
        title={texts.confirm_overwrite_all_texts_headline}
      />
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
  maxCharacters,
  showCharacterCounter,
}) {
  const classes = useStyles();
  const flatDataKey = dataKey.includes(".")
    ? dataKey.split(".")[dataKey.split(".").length - 1]
    : dataKey;

  const changeOriginalText = (newValue, dataKey) => {
    if (!isInArray) {
      handleOriginalTextChange(newValue, dataKey, data);
    } else {
      const newArrayValue = data[dataKey];
      newArrayValue[indexInArray] = newValue;
      handleOriginalTextChange(newArrayValue, dataKey, data);
    }
  };
  return (
    <div className={classes.translationBlock}>
      <TranslationBlockElement
        headline={texts[headlineTextKey]}
        noHeadline={noHeadline}
        rows={rows}
        content={
          isInArray ? getNestedValue(data, dataKey)[indexInArray] : getNestedValue(data, dataKey)
        }
        handleContentChange={(event) => {
          changeOriginalText(event.target.value, dataKey);
        }}
        maxCharacters={maxCharacters}
        characterText={texts.characters}
        showCharacterCounter={showCharacterCounter}
      />
      <TranslationBlockElement
        headline={targetLanguageTexts[headlineTextKey]}
        noHeadline={noHeadline}
        rows={rows}
        isTranslation
        content={
          translations[targetLanguage] &&
          (isInArray
            ? translations[targetLanguage][flatDataKey][indexInArray]
            : translations[targetLanguage][flatDataKey])
        }
        handleContentChange={(event) => {
          handleTranslationChange(event.target.value, dataKey, indexInArray);
        }}
        maxCharacters={maxCharacters * 1.2}
        characterText={texts.characters}
        showCharacterCounter={showCharacterCounter}
      />
    </div>
  );
}

function TranslationBlockElement({
  headline,
  rows,
  content,
  handleContentChange,
  noHeadline,
  showCharacterCounter,
  maxCharacters,
  characterText,
}) {
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
        rowsMax={50}
        variant="outlined"
        fullWidth
        multiline
        inputProps={{ maxLength: maxCharacters }}
        helperText={
          showCharacterCounter &&
          "( " + content?.length + " / " + maxCharacters + " " + characterText + " ) "
        }
        value={content}
        onChange={handleContentChange}
      />
    </div>
  );
}

function TranslationActionButtonBar({
  belowSmall,
  waitingForTranslation,
  automaticallyTranslateTexts,
  goToPreviousStep,
  localeTexts,
  loadingSubmit,
  loadingSubmitDraft,
  submitButtonText,
  saveAsDraft,
  visibleFooterHeight,
}) {
  const classes = useStyles({ visibleFooterHeight: visibleFooterHeight });

  return (
    <>
      {!belowSmall ? (
        <div className={classes.topButtonRow}>
          <BackButton
            goToPreviousStep={goToPreviousStep}
            label={{ label: localeTexts.back }}
            localeTexts={localeTexts}
          />
          <TranslateButton
            automaticallyTranslateTexts={automaticallyTranslateTexts}
            waitingForTranslation={waitingForTranslation}
            label={localeTexts.automatically_translate}
          />
          <div className={classes.submitOptions}>
            <SaveButtons
              loadingSubmit={loadingSubmit}
              loadingSubmitDraft={loadingSubmitDraft}
              localeTexts={localeTexts}
              label={{ label: submitButtonText }}
              saveAsDraft={saveAsDraft}
            />
          </div>
        </div>
      ) : (
        <AppBar className={classes.actionBar} position="fixed" elevation={0}>
          <Toolbar className={classes.containerButtonsActionBar} variant="dense">
            {" "}
            <div className={classes.topButtonRow}>
              <BackButton
                goToPreviousStep={goToPreviousStep}
                label={{ icon: KeyboardBackspaceIcon }}
                localeTexts={localeTexts}
              />
              <TranslateButton
                automaticallyTranslateTexts={automaticallyTranslateTexts}
                waitingForTranslation={waitingForTranslation}
                label={localeTexts.translate}
              />
              <div className={classes.submitOptions}>
                <SaveButtons
                  loadingSubmit={loadingSubmit}
                  loadingSubmitDraft={loadingSubmitDraft}
                  localeTexts={localeTexts}
                  label={{ icon: SaveIcon }}
                  saveAsDraft={saveAsDraft}
                />
              </div>
            </div>
          </Toolbar>
        </AppBar>
      )}
    </>
  );
}

function BackButton({ goToPreviousStep, label, localeTexts }) {
  const classes = useStyles();
  return (
    <Button onClick={goToPreviousStep} className={classes.backButton} variant="contained">
      {label.icon ? (
        <Tooltip arrow placement="top" title={localeTexts.back}>
          <label.icon />
        </Tooltip>
      ) : (
        label.label
      )}
    </Button>
  );
}

function TranslateButton({ automaticallyTranslateTexts, waitingForTranslation, label }) {
  const classes = useStyles();
  return (
    <Button
      variant="contained"
      color="primary"
      className={classes.translateButton}
      onClick={() => automaticallyTranslateTexts()}
      disabled={waitingForTranslation}
    >
      {waitingForTranslation ? (
        <CircularProgress className={classes.translationLoader} size={23} />
      ) : (
        label
      )}
    </Button>
  );
}

function SaveButtons({ loadingSubmit, loadingSubmitDraft, localeTexts, label, saveAsDraft }) {
  const classes = useStyles();
  return (
    <>
      <Button
        variant="contained"
        color="primary"
        type="submit"
        disabled={loadingSubmit || loadingSubmitDraft}
      >
        {loadingSubmit ? (
          <CircularProgress className={classes.translationLoader} size={23} />
        ) : label ? (
          label.icon ? (
            <Tooltip arrow placement="top" title={localeTexts.save}>
              <label.icon />
            </Tooltip>
          ) : (
            label.label
          )
        ) : (
          localeTexts.skip_and_publish
        )}
      </Button>
      {saveAsDraft && (
        <Button
          variant="contained"
          disabled={loadingSubmit || loadingSubmitDraft}
          onClick={saveAsDraft}
          className={classes.saveAsDraftButton}
        >
          {loadingSubmitDraft ? (
            <CircularProgress className={classes.translationLoader} size={23} />
          ) : (
            localeTexts.save_as_draft
          )}
        </Button>
      )}
    </>
  );
}
