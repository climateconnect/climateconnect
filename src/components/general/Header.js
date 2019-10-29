import React from "react";
import styled from "styled-components";
import Link from "../ui/Link";

const Header = () => (
  <Container>
    <img src="https://climateconnect.earth/logo.png"></img>
    <LinkContainer>
      <Link href="forum" text="Forum" passHref></Link>
      <Link href="browse" text="Browse" passHref></Link>
      <Link href="create" text="Create A Project" passHref></Link>
      <Link href="signin" text="SIGN IN" passHref type="button"></Link>
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
