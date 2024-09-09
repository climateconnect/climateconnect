import { Avatar, Button, Container, Link, TextField, Chip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useState } from "react";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import GenericDialog from "./GenericDialog";
import ProfileBadge from "../profile/ProfileBadge";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
const useStyles = makeStyles((theme) => ({
  dialogButton: {
    marginTop: theme.spacing(3),
  },
  dialogButtonContainer: {
    display: "flex",
    justifyContent: "center",
  },

  dialogTitle: {
    color: "#207178",
  },
  adminAvatar: {
    height: 20,
    width: 20,
    display: "inline-block",
    textAlign: "center",
    verticalAlign: "middle",
  },
  chip: {
    // backgroundColor: "#c4c2c2",
    borderRadius: "20px",
    margin: theme.spacing(0.5),
  },
}));

export default function ProjectJoinDialog({
  open,
  onClose,
  user,
  projectAdmin,
  handleSendProjectJoinRequest,
  url,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const [description, setDescription] = useState("");

  const [selectedChip, setSelectedChip] = useState(null);
  const [showTextbox, setShowTextbox] = useState(false);
  const chips = [
    { id: 1, label: texts.already_part_of_this_project, requiresTextbox: false },
    { id: 2, label: texts.get_active_to_project, requiresTextbox: true },
  ]
  const disableSubmit = !selectedChip || (showTextbox && !description);

  const handleClose = () => {
    onClose();
  };

  const avatarProps = {
    className: classes.adminAvatar,
    src: getImageUrl(projectAdmin?.image),
    alt: projectAdmin?.name,
  };

  const onDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSelectAnswer = (chipId) => {
    const clickedChip = chips.find((chip) => chip.id === chipId);
    if(clickedChip){
      setSelectedChip(chipId);
      setShowTextbox(clickedChip.requiresTextbox || false);
    }
  };

  return (
    <GenericDialog
      maxWidth="sm"
      open={open}
      onClose={handleClose}
      title={texts.thrilled_to_join_the_project + "!"}
      titleTextClassName={classes.dialogTitle}
    >
      <>
        {!user && (
          <>
            <Typography>
              {texts.please_log_in + " " + texts.to_send_this_project_join_request + "!"}
            </Typography>
            <Container className={classes.dialogButtonContainer}>
              <Button
                className={classes.dialogButton}
                variant="contained"
                color="primary"
                href={getLocalePrefix(locale) + "/signin?redirect=" + encodeURIComponent(url)}
              >
                {texts.log_in}
              </Button>
            </Container>
          </>
        )}
        {user && (
          <>
            <Typography>
              {texts.please_share_with + " "}
              <Link href={"/profiles/" + projectAdmin.url_slug} underline="hover">
                {projectAdmin?.badges?.length > 0 ? (
                  <ProfileBadge badge={projectAdmin?.badges[0]} size="medium">
                    <Avatar {...avatarProps} />
                  </ProfileBadge>
                ) : (
                  <Avatar {...avatarProps} />
                )}
                {" [" + projectAdmin.name + "] "}
              </Link>
              {texts.project_admin + ", " + texts.what_inspires_you_to_be_part_of_this_team + "!"}
            </Typography>
            {chips.map((data) => {
              return (
                <Chip
                  key={data.id}
                  label={data.label}
                  clickable={true}
                  onClick={() => handleSelectAnswer(data.id)}
                  size="small"
                  className={classes.chip}
                  style={{
                    backgroundColor: selectedChip === data.id ? '#207178' : '#e0e0e0',
                    color: selectedChip === data.id ? '#fff' : '#000',
                  }}
                />
              );
            })}
            {showTextbox && (
              <TextField
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                onChange={(event) => onDescriptionChange(event)}
                placeholder={texts.explain_your_reason_for_joining_the_project}
                value={description}
              />
            )}
            <Container className={classes.dialogButtonContainer}>
              <Button
                className={classes.dialogButton}
                variant="contained"
                color="primary"
                href={"#"}
                onClick={() => handleSendProjectJoinRequest(description)}
                disabled = {disableSubmit}
              >
                {texts.send_request}
              </Button>
            </Container>
          </>
        )}
      </>
    </GenericDialog>
  );
}
