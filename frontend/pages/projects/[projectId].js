import NextCookies from "next-cookies";
import React, { useContext, useEffect } from "react";
import Cookies from "universal-cookie";
import ROLE_TYPES from "../../public/data/role_types";
import { apiRequest } from "../../public/lib/apiOperations";
import { nullifyUndefinedValues } from "../../public/lib/profileOperations";
import getTexts from "../../public/texts/texts";
import UserContext from "../../src/components/context/UserContext";
import PageNotFound from "../../src/components/general/PageNotFound";
import WideLayout from "../../src/components/layouts/WideLayout";
import ProjectPageRoot from "../../src/components/project/ProjectPageRoot";

const parseComments = (comments) => {
  return comments
    .filter((c) => {
      return !c.parent_comment_id;
    })
    .map((c) => {
      return {
        ...c,
        replies: comments
          .filter((r) => r.parent_comment_id === c.id)
          .sort((a, b) => {
            return new Date(a.created_at) - new Date(b.created_at);
          }),
      };
    });
};

export async function getServerSideProps(ctx) {
  const { token } = NextCookies(ctx);
  const projectUrl = encodeURI(ctx.query.projectId);
  const [project, members, posts, comments, following] = await Promise.all([
    getProjectByIdIfExists(projectUrl, token, ctx.locale),
    getProjectMembersByIdIfExists(projectUrl, ctx.locale),
    getPostsByProject(projectUrl, token, ctx.locale),
    getCommentsByProject(projectUrl, token, ctx.locale),
    token ? getIsUserFollowing(projectUrl, token, ctx.locale) : false,
  ]);
  return {
    props: nullifyUndefinedValues({
      project: project,
      members: members,
      posts: posts,
      comments: comments,
      following: following,
    }),
  };
}

export default function ProjectPage({ project, members, posts, comments, following }) {
  const token = new Cookies().get("token");
  const [curComments, setCurComments] = React.useState(parseComments(comments));
  const [message, setMessage] = React.useState({});
  const [isUserFollowing, setIsUserFollowing] = React.useState(following);
  const [followingChangePending, setFollowingChangePending] = React.useState(false);
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, project: project });

  const handleWindowClose = (e) => {
    if (curComments.filter((c) => c.unconfirmed).length > 0 || followingChangePending) {
      e.preventDefault();
      return (e.returnValue = texts.changes_might_not_be_saved);
    }
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleWindowClose);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  });

  return (
    <WideLayout
      description={project?.short_description}
      message={message?.message}
      messageType={message?.messageType}
      title={project ? project.name : texts.project + " " + texts.not_found}
    >
      {project ? (
        <ProjectPageRoot
          project={{ ...project, team: members, timeline_posts: posts, comments: curComments }}
          token={token}
          setMessage={setMessage}
          isUserFollowing={isUserFollowing}
          setIsUserFollowing={setIsUserFollowing}
          user={user}
          setCurComments={setCurComments}
          followingChangePending={followingChangePending}
          setFollowingChangePending={setFollowingChangePending}
          texts={texts}
          projectAdmin={members.find((m) => m.permission === ROLE_TYPES.all_type)}
        />
      ) : (
        <PageNotFound itemName={texts.project} />
      )}
    </WideLayout>
  );
}

async function getProjectByIdIfExists(projectUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + projectUrl + "/",
      token: token,
      locale: locale,
    });
    if (resp.data.length === 0) return null;
    else {
      return parseProject(resp.data);
    }
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getIsUserFollowing(projectUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + projectUrl + "/am_i_following/",
      token: token,
      locale: locale,
    });
    if (resp.data.length === 0) return null;
    else {
      //TODO: get comments and timeline posts and project taggings
      return resp.data.is_following;
    }
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getPostsByProject(projectUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + projectUrl + "/posts/",
      token: token,
      locale: locale,
    });
    if (resp.data.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getCommentsByProject(projectUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + projectUrl + "/comments/",
      token: token,
      locale: locale,
    });
    if (resp.data.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getProjectMembersByIdIfExists(projectUrl, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + projectUrl + "/members/",
      locale: locale,
    });
    if (resp.data.results.length === 0) return null;
    else {
      return parseProjectMembers(resp.data.results);
    }
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

function parseProject(project) {
  return {
    name: project.name,
    id: project.id,
    url_slug: project.url_slug,
    image: project.image,
    status: project.status,
    location: project.location,
    description: project.description,
    short_description: project.short_description,
    collaborators_welcome: project.collaborators_welcome,
    start_date: project.start_date,
    end_date: project.end_date,
    creation_date: project.created_at,
    helpful_skills: project.skills,
    helpful_connections: project.helpful_connections,
    creator: project.project_parents[0].parent_organization
      ? project.project_parents[0].parent_organization
      : project.project_parents[0].parent_user,
    isPersonalProject: !project.project_parents[0].parent_organization,
    is_draft: project.is_draft,
    tags: project.tags.map((t) => t.project_tag.name),
    collaborating_organizations: project.collaborating_organizations.map(
      (o) => o.collaborating_organization
    ),
    website: project.website,
    number_of_followers: project.number_of_followers,
  };
}

function parseProjectMembers(projectMembers) {
  return projectMembers.map((m) => {
    return {
      ...m.user,
      url_slug: m.user.url_slug,
      role: m.role_in_project,
      permission: m.role.role_type,
      availability: m.availability,
      name: m.user.first_name + " " + m.user.last_name,
      location: m.user.location,
    };
  });
}
