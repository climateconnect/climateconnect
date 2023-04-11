import React, { useState } from "react";
import { Tabs, Tab, Divider } from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";

import FaqQuestionElement from "./FaqQuestionElement";

const useStyles = makeStyles((theme) => {
  return {
    tabs: {
      width: "100%",
      marginTop: theme.spacing(2),
    },
    divider: {
      marginBottom: theme.spacing(2),
    },
  };
});

export default function UnfilteredFaqContent({ questionsBySection }) {
  const [tabValue, setTabValue] = useState(0);
  const classes = useStyles();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  function TabContent({ value, index, children }) {
    return <div hidden={value !== index}>{children}</div>;
  }

  return (
    <>
      <Tabs
        className={classes.tabs}
        indicatorColor="primary"
        onChange={handleTabChange}
        textColor="primary"
        value={tabValue}
      >
        {Object.keys(questionsBySection).map((key, index) => (
          <Tab
            /*TODO(undefined) className={classes.tab} */
            key={`${key}-${index}-tab`}
            label={Object.keys(questionsBySection)[index].toUpperCase()}
          />
        ))}
      </Tabs>
      <Divider className={classes.divider} />
      {Object.keys(questionsBySection).map((key, index) => (
        <TabContent value={tabValue} index={index} key={key}>
          {questionsBySection[key].map((q) => (
            <FaqQuestionElement key={key + "-" + q.question} questionObject={q} />
          ))}
        </TabContent>
      ))}
    </>
  );
}
