import { IconButton, makeStyles, Chip } from "@material-ui/core";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import React, { useContext } from "react";
import { getLocationFields } from "../../../public/lib/locationOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import Form from "./../general/Form";

const renderSearchOption = (option) => {
  return (
    <React.Fragment>
      <IconButton>
        <AddCircleOutlineIcon />
      </IconButton>
      {option.name}
    </React.Fragment>
  );
};

const useStyles = makeStyles((theme) => ({
  selectedTypes: {
    marginTop: theme.spacing(1),
    display: "flex",
    justifyContent: "space-evenly",

    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      marginTop: theme.spacing(0),
      alignItems: "center",
    },
  },
  chip: {
    height: 30,
    width: 200,

    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(1),
    },
  },
}));

export default function EnterBasicOrganizationInfo({
  errorMessage,
  handleSubmit,
  organizationInfo,
  locationInputRef,
  locationOptionsOpen,
  handleSetLocationOptionsOpen,
  tagOptions,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "organization", locale: locale });
  const [parentOrganization, setParentOrganization] = React.useState(null);
  const [selectedTypes, setSelectedTypes] = React.useState([]);

  const handleChangeTypes = (newValue) => {
    setSelectedTypes(newValue);
  };
  const handleRemoveType = (item) => {
    setSelectedTypes(selectedTypes.filter((value) => value !== item));
  };
  const onUnselect = () => {
    if (parentOrganization) setParentOrganization(null);
  };
  const getOptionLabel = (option) => option.name;
  const fields = [
    {
      required: true,
      label: texts.organization_name,
      key: "organizationname",
      type: "text",
      value: organizationInfo["name"],
    },
    {
      label: texts.we_are_a_sub_organization_of_a_larger_organization,
      key: "hasparentorganization",
      type: "checkbox",
      checked: false,
      value: organizationInfo["hasparentorganization"],
    },
    {
      required: true,
      label: texts.parent_organization_name,
      key: "parentorganizationname",
      type: "autocomplete",
      autoCompleteProps: {
        label: texts.search_for_your_parent_organization,
        baseUrl: process.env.API_URL + "/api/organizations/?search=",
        onSelect: setParentOrganization,
        renderOption: renderSearchOption,
        getOptionLabel: getOptionLabel,
        helperText: texts.type_the_name_of_your_parent_organization,
        onUnselect: onUnselect,
        filterOut: [],
      },
      onlyShowIfChecked: "hasparentorganization",
      value: organizationInfo["parentorganizationname"],
    },
    ...getLocationFields({
      locationInputRef: locationInputRef,
      locationOptionsOpen: locationOptionsOpen,
      handleSetLocationOptionsOpen: handleSetLocationOptionsOpen,
      values: organizationInfo,
      locationKey: "location",
      texts: texts,
    }),
    {
      required: true,
      label: texts.add_up_to_two_types,
      multiselect: {
        values: tagOptions,
      },
      selectedValues: selectedTypes,
      multiSelectProps: {
        onChange: handleChangeTypes,
        renderValue: "",
      },

      multiple: true,
      key: "orgtypes",
      bottomLink: (
        <div className={classes.selectedTypes}>
          {selectedTypes.map((selectedType, index) => (
            <Chip
              className={classes.chip}
              label={selectedType}
              onDelete={() => handleRemoveType(selectedType)}
              key={index}
            />
          ))}
        </div>
      ),
    },
    {
      required: true,
      label: texts.i_verify_that_i_am_an_authorized_representative_of_this_organization,
      key: "verified",
      type: "checkbox",
      value: organizationInfo["verified"],
    },
  ];

  const messages = {
    submitMessage: texts.next_step,
  };

  return (
    <Form
      fields={fields}
      messages={messages}
      usePercentage={false}
      onSubmit={(event, account) =>
        handleSubmit(event, {
          ...account,
          parentOrganization: parentOrganization,
          orgtypes: convertTypeNamesToInt(selectedTypes, tagOptions),
        })
      }
      errorMessage={errorMessage}
    />
  );
}

function convertTypeNamesToInt(selectedTypesArr, types) {
  const intersectingTypes = types.filter((type) => selectedTypesArr.includes(type.name));
  const convertedList = intersectingTypes.map((type) => type.id);
  return convertedList;
}
