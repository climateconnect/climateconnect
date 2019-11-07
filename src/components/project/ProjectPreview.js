import React from "react";
import styled from "styled-components";

export default function ProjectPreview({ data }) {
    const rand = Math.ceil(Math.random() * 300)
  return (
    <Container>
      <Image src = {`https://picsum.photos/id/${rand}/260/210`}></Image>
      <Content>
        <h2>{data.name}</h2>
        <Labels>{data.labels.join(", ")}</Labels>

        <IconRow>
          <img href={data.organisation_image}></img>
          <span>{data.organisation_name}</span>
        </IconRow>
        <IconRow>
          <img href={data.organisation_image}></img>
          <span>{data.location}</span>
        </IconRow>
        <IconRow>
          <img href={data.organisation_image}></img>
          <span>{data.impact}</span>
        </IconRow>
        <button>Get Involved</button>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  border: 1px solid;
  /* temp */
  button {
    margin: 8px auto 0;
    width: 120px;
    border: 1px solid ${({ theme }) => theme.colors.primary};
    border-radius: 3px;
    font-size: 0.9rem;
  }
`;

const Image = styled.img`
max-width: 260px;
  height: auto;
  object-fit: cover;
`;

const Content = styled.div`
  padding: 6px;
  display: flex;
  flex-direction: column;
  h2 {
    font-size: ${({ theme }) => theme.fontSizes.h3};
    margin: 0;
  }
`;

const IconRow = styled.div`
  margin: ${({ theme }) => theme.spacing.tiny} 0;
  display: flex;
  align-items: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  img {
    background: lightblue;
    width: 20px;
    height: 20px;
    margin-right: ${({ theme }) => theme.spacing.tiny};
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
