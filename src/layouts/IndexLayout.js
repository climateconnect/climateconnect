import React from "react";
import styled from "styled-components";
import Link from "next/link";
import TEMP_FEATURED_DATA from "./../../projects.json";
import ProjectPreview from "./../components/project/ProjectPreview";

function renderProjects() {
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

      <h3>New</h3>
      <ProjectGrid>{renderProjects()}</ProjectGrid>

      <Link href="Browse">
        <TempButton>Browse</TempButton>
      </Link>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  h1 {
    text-align: center;
    font-size: ${({ theme }) => theme.fontSizes.h1};
    font-weight: 500;
  }
`;

/* temporary */
const TempButton = styled.button`
  align-self: center;
  cursor: pointer;
  text-align: center;
  background: ${({ theme }) => theme.colors.primary};
  padding: 14px 84px;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.white};
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 16px;
  margin-bottom: 3rem;
`;
