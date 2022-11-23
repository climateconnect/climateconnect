import React, { useContext, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../../../src/components/context/UserContext";
import { Button, IconButton } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import SearchIcon from "@material-ui/icons/Search";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

const useStyles = makeStyles((theme) => {
  return {
    searchChatButton: {
      marginBottom: theme.spacing(1),
      [theme.breakpoints.down("md")]: {
        marginLeft: theme.spacing(1),
      },
    },
    newChatButton: {
      marginBottom: theme.spacing(1),
      marginRight: theme.spacing(1),
      [theme.breakpoints.down("md")]: {
        marginLeft: theme.spacing(1),
      },
    },
    toggleMoreFiltersButton: {
      height: 42,
      width: 42,
    },
    extraFilterButtonContainer: {
      display: "flex",
      flexDirection: "column",
    },
  };
});

export default function InboxControlButtons({
  enableChatSearch,
  enableLocationSearch,
  enableUserSearch,
  toggleShowChatsByNeedToReply,
}) {
  const classes = useStyles();
  const { locale, user } = useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const handleToggleMoreFilters = () => {
    setShowMoreFilters(!showMoreFilters);
  };

  return (
    <>
      <div>
        <Button
          className={classes.newChatButton}
          startIcon={<AddIcon />}
          variant="contained"
          color="primary"
          onClick={enableUserSearch}
        >
          {texts.new_chat}
        </Button>
        <Button
          className={classes.searchChatButton}
          startIcon={<SearchIcon />}
          variant="contained"
          color="primary"
          onClick={enableChatSearch}
        >
          {texts.find_a_chat}
        </Button>
      </div>
      {true && ( //  TODO  change to check if super user
        <>
          <IconButton className={classes.toggleMoreFiltersButton} onClick={handleToggleMoreFilters}>
            {showMoreFilters ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
          {showMoreFilters && (
            <div className={classes.extraFilterButtonContainer}>
              <Button
                className={classes.newChatButton}
                startIcon={<SearchIcon />}
                variant="contained"
                color="primary"
                onClick={enableLocationSearch}
              >
                {texts.find_a_chat} {texts.via_location}
              </Button>
              <Button
                className={classes.newChatButton}
                startIcon={<SearchIcon />}
                variant="contained"
                color="primary"
                onClick={toggleShowChatsByNeedToReply}
              >
                {texts.filter_by_need_to_reply}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
