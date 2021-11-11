import { Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import UnfoldMoreIcon from "@material-ui/icons/UnfoldMore";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import Posts from "../communication/Posts";

const useStyles = makeStyles((theme) => ({
    linkDiscussionPreview: {
        color: theme.palette.secondary.main,
      },
      discussionPreview: {
        borderBottom: `1px solid ${theme.palette.grey[500]}`,
        borderTop: `1px solid ${theme.palette.grey[500]}`,
        marginBottom: theme.spacing(4),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
      },
      topSectionDiscussionPreview: {
        display: "flex",
        justifyContent: "space-between",
      },
      headingDiscussionPreview: {
        fontWeight: "bold",
        marginBottom: theme.spacing(0.5),
      },
      iconDiscussionPreview: {
        marginRight: theme.spacing(2),
      },
    }));

export default function DiscussionPreview({ latestParentComment, discussionTabLabel, locale, project }) {
    const classes = useStyles();
    return (
      <>
        <Link
          href={`${getLocalePrefix(locale)}/projects/${project.url_slug}#comments`}
          underline="none"
          className={classes.linkDiscussionPreview}
        >
          <div className={classes.discussionPreview}>
            <div className={classes.topSectionDiscussionPreview}>
              <Typography
                display="inline"
                color="primary"
                className={classes.headingDiscussionPreview}
              >
                {discussionTabLabel}
              </Typography>
              <UnfoldMoreIcon color="secondary" className={classes.iconDiscussionPreview} />
            </div>
            <Posts
              posts={latestParentComment}
              type="preview"
              user={latestParentComment.author_user}
              truncate={3}
            />
          </div>
        </Link>
      </>
    );
  }