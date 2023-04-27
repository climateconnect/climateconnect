import { Button, Dialog, DialogTitle, IconButton, Theme, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import React, { PropsWithChildren } from "react";

const useStyles = makeStyles<
  Theme,
  { fullScreen?: boolean; useApplyButton?: boolean; closeButtonRightSide?: boolean }
>((theme) => ({
  dialog: (props) => ({
    [theme.breakpoints.up("sm")]: {
      padding: props.fullScreen ? 0 : theme.spacing(8),
    },
  }),
  noScrollDialog: {
    overflow: "hidden",
  },
  dialogContent: (props) => ({
    padding: theme.spacing(2),
    height: props.fullScreen ? "100%" : "auto",
    [theme.breakpoints.down("lg")]: {
      padding: theme.spacing(2),
      paddingTop: 0,
    },
  }),
  scrollDialogContent: {
    height: "auto",
    overflow: "auto",
  },
  closeButtonLeft: {
    position: "absolute",
    left: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  closeButtonRight: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  titleText: (props) => ({
    marginLeft: props.closeButtonRightSide ? theme.spacing(-1) : theme.spacing(5),
    marginRight: props.closeButtonRightSide ? theme.spacing(5) : theme.spacing(0),
    paddingRight: props.useApplyButton ? 150 : 0,
    fontSize: 20,
  }),
  applyButton: {
    position: "absolute",
    right: theme.spacing(2),
    top: theme.spacing(1.5),
  },
}));

type Props = PropsWithChildren<{
  applyText?: string;
  fullScreen?: boolean;
  maxWidth?: "sm" | "lg";
  onApply?: () => void;
  onClose: (arg: false | React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  open: boolean;
  title: string;
  topBarFixed?: boolean;
  useApplyButton?: boolean;
  paperClassName?: string;
  closeButtonRightSide?: boolean;
  closeButtonSmall?: boolean;
  titleTextClassName?: string;
  dialogContentClass?: string;
}>;
/**
 * Simple base wrapper on top of the Material UI (MUI)
 * core Dialog component. This component
 * should only be used by other "*Dialog" components, like
 * "ProjectRequestersDialog".
 */
export default function GenericDialog({
  applyText,
  children,
  fullScreen,
  maxWidth,
  onApply,
  onClose,
  open,
  title,
  topBarFixed,
  useApplyButton,
  paperClassName,
  closeButtonRightSide,
  closeButtonSmall,
  titleTextClassName,
  dialogContentClass,
}: Props) {
  const classes = useStyles({
    useApplyButton,
    fullScreen,
    closeButtonRightSide,
  });

  const handleCancel = () => {
    onClose(false);
  };

  return (
    <Dialog
      className={`${classes.dialog} ${topBarFixed && classes.noScrollDialog}`}
      onClose={handleCancel}
      open={open}
      maxWidth={maxWidth ? maxWidth : "md"}
      fullScreen={fullScreen}
      classes={{
        paper: paperClassName,
      }}
    >
      <DialogTitle>
        {onClose && !closeButtonRightSide && (
          <IconButton
            aria-label="close"
            className={classes.closeButtonLeft}
            onClick={onClose}
            size={closeButtonSmall ? "small" : undefined}
          >
            <CloseIcon />
          </IconButton>
        )}
        <Typography component="h2" className={`${titleTextClassName} ${classes.titleText}`}>
          {title}
        </Typography>
        {useApplyButton && applyText && (
          <Button
            variant="contained"
            color="primary"
            className={classes.applyButton}
            onClick={onApply}
          >
            {applyText}
          </Button>
        )}
        {onClose && closeButtonRightSide && (
          <IconButton
            aria-label="close"
            className={classes.closeButtonRight}
            onClick={onClose}
            size={closeButtonSmall ? "small" : undefined}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <div
        className={`${classes.dialogContent} ${
          topBarFixed && classes.scrollDialogContent
        } ${dialogContentClass}`}
      >
        {children}
      </div>
    </Dialog>
  );
}

GenericDialog.propTypes = {
  applyText: PropTypes.string,
  onApply: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  useApplyButton: PropTypes.bool,
};
