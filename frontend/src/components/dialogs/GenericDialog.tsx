import {
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import React, { PropsWithChildren } from "react";
import theme from "../../themes/theme";

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
    marginLeft: theme.spacing(-1),
    color: theme.palette.grey[500],
  },
  closeButtonRight: {
    color: theme.palette.grey[500],
  },
  titleText: (props) => ({
    marginLeft: props.closeButtonRightSide ? theme.spacing(-1) : theme.spacing(1),
    marginRight: props.closeButtonRightSide ? theme.spacing(5) : theme.spacing(2),
    fontSize: 20,
    color: theme.palette.text.primary,
  }),
  dialogTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  saveIconButton: {
    background: theme.palette.primary.main,
    color: "white",
  },
  buttomBtnContainer: {
    textAlign: "center",
    marginBottom: theme.spacing(2),
  },
}));

type Props = PropsWithChildren<{
  applyText?: string;
  fullScreen?: boolean;
  maxWidth?: "sm" | "lg";
  onApply?: () => void;
  // eslint-disable-next-line no-unused-vars
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
  applyIcon?: any;
  closeButtonRightStyle?: string;
  showApplyAtBottom?: boolean;
  buttonAsLink?: string;
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
  applyIcon,
  closeButtonRightStyle,
  showApplyAtBottom,
  buttonAsLink,
}: Props) {
  const classes = useStyles({
    useApplyButton,
    fullScreen,
    closeButtonRightSide,
  });

  const isSmallScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));

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
      <DialogTitle className={classes.dialogTitle}>
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
        {useApplyButton && applyText && !showApplyAtBottom && (
          <>
            {applyIcon && isSmallScreen ? (
              <IconButton onClick={onApply} className={classes.saveIconButton} size="large">
                <applyIcon.icon />
              </IconButton>
            ) : (
              <Button
                variant="contained"
                color="primary"
                className={classes.applyButton}
                onClick={onApply}
              >
                {applyText}
              </Button>
            )}
          </>
        )}
        {onClose && closeButtonRightSide && (
          <IconButton
            aria-label="close"
            className={`classes.closeButtonRight ${closeButtonRightStyle}`}
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
        {useApplyButton && applyText && showApplyAtBottom && (
          <div className={classes.buttomBtnContainer}>
            {applyIcon && isSmallScreen ? (
              <IconButton className={classes.saveIconButton} size="large">
                <applyIcon.icon />
              </IconButton>
            ) : buttonAsLink ? (
              <Button
                variant="contained"
                color="primary"
                className={classes.applyButton}
                component="a"
                href={buttonAsLink}
              >
                {applyText}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                className={classes.applyButton}
                onClick={onApply}
              >
                {applyText}
              </Button>
            )}
          </div>
        )}
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
