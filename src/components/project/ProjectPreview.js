import React from "react";
import styled from "styled-components";
import Button from "../general/Button";

export default function ProjectPreview({ data }) {
  const rand = Math.ceil(Math.random() * 300);
  return (
    <Container>
      <Image src={`https://picsum.photos/id/${rand}/240/210`}></Image>
      <Content>
        <h3>{data.name}</h3>
        <Labels>{data.labels.join(", ")}</Labels>

        <IconRow>
          <img href={data.organisation_image}></img>
          <span>{data.organisation_name}</span>
        </IconRow>
        <IconRow>
          <img src="./placeholder.svg"></img>
          <span>{data.location}</span>
        </IconRow>
        <IconRow>
          <img src="./world.svg"></img>
          <span>{data.impact}</span>
        </IconRow>
        <Button type="outlined" text="Get Involved"></Button>
      </Content>
    </Container>
  );
}

const Container = styled.div`
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

  @media (max-width: 600px) {
    max-width: 180px;
  }
  @media (max-width: 450px) {
    display: none;
  }
`;

const Content = styled.div`
  padding: 6px;
  display: flex;
  flex-direction: column;
  h3 {
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
