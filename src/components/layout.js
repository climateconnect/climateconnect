import React from "react";
import styled from "styled-components";
import Header from "./general/Header";
import "./../theme.css";
import Footer from "./general/Footer";

export default function Layout({ children }) {
  return (
    <LayoutContainer>
      <Header></Header>
      {children}
      <Footer />
    </LayoutContainer>
  );
}

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: rgb(248, 248, 248);
  min-height: 100vh;
`;
