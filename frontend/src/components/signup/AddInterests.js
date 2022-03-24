import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getLocationFields } from "../../../public/lib/locationOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import Form from "./../general/Form";

const useStyles = makeStyles(() => {
  return {
    checkboxLabels: {
      fontSize: 14,
    },
  };
});

export default function AddInterests({
  handleSubmit,
  errorMessage,
  values,
  handleGoBack,
  locationInputRef,
  locationOptionsOpen,
  handleSetLocationOptionsOpen,
}) {
  return (
    <ActiveHubsSelect
      info={i}
      hubsToSelectFrom={allHubs.filter(
        (h) =>
          editedAccount?.info?.hubs.filter((addedHub) => addedHub.url_slug === h.url_slug)
            .length === 0
      )}
      onClickRemoveHub={onClickRemoveHub}
      selectedHubs={editedAccount.info.hubs}
      onSelectNewHub={onSelectNewHub}
    />
  );
}
