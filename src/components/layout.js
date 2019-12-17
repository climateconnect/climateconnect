import React from "react";
import styled from "styled-components";
import Header from "./general/Header";
import "./../reset.css";
import Footer from "./general/Footer";
import { ThemeProvider } from "styled-components";
import theme from "./../theme";

export default function Layout({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <LayoutContainer>
        <Header />
        <Content>{children}</Content>
        <Footer />
      </LayoutContainer>
    </ThemeProvider>
  );
}

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgb(248, 248, 248);
  min-height: 100vh;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 3rem auto;
  align-content: flex-start;
  flex: 1;
`;
