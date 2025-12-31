import Grid from "@mui/material/Unstable_Grid2";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import LoadingSpinner from "../general/LoadingSpinner";
import OrganizationPreview from "./OrganizationPreview";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    width: "100%",
  },
});

export default function OrganizationPreviews({
  hasMore,
  loadFunc,
  organizations,
  parentHandlesGridItems,
  hubUrl,
  isLoading = false,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "organization", locale: locale });
  const toOrganizationPreviews = (organizations) =>
    organizations.map((o) => <GridItem key={o.url_slug} organization={o} hubUrl={hubUrl} />);

  const [gridItems, setGridItems] = React.useState(toOrganizationPreviews(organizations));

  const loadMore = async () => {
    if (loadFunc) {
      const newOrganizations = await loadFunc();
      if (!parentHandlesGridItems) {
        setGridItems([...gridItems, ...toOrganizationPreviews(newOrganizations)]);
      }
    }
  };

  const { lastElementRef } = useInfiniteScroll({
    hasMore: hasMore || false,
    isLoading: isLoading,
    onLoadMore: loadMore,
  });

  const displayedOrganizations = parentHandlesGridItems ? organizations : gridItems;

  if (!displayedOrganizations || displayedOrganizations.length === 0) {
    return <div>{texts.no_organization_found}</div>;
  }

  return (
    <>
      <Grid
        className={`${classes.reset}`}
        component="ul"
        container
        spacing={2}
      >
        {displayedOrganizations.map((organization, index) => {
          const isLastElement = index === displayedOrganizations.length - 1;
          return (
            <Grid
              key={organization.props?.organization?.url_slug || organization.url_slug}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              component="li"
              ref={isLastElement ? lastElementRef : null}
            >
              {organization.props ? (
                organization
              ) : (
                <OrganizationPreview organization={organization} hubUrl={hubUrl} />
              )}
            </Grid>
          );
        })}
      </Grid>
      {isLoading && <LoadingSpinner isLoading />}
    </>
  );
}

function GridItem({ organization, hubUrl }) {
  return <OrganizationPreview organization={organization} hubUrl={hubUrl} />;
}
