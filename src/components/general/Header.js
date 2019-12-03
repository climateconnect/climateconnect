import React from "react";
import styled from "styled-components";
import Link from "../ui/Link";

const Header = () => (
  <Container>
    <img src="https://climateconnect.earth/logo.png"></img>
    <LinkContainer>
      <Link href="about">About</Link>
      <Link href="forum">Forum</Link>
      <Link href="browse">Browse</Link>
      <Link href="create">Create A Project</Link>
      <Link href="signin" type="button">
        Sign In
      </Link>
    </LinkContainer>
  </Container>
);

export default Header;

const Container = styled.nav`
  display: flex;
  justify-content: space-between;
  height: 40px;
  align-items: center;
  padding: 12px 48px;
  border-bottom: 1px solid hsla(0, 0%, 82%, 1);

  img {
    height: 54px;
    width: 54px;
  }
`;

const LinkContainer = styled.div``;
