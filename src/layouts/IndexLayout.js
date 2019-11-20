import React from "react";
import styled from "styled-components";
import Link from "next/link";
import TEMP_FEATURED_DATA from "./../../projects.json";
import ProjectPreview from "./../components/project/ProjectPreview";
import Button from "../components/general/Button.js";

function renderProjects() {
  // TEMPORARY DATA
  return TEMP_FEATURED_DATA.projects.map(project => {
    return <ProjectPreview data={project} key={project.name}></ProjectPreview>;
  });
}

export default function index() {
  return (
    <Container>
      <h1>Share and Collaborate on projects to reach the maximum positive impact on the world</h1>

      <h3>Featured</h3>
      <ProjectGrid>
        {renderProjects()}
        {/* Added to preview multiple projects */}
        {renderProjects()}
        {renderProjects()}
        {renderProjects()}
      </ProjectGrid>

      <Link href="Browse">
        <Button text="Browse" type="big">
          {" "}
        </Button>
      </Link>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 1rem;
  h1 {
    text-align: center;
    font-weight: 500;
  }
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 32px 24px;
  margin-bottom: 3rem;
  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;
