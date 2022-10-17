import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { createSocialMediaIconButton } from "../../../public/lib/socialMediaOperations";
import { Container, Chip, Tooltip } from "@material-ui/core";
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import SocialMediaButton from "../general/SocialMediaButton";

const useStyles = makeStyles((theme) => ({
  socialMediaChip: {
    marginRight: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
  },
  noPadding: {
    padding: 0,
  },
}));

export default function SocialMediaChips({
  socials,
  handleDialogClickOpen,
  handleDeleteSocialMedia,
  maxNumOfSocials,
  isCreationStep,
}) {
  const classes = useStyles();
  return (
    <>
      <Container className={classes.noPadding}>
        {(socials.value.length < maxNumOfSocials || isCreationStep) && (
          <div>
            <Chip
              label={socials.name}
              className={classes.socialMediaChip}
              color={socials.value && socials.value.length ? "default" : "primary"}
              icon={<ControlPointIcon />}
              onClick={() => handleDialogClickOpen("addSocialMediaDialog")}
            />
          </div>
        )}

        {socials.value && (
          <>
            {socials.value.map((option, index) => (
              <Tooltip key={index} arrow title={option.url} placement="top">
                <Chip
                  label={option.social_media_channel.social_media_name}
                  key={index}
                  className={classes.socialMediaChip}
                  onDelete={() =>
                    handleDeleteSocialMedia(option.social_media_channel.social_media_name)
                  }
                  icon={
                    <SocialMediaButton
                      socialMediaIcon={createSocialMediaIconButton(option)}
                      isEditPage
                    />
                  }
                />
              </Tooltip>
            ))}
          </>
        )}
      </Container>
    </>
  );
}
