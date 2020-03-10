import React from "react";
import Layout from "../src/components/layouts/layout";
import ProjectPreviews from "./../src/components/project/ProjectPreviews";
import fakeProjectData from "../public/data/projects.json";
import { times } from "lodash";
import About from "./about";

const fakeProject1 = fakeProjectData.projects[0];
const fakeProject2 = fakeProjectData.projects[1];
const fakeProjects = [...times(3, () => fakeProject1), ...times(3, () => fakeProject2)];

export default function Index() {
  return (
    <>
      {process.env.PRE_LAUNCH === "true" ? (
        <About />
      ) : (
        <Layout title="Work on the most effective climate projects">
          <ProjectPreviews projects={fakeProjects} />
        </Layout>
      )}
    </>
  );
}
