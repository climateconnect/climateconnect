import React from "react";
import styled from "styled-components";
import Link from "next/link";

export default function index() {
  return (
    <Container>
      <h1>Share and Collaborate on projects to reach the maximum positive impact on the world</h1>

      <h3>Featured</h3>
      <ProjectGrid>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
        <div>6</div>
      </ProjectGrid>

      <h3>New</h3>
      <ProjectGrid>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
        <div>6</div>
      </ProjectGrid>

      <Link href="Browse">
        <button>Browse</button>
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

  /* temporary */
  button {
    align-self: center;
    cursor: pointer;
    text-align: center;
    background: ${({ theme }) => theme.colors.primary};
    padding: 14px 84px;
    font-size: 24px;
    color: ${({ theme }) => theme.colors.white};
  }
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 16px;
  margin-bottom: 3rem;

  div {
    padding: 40px;
    background: lightblue;
  }
`;
