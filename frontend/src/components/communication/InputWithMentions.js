import { makeStyles } from "@material-ui/core";
import React, { useContext, useRef } from "react";
import { Mention, MentionsInput } from "react-mentions";
import { apiRequest } from "../../../public/lib/apiOperations";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  InputWithMentionsBox: {
    fontSize: 16,
    width: "100%",
    borderBottom: `1px solid rgba(0, 0, 0, 0.87)`,
    marginLeft: theme.spacing(3),
    "&:hover": {
      borderBottom: "2px solid black",
      marginBottom: -1,
    },
    "&:focus-within": {
      borderBottom: `2px solid ${theme.palette.primary.main}`,
      marginBottom: -1,
    },
  },
  messageInput: {
    flexGrow: 1,
    display: "block",
    paddingTop: 3,
    paddingBottom: 7,
    "& textarea": {
      border: 0,
      overflow: "auto",
      outline: "none",
      fontSize: 16,
    },
    "& li": {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      "&:hover": {
        background: theme.palette.grey[50],
      },
    },
  },
}));

export default function InputWithMentions({ baseUrl, value, onChange, placeholder, onKeyDown }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const mentionsInputRef = useRef(null);

  //TODO: This function might have to be throttled in the future
  function lookupUsers(searchValue, callback) {
    if (!searchValue) return;
    apiRequest({
      method: "get",
      url: (baseUrl + searchValue).replace(process.env.API_URL, ""),
      locale: locale,
    })
      .then((response) => {
        console.log(response.data.results);
        return response.data.results.map((user) => ({
          display: user.first_name + " " + user.last_name,
          id: user.url_slug,
        }));
      })
      .then(callback);
  }

  return (
    <>
      <div className={classes.InputWithMentionsBox}>
        <MentionsInput
          value={value}
          ref={mentionsInputRef}
          className={classes.messageInput}
          onChange={onChange}
          placeholder={placeholder}
          a11ySuggestionsListLabel={"Suggested users for mention"}
          allowSpaceInQuery
          onKeyDown={onKeyDown}
        >
          <Mention
            displayTransform={(login) => `@${login}`}
            trigger="@"
            markup={`@@@____id__^^____display__@@@^^^`}
            data={lookupUsers}
            allowSpaceInQuery
          />
        </MentionsInput>
      </div>
    </>
  );
}
