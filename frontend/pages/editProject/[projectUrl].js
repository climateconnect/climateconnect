import { Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import Cookies from "next-cookies";
import React, { useContext } from "react";
import tokenConfig from "../../public/config/tokenConfig";
import { getLocalePrefix, sendToLogin } from "../../public/lib/apiOperations";
import {
  getProjectTagsOptions,
  getSkillsOptions,
  getStatusOptions,
} from "../../public/lib/getOptions";
import { getImageUrl } from "../../public/lib/imageOperations";
import getTexts from "../../public/texts/texts";
import UserContext from "../../src/components/context/UserContext";
import EditProjectRoot from "../../src/components/editProject/EditProjectRoot";
import LoginNudge from "../../src/components/general/LoginNudge";
import Layout from "../../src/components/layouts/layout";
import WideLayout from "../../src/components/layouts/WideLayout";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
  },
  errorTitle: {
    textAlign: "center",
    marginTop: theme.spacing(8),
  },
}));

export async function getServerSideProps(ctx) {
  const { token } = Cookies(ctx);
  const texts = getTexts({ page: "project", locale: ctx.locale });
  if (ctx.req && !token) {
    const message = texts.please_log_in_to_edit_project;
    return sendToLogin(ctx, message, ctx.locale, ctx.resolvedUrl);
  }
  const projectUrl = encodeURI(ctx.query.projectUrl);
  const [
    project,
    members,
    skillsOptions,
    userOrganizations,
    statusOptions,
    tagsOptions,
  ] = await Promise.all([
    getProjectByIdIfExists(projectUrl, token),
    getMembersByProject(projectUrl, token),
    getSkillsOptions(),
    getUserOrganizations(token),
    getStatusOptions(),
    getProjectTagsOptions(),
  ]);
  return {
    props: {
      project: project,
      members: members,
      skillsOptions: skillsOptions,
      userOrganizations: userOrganizations,
      statusOptions: statusOptions,
      tagsOptions: tagsOptions,
      token: token,
    },
  };
}

export default function EditProjectPage({
  project,
  members,
  skillsOptions,
  userOrganizations,
  statusOptions,
  tagsOptions,
  token,
}) {
  const classes = useStyles();
  const [curProject, setCurProject] = React.useState({
    ...project,
    status: statusOptions.find((s) => s.name === project.status),
  });
  project = {
    ...project,
    status: statusOptions.find((s) => s.name === project.status),
  };
  const [errorMessage, setErrorMessage] = React.useState("");
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });

  const handleSetErrorMessage = (newErrorMessage) => {
    setErrorMessage(newErrorMessage);
  };
  const handleSetProject = (newProject) => {
    setCurProject({ ...newProject });
  };

  if (!user)
    return (
      <WideLayout title={texts.please_log_in_to_edit_project} hideHeadline={true}>
        <LoginNudge fullPage whatToDo={texts.to_edit_this_project} />
      </WideLayout>
    );
  else if (!project)
    return (
      <Layout className={classes.root} title={texts.project_not_found}>
        <Typography className={classes.errorTitle} variant="h3">
          {texts.project_does_not_exist}{" "}
          <Link href={getLocalePrefix(locale) + "/share"}>{texts.click_here}</Link>{" "}
          {texts.to_create_a_project}
        </Typography>
      </Layout>
    );
  else if (!members.find((m) => m.user && m.user.id === user.id))
    return (
      <WideLayout title={texts.not_a_member} hideHeadline={true}>
        <Typography variant="h4" color="primary" className={classes.errorTitle}>
          {texts.not_a_member}. {texts.go_to_the}{" "}
          <a href={getLocalePrefix(locale) + "/projects/" + project.url_slug}>
            {texts.project_page}
          </a>{" "}
          {texts.and_ask_to_be_part_of_the_team}
        </Typography>
      </WideLayout>
    );
  else if (
    members.find((m) => m.user && m.user.id === user.id).role.name != "Creator" &&
    members.find((m) => m.user && m.user.id === user.id).role.name != "Administrator"
  )
    return (
      <WideLayout title={texts.no_permissions_to_edit_project} hideHeadline={true}>
        <Typography variant="h4" color="primary" className={classes.errorTitle}>
          {texts.need_to_be_admin_to_manage_project_team}
        </Typography>
      </WideLayout>
    );
  else {
    const user_role = members.find((m) => m.user && m.user.id === user.id).role;
    return (
      <WideLayout
        className={classes.root}
        title={texts.edit_project + " " + project.name}
        hideHeadline
        message={errorMessage}
        messageType={errorMessage && "error"}
      >
        <EditProjectRoot
          oldProject={project}
          project={curProject}
          skillsOptions={skillsOptions}
          userOrganizations={userOrganizations}
          statusOptions={statusOptions}
          handleSetProject={handleSetProject}
          tagsOptions={tagsOptions}
          token={token}
          user={user}
          user_role={user_role}
          handleSetErrorMessage={handleSetErrorMessage}
        />
      </WideLayout>
    );
  }
}

async function getProjectByIdIfExists(projectUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/projects/" + projectUrl + "/?edit_view=true",
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
      return parseProject(resp.data);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

const parseProject = (project) => ({
  ...project,
  image: getImageUrl(project.image),
  tags: project.tags.map((t) => t.project_tag),
  project_parents: project.project_parents[0],
  is_personal_project: !project.project_parents[0].parent_organization,
  skills: project.skills.map((s) => ({ ...s, key: s.id })),
});

const getUserOrganizations = async (token) => {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/my_organizations/",
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
      return resp.data.map((o) => o.organization);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};

async function getMembersByProject(projectUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/projects/" + projectUrl + "/members/",
      tokenConfig(token)
    );
    if (!resp.data) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}
