import React from "react";
import Link from "next/link";
import Layout from "../../src/components/layout";
import { Container } from "@material-ui/core";
import TEMP_FEATURED_DATA from "../../projects.json";

export default function ProjectPage({ project }) {
  return (
    <Layout title={project ? project.name : "Project not found"}>
      {project ? <ProjectLayout project={project} /> : <NoProjectFoundLayout />}
    </Layout>
  );
}

ProjectPage.getInitialProps = async ctx => {
  return {
    project: await getProjectByIdIfExists(ctx.query.projectId)
  };
};

function ProjectLayout({ project }) {
  return (
    <Container maxWidth="xl">
      <p>{project.description}</p>
    </Container>
  );
}

function NoProjectFoundLayout() {
  return (
    <>
      <p>Project not found.</p>
      <p>
        <Link href="/">
          <a>Click here to return to the homepage.</a>
        </Link>
      </p>
    </>
  );
}

// This will likely become asynchronous in the future (a database lookup or similar) so it's marked as `async`, even though everything it does is synchronous.
async function getProjectByIdIfExists(projectId) {
  return TEMP_FEATURED_DATA.projects.find(({ id }) => id === projectId);
}
