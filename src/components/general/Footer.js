import React from "react";
import styled from "styled-components";

const Footer = () => (
  <Container>
    <div>© ClimateConnect 2019</div>
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
`;
