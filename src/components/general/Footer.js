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

const Footer = () => (
  <Container>
    <div>Footer</div>
  </Container>
);

export default Footer;

const Container = styled.footer`
  grid-area: "header";
  background: #b6b6b6;
  display: flex;
  justify-content: space-between;
  height: 40px;
  align-items: center;
  padding: 8px 12px;
`;
