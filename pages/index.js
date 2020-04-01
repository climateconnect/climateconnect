import React from "react";
import Layout from "../src/components/layouts/layout";
import ProjectPreviews from "./../src/components/project/ProjectPreviews";
import fakeProjectData from "../public/data/projects.json";
import About from "./about";

export default function Index({ projectsObject }) {
  console.log(projectsObject);
  const [hasMore, setHasMore] = React.useState(true);

  const loadMoreProjects = async page => {
    const newProjectsObject = await getProjects(page);
    const newProjects = newProjectsObject.projects;
    setHasMore(newProjectsObject.hasMore);
    return [...newProjects];
  };
  return (
    <>
      {process.env.PRE_LAUNCH === "true" ? (
        <About />
      ) : (
        <Layout title="Work on the most effective climate projects">
          <ProjectPreviews
            projects={projectsObject.projects}
            loadFunc={loadMoreProjects}
            hasMore={hasMore}
          />
        </Layout>
      )}
    </>
  );
}

Index.getInitialProps = async () => {
  return {
    projectsObject: await getProjects(0)
  };
};

//TODO replace by db call. console.log is just there to pass lint
async function getProjects(page) {
  console.log(page);
  const projects = fakeProjectData.projects.slice(0, 6);
  return { projects: [...projects, ...projects], hasMore: true };
}
