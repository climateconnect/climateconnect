import React from "react";
import Link from "next/link";
import styled from "styled-components";
import Button from "../ui/Button";

const Header = () => (
  <Container>
    <img src="https://climateconnect.earth/logo.png"></img>
    <LinkContainer>
      <Link href={"forum"} passHref>
        <StyledLink>Forum</StyledLink>
      </Link>
      <Link href={"browse"} passHref>
        <StyledLink>Browse</StyledLink>
      </Link>
      <Link href={"create"} passHref>
        <StyledLink>Create A Project</StyledLink>
      </Link>
      <Link href={"signin"}>
        <StyledLink className="button">SIGN IN</StyledLink>
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

const StyledLink = styled.a`
  padding: 6px;
  color: hsla(185, 56%, 30%, 1);
  margin-right: 24px;
  text-decoration: none;
  cursor: pointer;
  font-size: 1.1rem;
  transition: 0.25s ease-in-out;

  :hover {
    color: hsla(185, 56%, 30%, 1);
    transition: 0.25s ease-in-out;
  }

  &.button {
    border: 1px solid hsla(0, 0%, 55%, 1);
    padding: 6px 16px;
    border-radius: 4px;
    color: hsla(0, 0%, 30%, 1);
    :hover {
      color: hsla(0, 0%, 20%, 1);
      transition: 0.25s ease-in-out;
    }
  }
`;
