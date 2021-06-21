import React, { useContext } from "react";
import { Mention, MentionsInput } from "react-mentions";
import { apiRequest } from "../../../public/lib/apiOperations";
import UserContext from "../context/UserContext";

export default function InputWithMentions({
  baseUrl,
  value,
  data,
  onChange,
  placeholder,
  className,
}) {
  const { locale } = useContext(UserContext);

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
    <MentionsInput
      value={value}
      className={className}
      onChange={onChange}
      placeholder={placeholder}
      a11ySuggestionsListLabel={"Suggested users for mention"}
    >
      <Mention
        displayTransform={(login) => `@${login}`}
        trigger="@"
        markup={`@@@____id__^^____display__@@@^^^`}
        data={lookupUsers}
      />
    </MentionsInput>
  );
}
