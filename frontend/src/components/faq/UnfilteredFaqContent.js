import React from "react";
import { Tabs, Tab, Divider, makeStyles } from "@material-ui/core";
import FaqQuestionElement from "./FaqQuestionElement";

const useStyles = makeStyles(theme => {
  return {
    tabs: {
      width: "100%",
      marginTop: theme.spacing(2)
    },
    divider: {
      marginBottom: theme.spacing(2)
    }
  };
});

export default function UnfilteredFaqContent({ questionsBySection }) {
  const [tabValue, setTabValue] = React.useState(0);
  const classes = useStyles();
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  function TabContent({ value, index, children }) {
    return <div hidden={value !== index}>{children}</div>;
  }
  return (
    <div>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        className={classes.tabs}
      >
        {Object.keys(questionsBySection).map((key, index) => (
          <Tab
            key={key + "tab"}
            label={Object.keys(questionsBySection)[index].toUpperCase()}
            className={classes.tab}
          />
        ))}
      </Tabs>
      <Divider className={classes.divider} />
      {Object.keys(questionsBySection).map((key, index) => (
        <TabContent value={tabValue} index={index} key={key}>
          {questionsBySection[key].map(q => (
            <FaqQuestionElement key={key + "-" + q} questionObject={q} />
          ))}
        </TabContent>
      ))}
    </div>
  );
}
