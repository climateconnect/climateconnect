import React from "react";
import Link from "next/link";
import styled from "styled-components";

const links = [
  { href: "https://zeit.co/now", label: "ZEIT" },
  { href: "https://github.com/zeit/next.js", label: "GitHub" }
].map(link => {
  link.key = `nav-link-${link.href}-${link.label}`;
  return link;
});

const Header = () => (
  <Container>
    <img src="https://climateconnect.earth/logo.png"></img>
    <LinkContainer>
      <Link href={"test"} passHref>
        <StyledLink>Forum</StyledLink>
      </Link>
      <StyledLink>
        <StyledLink>Browse</StyledLink>
      </StyledLink>
      <StyledLink>
        <StyledLink>Create A Project</StyledLink>
      </StyledLink>
      <StyledLink>
        <StyledLink>SIGN IN</StyledLink>
      </StyledLink>
    </LinkContainer>
  </Container>
);

export default Header;

const Container = styled.nav`
  grid-area: "header";
  display: flex;
  justify-content: space-between;
  height: 40px;
  align-items: center;
  padding: 0.5rem 3rem;
  border-bottom: 1px solid #eaeaea;

  img {
    height: 40px;
    width: 40px;
  }
`;

const LinkContainer = styled.div``;

const StyledLink = styled.a`
  padding: 8px;
  color: #237177;
  margin: 8px;
  text-decoration: none;
`;
