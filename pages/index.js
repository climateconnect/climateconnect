import React from "react";
import Layout from "./../src/components/layout";
import ProjectPreviews from "./../src/components/project/ProjectPreviews";
import fakeProjectData from "../public/data/projects.json";
import { times } from "lodash";

const fakeProjectTemplate = fakeProjectData.projects[0];
const fakeProjects = times(6, () => fakeProjectTemplate);

export default function Index() {
  return (
    <Layout title="Work on the most effective climate projects">
      <ProjectPreviews projects={fakeProjects} />
    </Layout>
  );
}
