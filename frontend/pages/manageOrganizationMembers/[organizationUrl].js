import Layout from "../../src/components/layouts/layout";
import React from "react";
import tokenConfig from "../../public/config/tokenConfig";
import axios from "axios";
import { useContext } from "react";
import Cookies from "next-cookies";
import UserContext from "../../src/components/context/UserContext";
import WideLayout from "../../src/components/layouts/WideLayout";
import LoginNudge from "../../src/components/general/LoginNudge";
import { Typography, Button, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MiniProfileInput from "../../src/components/profile/MiniProfileInput";
import AutoCompleteSearchBar from "../../src/components/general/AutoCompleteSearchBar";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";

const useStyles = makeStyles(theme => {
  return {
    memberContainer: {
      display: "flex",
      flexWrap: "wrap",
      marginBottom: theme.spacing(2)
    },
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(4)
    },
    member: {
      width: theme.spacing(40),
      textAlign: "center",
      marginRight: theme.spacing(4),
      marginTop: theme.spacing(2)
    },
    buttons: {
      float: "right"
    },
    button: {
      marginRight: theme.spacing(2)
    },
    buttonsContainer: {
      height: 40,
      width: "100%"
    },
    searchBarContainer: {
      marginTop: theme.spacing(4),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexGrow: 100
    },
    searchBar: {
      width: 800,
      display: "flex"
    },
    block: {
      marginBottom: theme.spacing(4)
    }
  };
});

export default function manageOrganizationMembers({
  organization,
  members,
  availabilityOptions,
  rolesOptions
}) {
  const { user } = useContext(UserContext);
  const classes = useStyles();
  const [currentMembers, setCurrentMembers] = React.useState([...members.sort((a,b)=>b.role.role_type-a.role.role_type)])

  if (!user)
    return (
      <WideLayout title="Please log in to create an organization" hideHeadline={true}>
        <LoginNudge fullPage whatToDo="create an organization" />
      </WideLayout>
    );
  else if (!members.find(m => m.id === user.id))
    return (
      <WideLayout title="Please log in to create an organization" hideHeadline={true}>
        <Typography variant="h4" color="primary" className={classes.headline}>
          You are not a member of this organization. Go to{" "}
          <a href={"/organizations/" + organization.url_slug}>the organization page</a> and click
          join to join it.
        </Typography>
      </WideLayout>
    );
  else if (
    members.find(m => m.id === user.id).role.name != "Creator" &&
    members.find(m => m.id === user.id).role.name != "Administrator"
  )
    return (
      <WideLayout title="Please log in to create an organization" hideHeadline={true}>
        <Typography variant="h4" color="primary" className={classes.headline}>
          You need to be an administrator to manage organization members.
        </Typography>
      </WideLayout>
    );
  else{
    const handleChangeMember = m => {
      setCurrentMembers([
        ...currentMembers.map(c =>{
          if(c.url_slug === m.url_slug) return m
          else return c
        })
      ])
    }
    const user_role = members.find(m => m.id === user.id).role

    const handleRemoveMember = (member) => {
      setCurrentMembers([...currentMembers.filter(m=>m.id !== member.id)])
    }

    const handleAddMember = (member) => {
      setCurrentMembers([
        ...currentMembers,
        {...member, role: rolesOptions.find(r => r.name === "Member"), role_in_organization: ""}
      ])
    }
    
    const canEdit = (member) => {
      return (member.id === user.id) || (user_role.role_type > member.role.role_type)
    }

    const renderSearchOption = option => {
      return (
        <React.Fragment>
          <IconButton>
            <AddCircleOutlineIcon />
          </IconButton>
          {option.first_name + " " + option.last_name}
        </React.Fragment>
      );
    };

    const onSubmit = event => {
      console.log(currentMembers)
      event.preventDefault()
    }
    
    return (
      <Layout title="Manage organization's members" hideHeadline>
        <Typography variant="h4" color="primary" className={classes.headline}>
          Manage members of {organization.name}
        </Typography>
        <div className={classes.searchBarContainer}>
          <AutoCompleteSearchBar
            label="Search for your organization's members"
            className={`${classes.searchBar} ${classes.block}`}
            baseUrl={process.env.API_URL + "/api/members/?search="}
            clearOnSelect
            freeSolo
            filterOut={[...currentMembers]}
            onSelect={handleAddMember}
            renderOption={renderSearchOption}
            getOptionLabel={option => option.first_name + " " + option.last_name}
            helperText="Type the name of the team member you want to add next."
          />
        </div>
        <form onSubmit={onSubmit}>
          <div className={classes.memberContainer}>
            {currentMembers && currentMembers.length>0 && currentMembers.map((m, index) => (
              <MiniProfileInput
                key={index}
                className={classes.member}
                profile={m}
                onDelete={canEdit(m) ? () => handleRemoveMember(m) : null}
                availabilityOptions={availabilityOptions}
                rolesOptions={rolesOptions}
                onChange={handleChangeMember}
                hideHoursPerWeek
                editDisabled={!canEdit(m)}
              />
            ))}
          </div>
          <div className={classes.buttonsContainer}>
            <div className={classes.buttons}>
              <Button className={classes.button} href={"/organizations/"+organization.url_slug} variant="contained" color="secondary">Cancel</Button>
              <Button className={classes.button} variant="contained" color="primary" type="submit">Save</Button>
            </div>
          </div>
        </form>
      </Layout>
    );
  }
}

manageOrganizationMembers.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  const organizationUrl = encodeURI(ctx.query.organizationUrl);
  return {
    organization: await getOrganizationByUrlIfExists(organizationUrl, token),
    members: await getMembersByOrganization(organizationUrl, token),
    rolesOptions: await getRolesOptions(token),
    availabilityOptions: await getAvailabilityOptions(token)
  };
};

async function getOrganizationByUrlIfExists(organizationUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/organizations/" + organizationUrl + "/",
      tokenConfig(token)
    );
    return parseOrganization(resp.data);
  } catch (err) {
    //console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getMembersByOrganization(organizationUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/organizations/" + organizationUrl + "/members/",
      tokenConfig(token)
    );
    if (!resp.data) return null;
    else {
      return parseOrganizationMembers(resp.data.results);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

function parseOrganizationMembers(members) {
  return members.map(m => {
    const member = m.user;
    return {
      ...member,
      image: process.env.API_URL+member.image,
      name: member.first_name + " " + member.last_name,
      role: m.permission,
      time_per_week: m.time_per_week,
      role_in_organization: m.role_in_organization,
      location: member.city ? member.city + ", " + member.country : member.country,
      isCreator: m.permission.role_type === 2
    };
  })
}

function parseOrganization(organization) {
  return {
    url_slug: organization.url_slug,
    background_image: organization.background_image,
    name: organization.name,
    image: organization.image,
    types: organization.types.map(t => ({ ...t.organization_tag, key: t.organization_tag.id })),
    info: {
      location: organization.city
        ? organization.city + ", " + organization.country
        : organization.country,
      shortdescription: organization.short_description,
      school: organization.school,
      organ: organization.organ,
      parent_organization: organization.parent_organization
    }
  };
}

const getRolesOptions = async token => {
  try {
    const resp = await axios.get(process.env.API_URL + "/roles/", tokenConfig(token));
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};

const getAvailabilityOptions = async token => {
  try {
    const resp = await axios.get(process.env.API_URL + "/availability/", tokenConfig(token));
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};
