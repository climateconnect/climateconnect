import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import styled from "styled-components";

import ProgressBar from "../../src/components/general/ProgressBar.js";
import ProjectPaneContents from "../../src/components/project/ProjectPaneContents.js";
import Button from "../../src/components/general/Button";
import TEMP_ORGANIZATION_DATA from "./../../tmp-data/organizations.json";
import TEMP_CATEGORY_DATA from "./../../tmp-data/categories.json";

class CreateProjectLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organizations: TEMP_ORGANIZATION_DATA.organizations,
      categories: TEMP_CATEGORY_DATA.categories,
      progressPercentage: 0,
      organization_id: "",
      project_name: "",
      project_location: "",
      active_pane: 0
    };
  }

  _handleOrganizationChange = event => {
    this.setState({ organization_id: event.target.value });
  };

  _handleProjectNameChange = event => {
    this.setState({ project_name: event.target.value });
  };

  _handleProjectLocationChange = event => {
    this.setState({ project_location: event.target.value });
  };

  _incrementPane = () => {
    this.setState({ active_pane: this.state.active_pane + 1 });
  };

  render() {
    return (
      <GridWrapper>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <h1>Create a Project</h1>
            <ProgressBar progressPercentage={this.state.progressPercentage}></ProgressBar>
          </Grid>
          <Grid item xs={12}>
            <ProjectPaneContents
              active_pane={this.state.active_pane}
              organizations={this.state.organizations}
              organization_id={this.state.organization_id}
              categories={this.state.categories}
              _handleOrganizationChange={this._handleOrganizationChange}
              _handleProjectLocationChange={this._handleProjectLocationChange}
              _handleProjectNameChange={this._handleProjectNameChange}
              _incrementPane={this._incrementPane}
            ></ProjectPaneContents>
          </Grid>
          <Grid item xs={12}>
            <Button type="big" clickHandler={this._incrementPane}>
              Next step
            </Button>
          </Grid>
        </Grid>
      </GridWrapper>
    );
  }
}

const GridWrapper = styled.div`
  min-width: 800px;
  padding: 1rem;
  background: ${props => props.theme.colors.white};
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.lightGray};
`;

export default CreateProjectLayout;
