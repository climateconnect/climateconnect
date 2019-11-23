import React from "react";
import styled from "styled-components";
import Button from "../general/Button";

export default function ProjectPreview({ project }) {
  // temporary to get different images from picsum
  const rand = Math.ceil(Math.random() * 300);
  return (
    <Container>
      {/* placeholder images */}
      <Image src={`https://picsum.photos/id/${rand}/240/210`}></Image>
      <Content>
        <h2>{project.name}</h2>
        <Labels>{project.labels.join(", ")}</Labels>

        <IconRow>
          <img href={project.organisation_image}></img>
          <span>{project.organisation_name}</span>
        </IconRow>
        <IconRow>
          <img src="./placeholder.svg"></img>
          <span>{project.location}</span>
        </IconRow>
        <IconRow>
          <img src="./world.svg"></img>
          <span>{project.impact}</span>
        </IconRow>
        <Button type="outlined">Get Involved</Button>
      </Content>
    </Container>
  );
}

const Container = styled.section`
  display: flex;
  background: #fff;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px,
    rgba(0, 0, 0, 0.12) 0px 1px 5px 0px;
`;

const Image = styled.img`
  max-width: 240px;
  height: auto;
  object-fit: cover;
  margin-right: ${({ theme }) => theme.spacing.tiny};

  @media (max-width: 1000px) {
    max-width: 160px;
    object-fit: fill;
  }
  @media (max-width: 450px) {
    display: none;
  }
`;

const Content = styled.div`
  padding: 6px;
  display: flex;
  flex-direction: column;
  h2 {
    font-size: 1.25rem;
    margin: 0;
  }
`;

const IconRow = styled.div`
  margin: ${({ theme }) => theme.spacing.tiny} 0;
  display: flex;
  align-items: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 20px;
  img {
    width: 20px;
    height: 20px;
    margin-right: ${({ theme }) => theme.spacing.small};
  }
`;

const Labels = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 11px;
  text-transform: capitalize;
  color: ${({ theme }) => theme.colors.gray};
  margin: 4px 0;
`;
