import NextCookies from "next-cookies";
import React, { useContext, useEffect, useRef } from "react";
import Cookies from "universal-cookie";
import ROLE_TYPES from "../../public/data/role_types";
import { apiRequest } from "../../public/lib/apiOperations";
import { nullifyUndefinedValues } from "../../public/lib/profileOperations";
import getTexts from "../../public/texts/texts";
import UserContext from "../../src/components/context/UserContext";
import PageNotFound from "../../src/components/general/PageNotFound";
import WideLayout from "../../src/components/layouts/WideLayout";
import ProjectPageRoot from "../../src/components/project/ProjectPageRoot";
import HubsSubHeader from "../../src/components/indexPage/hubsSubHeader/HubsSubHeader";
import { getAllHubs } from "../../public/lib/hubOperations.js";
import { useMediaQuery } from "@material-ui/core";
import { getImageUrl } from "../../public/lib/imageOperations";
import { makeStyles } from "@material-ui/core/styles";
import ProjectSideBar from "../../src/components/project/ProjectSideBar";

const useStyles = makeStyles((theme) => ({
  contentWrapper: {
    display: "flex",
  },
  mainContent: (props) => ({
    width: props.showSimilarProjects ? "80%" : "100%",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  }),
  secondaryContent: (props) => ({
    width: props.showSimilarProjects ? "20%" : "0%",
    [theme.breakpoints.down("sm")]: {
      width: "0%",
      marginTop: theme.spacing(0),
      marginRight: theme.spacing(0),
      marginLeft: theme.spacing(0),
    },
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(7),
    marginLeft: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  }),
}));

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
  const { auth_token } = NextCookies(ctx);
  const projectUrl = encodeURI(ctx.query.projectId);
  const [
    project,
    members,
    posts,
    comments,
    following,
    liking,
    hubs,
    similarProjects,
  ] = await Promise.all([
    getProjectByIdIfExists(projectUrl, auth_token, ctx.locale),
    getProjectMembersByIdIfExists(projectUrl, ctx.locale),
    getPostsByProject(projectUrl, auth_token, ctx.locale),
    getCommentsByProject(projectUrl, auth_token, ctx.locale),
    auth_token ? getIsUserFollowing(projectUrl, auth_token, ctx.locale) : false,
    auth_token ? getIsUserLiking(projectUrl, auth_token, ctx.locale) : false,
    getAllHubs(ctx.locale),
    getSimilarProjects(projectUrl, ctx.locale),
  ]);
  return {
    props: nullifyUndefinedValues({
      project: project,
      members: members,
      posts: posts,
      comments: comments,
      following: following,
      liking: liking,
      hubs: hubs,
      similarProjects: similarProjects,
    }),
  };
}

export default function ProjectPage({
  project,
  members,
  posts,
  comments,
  following,
  liking,
  hubs,
  similarProjects,
}) {
  const token = new Cookies().get("auth_token");
  const [curComments, setCurComments] = React.useState(parseComments(comments));
  const [message, setMessage] = React.useState({});
  const [isUserFollowing, setIsUserFollowing] = React.useState(following);
  const [isUserLiking, setIsUserLiking] = React.useState(liking);
  const [followingChangePending, setFollowingChangePending] = React.useState(false);
  const [likingChangePending, setLikingChangePending] = React.useState(false);
  const [numberOfLikes, setNumberOfLikes] = React.useState(project.number_of_likes);
  const [numberOfFollowers, setNumberOfFollowers] = React.useState(project.number_of_followers);
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, project: project });
  const [showSimilarProjects, setShowSimilarProjects] = React.useState(true);
  const classes = useStyles({
    showSimilarProjects: showSimilarProjects,
  });

  const handleHideContent = () => {
    setShowSimilarProjects(!showSimilarProjects);
  };

  const smallScreenSize = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const handleFollow = (userFollows, updateCount, pending) => {
    setIsUserFollowing(userFollows);
    if (updateCount) {
      if (userFollows) {
        setNumberOfFollowers(numberOfFollowers + 1);
      } else {
        setNumberOfFollowers(numberOfFollowers - 1);
      }
    }
    setFollowingChangePending(pending);
  };

  //We only update the count once the frontend received a response from the backend. This is what the updateCount variable is for
  const handleLike = (userLikes, updateCount, pending) => {
    setIsUserLiking(userLikes);
    if (updateCount) {
      if (userLikes) {
        setNumberOfLikes(numberOfLikes + 1);
      } else {
        setNumberOfLikes(numberOfLikes - 1);
      }
    }
    setLikingChangePending(pending);
  };

  const handleWindowClose = (e) => {
    if (
      curComments.filter((c) => c.unconfirmed).length > 0 ||
      followingChangePending ||
      likingChangePending
    ) {
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

  const hubsSubHeaderRef = useRef(null);
  const tinyScreen = useMediaQuery((theme) => theme.breakpoints.down("xs"));

  return (
    <WideLayout
      description={project?.short_description}
      message={message?.message}
      messageType={message?.messageType}
      title={project ? project.name : texts.project + " " + texts.not_found}
      subHeader={
        !tinyScreen && (
          <HubsSubHeader hubs={hubs} subHeaderRef={hubsSubHeaderRef} onlyShowDropDown={true} />
        )
      }
      image={getImageUrl(project.image)}
    >
      {project ? (
        <div className={classes.contentWrapper}>
          <div className={classes.mainContent}>
            <ProjectPageRoot
              project={{ ...project, team: members, timeline_posts: posts, comments: curComments }}
              token={token}
              setMessage={setMessage}
              isUserFollowing={isUserFollowing}
              user={user}
              setCurComments={setCurComments}
              followingChangePending={followingChangePending}
              likingChangePending={likingChangePending}
              texts={texts}
              projectAdmin={members?.find((m) => m.permission === ROLE_TYPES.all_type)}
              isUserLiking={isUserLiking}
              numberOfLikes={numberOfLikes}
              numberOfFollowers={numberOfFollowers}
              handleFollow={handleFollow}
              handleLike={handleLike}
              similarProjects={similarProjects}
              handleHideContent={handleHideContent}
              showSimilarProjects={showSimilarProjects}
            />
          </div>
          <div className={classes.secondaryContent}>
            {!smallScreenSize && (
              <ProjectSideBar
                similarProjects={similarProjects}
                handleHideContent={handleHideContent}
                showSimilarProjects={showSimilarProjects}
                locale={locale}
                texts={texts}
              />
            )}
          </div>
        </div>
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

async function getIsUserLiking(projectUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + projectUrl + "/am_i_liking/",
      token: token,
      locale: locale,
    });
    if (resp.data.length === 0) return null;
    else {
      return resp.data.is_liking;
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
      console.log(resp);
      return parseProjectMembers(resp.data.results);
    }
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getSimilarProjects(projectUrl, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + projectUrl + "/similar/",
      locale: locale,
    });
    if (resp.data.results.length === 0) return null;
    else {
      console.log(resp);
      return resp.data.results;
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
    number_of_likes: project.number_of_likes,
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
