import { Divider, Theme, Typography, useMediaQuery } from "@mui/material";
import { alpha } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getProjectTypeTexts from "../../../public/data/projectTypeTexts";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import { Project } from "../../types";
import UserContext from "../context/UserContext";
import QrCodeDownload from "../shareContent/QrCodeDownload";
import SocialMediaShareOptions from "../shareContent/SocialMediaShareOptions";
import { SHARE_OPTIONS } from "../shareContent/shareOptions";
import useCreateShareRecord from "../shareContent/useCreateShareRecord";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(6),
    padding: theme.spacing(4),
    //tint derives from the active theme's primary color so it works on custom hubs
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    borderRadius: theme.spacing(1),
  },
  headline: {
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    marginBottom: theme.spacing(4),
  },
  shareArea: {
    display: "flex",
    gap: theme.spacing(4),
    textAlign: "left",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      textAlign: "center",
    },
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  columnTitle: {
    marginBottom: theme.spacing(2),
  },
  qrDescription: {
    marginBottom: theme.spacing(2),
  },
  qrCodeContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      alignItems: "center",
    },
  },
}));

type ShareProjectCallToActionProps = {
  url_slug: string;
  projectTypeId: "project" | "idea" | "event";
  projectName?: string;
  hubName?: string;
};

//Call to action shown right after a project/idea/event was published.
//Encourages the creator to promote their page: inline share buttons for social
//media/messengers plus a downloadable QR code for print material.
export default function ShareProjectCallToAction({
  url_slug,
  projectTypeId,
  projectName,
  hubName,
}: ShareProjectCallToActionProps) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const isTinyScreen = useMediaQuery<Theme>(theme.breakpoints.down("sm"));
  const texts = getTexts({
    page: "project",
    locale: locale,
    //getTexts expects a full Project, but only project.name is used for text interpolation here
    project: { name: projectName } as Project,
    hubName: hubName,
  });
  const projectTypeTexts = getProjectTypeTexts(texts);
  const typeId = projectTypeId ?? "project";

  const queryString = hubName ? `?hub=${hubName}` : "";
  const BASE_URL = process.env.BASE_URL ? process.env.BASE_URL : `https://climateconnect.earth`;
  const contentLink = `${BASE_URL}${getLocalePrefix(locale)}/projects/${url_slug}${queryString}`;

  const createShareRecord = useCreateShareRecord(`/api/projects/${url_slug}/set_shared_project/`);

  return (
    <section className={classes.root}>
      <Typography variant="h4" component="h2" className={classes.headline}>
        {projectTypeTexts.shareCtaHeadline[typeId]}
      </Typography>
      <Typography className={classes.subtitle}>
        {projectTypeTexts.shareCtaSubtitle[typeId]}
      </Typography>
      <div className={classes.shareArea}>
        <div className={classes.column}>
          <Typography variant="h6" component="h3" className={classes.columnTitle}>
            {texts.share_online_title}
          </Typography>
          <SocialMediaShareOptions
            createShareRecord={createShareRecord}
            tinyScreen={isTinyScreen}
            SHARE_OPTIONS={SHARE_OPTIONS}
            contentLink={contentLink}
            messageTitle={projectTypeTexts.shareMessageTitle[typeId]}
            mailBody={texts.share_own_content_email_body}
            texts={texts}
          />
        </div>
        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />
        <Divider sx={{ display: { xs: "block", md: "none" } }} />
        <div className={classes.column}>
          <Typography variant="h6" component="h3" className={classes.columnTitle}>
            {texts.qr_code_for_print_title}
          </Typography>
          <Typography variant="body2" className={classes.qrDescription}>
            {texts.qr_code_for_print_description}
          </Typography>
          <div className={classes.qrCodeContainer}>
            <QrCodeDownload
              url={contentLink}
              fileName={`climateconnect-${url_slug}-qr.png`}
              downloadButtonText={texts.download_qr_code}
              altText={texts.qr_code_alt_text}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
