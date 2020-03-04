import React from 'react';
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import theme from "./themes/theme";

function App() {
  return (
  <React.Fragment>
    <header>
      <title>Climate Connect</title>
      <link rel="icon" href="../public/favicon.ico" />
    </header>
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      {/*<Component {...pageProps} />*/}
    </ThemeProvider>
  </React.Fragment>
  );
}

export default App;
