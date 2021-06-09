import React, { useContext } from "react";
import { Mention, MentionsInput } from "react-mentions";
import { apiRequest } from "../../../public/lib/apiOperations";
import UserContext from "../context/UserContext";

export default function UserMentionableMessageInput({
  baseUrl,
  value,
  data,
  onChange,
  placeholder,
}) {
  const { locale } = useContext(UserContext);

  function lookupUsers(searchValue, callback) {
    if (!searchValue) return;
    apiRequest({
      method: "get",
      url: (baseUrl + searchValue).replace(process.env.API_URL, ""),
      locale: locale,
    })
      .then((response) =>
        response.data.results.map((user) => ({
          display: user.first_name + " " + user.last_name,
          id: user.first_name + " " + user.last_name,
        }))
      )
      .then(callback);
  }

  return (
    <MentionsInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      a11ySuggestionsListLabel={"Suggested users for mention"}
    >
      <Mention displayTransform={(login) => `@${login}`} trigger="@" data={lookupUsers} />
    </MentionsInput>
  );
}
