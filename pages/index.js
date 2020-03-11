import React from "react";
import Layout from "../src/components/layouts/layout";
import ProjectPreviews from "./../src/components/project/ProjectPreviews";
import fakeProjectData from "../public/data/projects.json";
import About from "./about";
import project_status_metadata from "./../public/data/project_status_metadata";

export default function Index({ projects }) {
  return (
    <>
      {process.env.PRE_LAUNCH === "true" ? (
        <About />
      ) : (
        <Layout title="Work on the most effective climate projects">
          <ProjectPreviews projects={projects} />
        </Layout>
      )}
    </>
  );
}

Index.getInitialProps = async () => {
  return {
    projects: await getProjects()
  };
};

async function getProjects() {
  const projects = fakeProjectData.projects.map(p => {
    return { ...p, status: project_status_metadata.filter(s => s.key === p.status)[0] };
  });
  return [...projects, ...projects, ...projects];
}
