import { Button, IconButton, Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

type StyleProps = {
  hubSlug?: string;
};
const PRIO1_SLUG = "prio1";
const WASSERAKTIONSWOCHEN_PARENT_SLUG = "wasseraktionswochen-143-2932026";

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) => ({
  button: (props) => ({
    color:
      props.hubSlug === PRIO1_SLUG
        ? theme.palette.background.default
        : theme.palette.primary.contrastText,
    height: 54,
    [theme.breakpoints.down("sm")]: {
      minWidth: 35,
      maxWidth: 35,
      minHeight: 35,
      maxHeight: 35,
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
      },
    },
  }),
}));

export default function GoBackFromProjectPageButton({
  texts,
  tinyScreen,
  locale,
  containerClassName,
  hubSlug,
  project,
}: any) {
  const classes = useStyles({ hubSlug: hubSlug });
  const router = useRouter();

  const [backButtonText, setBackButtonText] = useState(texts.go_back);
  const [specialEventPagePath, setSpecialEventPagePath] = useState<string | null>(null);

  // Check if user came from a special event page and set button text accordingly
  useEffect(() => {
    if (typeof document === "undefined" || !project?.parent_project_slug) {
      return;
    }

    const referrer = document.referrer;

    // Check if user came from the Wasseraktionswochen special page
    if (
      project.parent_project_slug === WASSERAKTIONSWOCHEN_PARENT_SLUG &&
      referrer.includes("/hubs/em/wasseraktionswochen")
    ) {
      // If they came from the special page, it means the feature is active
      const backText =
        texts.back_to_parent?.replace("{parent_name}", project.parent_project_name || "") ||
        texts.go_back;
      setBackButtonText(backText);
      setSpecialEventPagePath(`/${locale}/hubs/em/wasseraktionswochen`);
    }
  }, [project?.parent_project_slug, project?.parent_project_name, texts, locale]);

  const goBack = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hubPage = urlParams.get("hub");

    // Check if we should use router.back() or fallback to a specific URL
    if (typeof window !== "undefined" && window.history.length > 1) {
      const referrer = document.referrer;

      // Check if referrer is a language switch (same project page, different language)
      // by checking if the referrer contains the same project slug
      const isLanguageSwitch = referrer &&
        project?.url_slug &&
        referrer.includes(`/projects/${project.url_slug}`);

      if (isLanguageSwitch && window.history.length > 2) {
        // Go back 2 steps to skip the language switch
        window.history.go(-2);
      } else if (isLanguageSwitch) {
        // Only one page in history before language switch, use fallback
        navigateToFallback(specialEventPagePath, hubPage);
      } else {
        // Normal back navigation
        router.back();
      }
    } else {
      // No history, use fallback
      navigateToFallback(specialEventPagePath, hubPage);
    }
  };

  const navigateToFallback = (specialPagePath: string | null, hubPage: string | null) => {
    let fallbackUrl;

    if (specialPagePath) {
      // Fallback to special event page if available
      fallbackUrl = specialPagePath;
    } else if (hubPage) {
      // Fallback to hub browse page
      fallbackUrl = "/" + locale + "/hubs/" + hubPage + "/browse";
    } else {
      // Fallback to general browse page
      fallbackUrl = "/" + locale + "/browse";
    }

    router.push(fallbackUrl);
  };

  if (tinyScreen)
    return (
      <div className={containerClassName}>
        <IconButton onClick={goBack} className={classes.button} size="large">
          {/*adjusted viewBox to center the icon*/}
          <ArrowBackIosIcon fontSize="small" viewBox="-4.5 0 24 24" />
        </IconButton>
      </div>
    );
  else
    return (
      <div className={containerClassName}>
        <Button onClick={goBack} className={classes.button} startIcon={<ArrowBackIcon />}>
          {backButtonText}
        </Button>
      </div>
    );
}
