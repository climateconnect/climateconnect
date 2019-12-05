import React from "react";
import styled from "styled-components";
import Link from "../ui/Link";

const Footer = () => (
  <Container>
    <LeftSection>
      <Link href="imprint">Imprint</Link>
    </LeftSection>
    <div>© ClimateConnect 2019</div>
    <RightSection>
      <a
        href="https://github.com/climateconnect/climateconnect"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src="images/github.png"></img>
      </a>
      <a href="https://twitter.com/ConnectClimate" target="_blank" rel="noopener noreferrer">
        <img src="icons/twitter.svg"></img>
      </a>
    </RightSection>
  </Container>
);

export default Footer;

const Container = styled.footer`
  display: flex;
  justify-content: center;
  height: 40px;
  align-items: center;
  padding: 0.5rem 3rem;
  border-top: 1px solid hsla(0, 0%, 82%, 1);
  color: hsla(185, 56%, 30%, 1);
  a {
    color: hsla(185, 56%, 30%, 1);
  }
`;

const LeftSection = styled.div`
  margin-right: auto;
`;

const RightSection = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;
