import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import PropTypes from "prop-types";
import React, { useContext } from "react";
import Linkify from "react-linkify";
import YouTube from "react-youtube";
import youtubeRegex from "youtube-regex";
import { getFragmentsWithMentions } from "../../utils/mentions_markdown";
import UserContext from "../context/UserContext";
import TimeContainer from "./chat/TimeContainer"

const useStyles = makeStyles((theme)=>({
  link: {
    color: "inherit",
    "&:visited": {
      color: "inherit",
    },
  },
  sentTextContainer: {
    backgroundColor: "#207178",
    borderRadius: "10px",
    opacity: 1,
    padding: theme.spacing(1),
    paddingRight: theme.spacing(4),
  },
  recievedTextContainer: {
    backgroundColor: "#E0E0E0",
    borderRadius: "10px",
    opacity: 1,
    padding: theme.spacing(1),
    paddingRight: theme.spacing(4),
  },
  sentTextDesign: {
    color: "white",
    textAlign: "left",
  },
  textDesign: {
    color: "#484848",
    textAlign: "left",
  },
  time: {
    fontSize: 10,
    float: "right",
    marginRight: theme.spacing(-3),
    color: theme.palette.secondary.main,
  },
  timeContainer: {
    paddingLeft: theme.spacing(4),
  },
  sentTime: {
    color: "#bdb8c7",
  },
  loader: {
    display: "inline-block",
    marginRight: theme.spacing(0.25),
  },
  youtubeWrapper: {
    maxWidth: "640px",
  }
}));

type Props = {
  content?: any;
  renderYoutubeVideos?: boolean;
  associatedJoinRequest?: object;
  sentDate?: any;
  received?: boolean;
  unconfirmed?: any;
};

export default function MessageContent({
  content,
  renderYoutubeVideos = false,
  associatedJoinRequest,
  sentDate,
  received,
  unconfirmed
}: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  // console.log("sentDate",sentDate);

  //workaround to get target="_blank" because setting 'properties' on the Linkify component doesn't work
  const componentDecorator = (href, text, key) => (
    <a href={href} className={classes.link} key={key} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );

  const opts = {
    width: "100%",
    host: "https://www.youtube-nocookie.com",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
    },
  };

  const getFirstYouTubeVideosLines = (content) => {
    const allLines = content.split("\n");
    const youtubeLines = allLines
      .filter((w) => w.length > 0 && youtubeRegex().test(w))
      .map((line) => {
        const words = line.split(" ");
        const enrichedLine = words.map((w) => {
          if (youtubeRegex().test(w)) {
            let video_id = YouTubeGetID(w);
            const ampersandPosition = video_id.indexOf("&");
            if (ampersandPosition !== -1) video_id = video_id.substring(0, ampersandPosition);
            return (
              <div className={classes.youtubeWrapper}>
                <YouTube videoId={video_id} opts={opts as any} />
              </div>
            )
          } else {
            return <Linkify componentDecorator={componentDecorator}>{w + " "}</Linkify>;
          }
        });
        return {
          content: enrichedLine,
          index: allLines.indexOf(line),
        };
      });
    return youtubeLines.filter((l, index) => index < renderYoutubeVideos);
  };

  function YouTubeGetID(url) {
    var ID = "";
    url = url.replace(/(>|<)/gi, "").split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (url[2] !== undefined) {
      // TODO: confirm this escape character is required
      // eslint-disable-next-line no-useless-escape
      ID = url[2].split(/[^0-9a-z_\-]/i);
      ID = ID[0];
    } else {
      ID = url;
    }
    return ID;
  }

  const youtubeVideoLines = renderYoutubeVideos ? getFirstYouTubeVideosLines(content) : null;

  return (
    <Linkify componentDecorator={componentDecorator}>
      {content.split("\n").map((content, index) => {
        if (!content.length) return <br key={index} />;
        if (youtubeVideoLines && youtubeVideoLines.find((l) => l.index === index)) {
          return <div key={index}>{youtubeVideoLines.find((l) => l.index === index).content}</div>;
        }
        const fragments = getFragmentsWithMentions(content, true, locale);
        return (
          <div key={index}>
            {!associatedJoinRequest && (
              <Typography display="inline" style={{ alignSelf: "flex-start" }}>
                {fragments}
              </Typography>
            )}
            {associatedJoinRequest && (
              <div className={received ? classes.recievedTextContainer : classes.sentTextContainer}>
                <Typography
                  className={received ? classes.textDesign : classes.sentTextDesign}
                  display="inline"
                  style={{ alignSelf: "flex-start" }}
                >
                  {fragments}
                </Typography>
                <TimeContainer received={received} unconfirmed={unconfirmed} sentDate={sentDate}/>
              </div>
            )}
          </div>
        );
      })}
    </Linkify>
  );
}

MessageContent.propTypes = {
  content: PropTypes.string.isRequired,
};
