import React from "react";
import styled from "styled-components";
import Link from "next/link";

const info = [
  {
    icon: "fa-plus",
    title: "Share your actions",
    text:
      "Have you ever wondered what is being done about climate change in your region and globally? By enabling climate protectors to share their project on Climate Connect, we will provide a comprehensive up to date list of what is being done about climate change."
  },
  {
    icon: "fa-chart-bar",
    title: "Measure the impact",
    text:
      "You are thinking about getting involved in climate action, but don't know how you can be most effective? On Climate Connect each action will have an impact score. This way you can find out how you can maximize your impact"
  },
  {
    icon: "fa-users",
    title: "Collaborate globally",
    text:
      "Climate change is a global issue. This is why we want to create a global network of climate protectors. Climate Connect allows you to see where you can make the biggest difference with your personal strengths and skillset. If you're already working on an impactful project, you will be able to find collaborators here."
  },
  {
    icon: "fa-lightbulb",
    title: "Get inspired",
    text:
      "On Climate Connect, you will find blue prints of high-impact projects, that you will be able to replicate at your location. This way you can very easily find the most effective thing you can work on with your specific skillset."
  },
  {
    icon: "fa-eye",
    title: "Maximum transparency",
    text:
      "Our code is available open source and can be found in our Github repository. The impact algorithm will be open source and the community will make the decisions on how to develop it further."
  }
];

const members = [
  {
    name: "Christoph Stoll",
    image: "christophstoll.png",
    location: "Erlangen, Germany"
  },
  {
    name: "Thomas Bove",
    image: "thomasbove.png",
    location: "Paris, France"
  },
  {
    name: "Tobias Rehm",
    image: "tobiasrehm.png",
    location: "Erlangen, Germany"
  },
  {
    name: "Reece Langerock",
    image: "reecelangerock.png",
    location: "Chicago, USA"
  },
  {
    name: "Michael Fischer",
    image: "michaelfischer.png",
    location: "Erlangen, Germany"
  }
];

function renderBubbles(info) {
  return info.map(i => {
    return <InfoBubble data={i} key={i.title}></InfoBubble>;
  });
}

function renderMemberInfo(members) {
  return members.map(m => {
    return <Member data={m} key={m.name}></Member>;
  });
}

export default function about() {
  return (
    <Container>
      <AboutImageContainer>
        <HeadlineContainer>
          <Headline>
            <HeadlineText>CLIMATE CONNECT</HeadlineText>
          </Headline>
        </HeadlineContainer>
      </AboutImageContainer>
      <h2>
        We are an international team of volunteers building a non-profit climate action webplatform
      </h2>
      <h1>Our goal is to help you fight climate change most effectively</h1>
      <BubbleGrid>{renderBubbles(info)}</BubbleGrid>
      <h1>Find out more</h1>
      <div>
        <LinkContainer>
          <h2>
            <a href="onepager.pdf" target="_blank" rel="noopener noreferrer">
              <i className="fas fa-file-alt"></i>Read our onepager
            </a>
          </h2>
        </LinkContainer>
      </div>
      <div>
        <LinkContainer>
          <h2>
            <a
              href="xd.adobe.com/view/395518bf-7e51-4eb2-6ff2-3f1b57fdaa17-4f64/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fas fa-pencil-ruler"></i>View our interactive prototype
            </a>
          </h2>
        </LinkContainer>
      </div>
      <div>
        <LinkContainer>
          <h2>
            <Link href="/faq">
              <a>
                <i className="fas fa-question"></i>View our FAQ section for in depth explanations
              </a>
            </Link>
          </h2>
        </LinkContainer>
      </div>
      <h1>Join our Team</h1>
      <MemberInfoGrid>{renderMemberInfo(members)}</MemberInfoGrid>
      <h2>Currently all members of our team are volunteers.</h2>
      <h1>Interested in joining us in accelerating climate action worldwide?</h1>
      <h1>Contact us at contact@climateconnect.earth</h1>
      <div>
        While we are looking for any motivated people to join us, these skills would be especially
        helpful:
      </div>
      <RequiredSkills>
        <li>Front end development (react)</li>
        <li>Back end development (node, postgres)</li>
        <li>Webdesign</li>
        <li>Marketing (social media marketing, creation of an image video)</li>
        <li>Knowledge in the assessment of CO2-footprints of processes / knowledge in LCA</li>
        <li>Generally experience with founding and working in a non-profit organisation</li>
      </RequiredSkills>
    </Container>
  );
}

const InfoBubble = ({ data }) => (
  <InfoBubbleContainer>
    <Bubble>
      <IconWrapper>
        <i className={"fas " + data.icon}></i>
      </IconWrapper>
    </Bubble>
    <h3>{data.title}</h3>
    <InfoText>{data.text}</InfoText>
  </InfoBubbleContainer>
);

const Member = ({ data }) => (
  <MemberInfo>
    <img src={data.image}></img>
    <h2>{data.name}</h2>
    <Location>
      <i className="fas fa-map-marker-alt"></i>
      {data.location}
    </Location>
  </MemberInfo>
);

const Container = styled.div`
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
  background-image: url("/about_background.png");
  background-position: center;
  background-size: cover;
  margin-bottom: 75px;
`;

const HeadlineContainer = styled.div`
  display: table;
  height: 100%;
  width: 100%;
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

const InfoBubbleContainer = styled.div`
  display: inline-block;
  vertical-align: top;
  padding-left: 50px;
  padding-right: 50px;
  h3 {
    font-size: 35px;
  }
  margin-bottom: 50px;
`;

const Bubble = styled.div`
  border: 1px solid black;
  border-radius: 100%;
  width: 150px;
  height: 150px;
  margin: auto;
  display: table;
`;

const IconWrapper = styled.div`
  width: 75px;
  font-size: 45px;
  display: table-cell;
  vertical-align: middle;
  margin: 0 auto;
`;

const LinkContainer = styled.div`
  display: inline-block;
  margin: 0 auto;
  margin-bottom: 50px;
  i {
    display: inline-block;
    margin-right: 10px;
    font-size: 32px;
  }
  h2 {
    display: inline-block;
    margin-top: 0px;
    vertical-align: top;
  }
  a {
    color: hsla(185, 56%, 30%, 1);
  }
`;

const MemberInfoGrid = styled.div`
  max-width: 1390px;
  margin: 0 auto;
`;

const MemberInfo = styled.div`
  display: inline-block;
  margin-left: 75px;
  margin-right: 75px;
  margin-bottom: 60px;
  img {
    width: 250px;
  }
  div {
    font-size: 24px;
    color: #484848;
  }
`;

const Location = styled.div`
  i {
    margin-right: 5px;
  }
`;

const InfoText = styled.div`
  max-width: 350px;
  color: #484848;
  margin: 0 auto;
  font-size: 20px;
`;

const RequiredSkills = styled.ul`
  text-align: left;
  max-width: 790px;
  margin: 0 auto;
  margin-bottom: 35px;
`;
