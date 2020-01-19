import React from "react";
import InfoLink from "./../components/about/InfoLink";
import info from "./../../public/data/info.json";
import members from "./../../public/data/members.json";
import links from "./../../public/data/links.json";
import InfoBubble from "./../components/about/InfoBubble";
import Member from "./../components/about/Member";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

function renderBubbles(info) {
  return info.map(i => {
    return <InfoBubble data={i} key={i.title} />;
  });
}

function renderInfoLinks(links) {
  return links.map(l => {
    return <InfoLink data={l} key={l.name} />;
  });
}

const useStyles = makeStyles({
  root: {
    textAlign: "center"
  },
  member: {
    display: "inline-block",
    marginLeft: 60,
    marginRight: 60,
    marginBottom: 60
  },
  imageContainer: {
    width: "100%",
    height: 373,
    backgroundImage: `url("images/about_background.png")`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    marginBottom: 75
  }
});

export default function about() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Box className={classes.imageContainer}>
        <Box>
          <div>CLIMATE CONNECT</div>
        </Box>
      </Box>
      <h2>
        We are an international team of volunteers building a non-profit climate action webplatform
      </h2>
      <h1>Our goal is to help you fight climate change most effectively</h1>
      <div>{renderBubbles(info)}</div>
      <h1>Find out more</h1>
      {renderInfoLinks(links)}
      <h1>Join our Team</h1>
      <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center">
        {members.map((member, index) => (
          <Box className={classes.member} key={index}>
            <Member member={member} />
          </Box>
        ))}
      </Box>
      <h2>Currently all members of our team are volunteers.</h2>
      <div>
        <h1>
          Interested in joining the team?
          <br />
          Contact us at contact@climateconnect.earth
        </h1>
        <div>
          While we are looking for any motivated people to join us, these skills would be especially
          helpful:
        </div>
        <ul>
          <li>Front end development (react)</li>
          <li>Back end development (node, postgres)</li>
          <li>Webdesign</li>
          <li>Marketing (social media marketing, creation of an image video)</li>
          <li>Knowledge in the assessment of CO2-footprints of processes / knowledge in LCA</li>
          <li>Experience with founding, funding and buildin a non-profit organisation</li>
        </ul>
      </div>
    </div>
  );
}

/*const Container = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  h1 {
    font-weight: 500;
    font-size: 52px;
    margin-bottom: 50px;
    line-height: 60px;
  }
  h2 {
    font-size: 35px;
  }
  @media (max-width: 900px) {
    h1 {
      font-size: 30px;
    }
    h2 {
      font-size: 25px;
    }
  }
`;

const AboutImageContainer = styled.div`
  width: 100%;
  height: 373px;
  background-image: url("images/about_background.png");
  background-position: center;
  background-size: cover;
  margin-bottom: 75px;
  display: table;
`;

const Headline = styled.div`
  display: table-cell;
  vertical-align: middle;
  width: 100%;
`;

const HeadlineText = styled.div`
  color: white;
  font-size: 85px;
  border: 5px solid white;
  display: inline-block;
  margin: 0 auto;
  padding-top: 3%;
  padding-bottom: 3%;
  padding-right: 10%;
  padding-left: 10%;
  @media (max-width: 1075px) {
    font-size: 75px;
    padding-right: 5%;
    padding-left: 5%;
  }
  @media (max-width: 875px) {
    font-size: 50px;
    padding-right: 5%;
    padding-left: 5%;
  }
  @media (max-width: 575px) {
    font-size: 40px;
    padding-right: 5%;
    padding-left: 5%;
  }
`;

const BubbleGrid = styled.div`
  margin-bottom: 3rem;
  max-width: 1390px;
  margin: 0 auto;
  margin-top: 50px;
  @media (max-width: 1000px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const MemberInfoGrid = styled.div`
  max-width: 1390px;
  margin: 0 auto;
`;

const ContactSection = styled.div`
  margin-top: 50px;
  h1 {
    margin-bottom: 20px;
  }
  ul {
    text-align: left;
    max-width: 790px;
    margin: 0 auto;
    margin-bottom: 35px;
  }
`;*/
