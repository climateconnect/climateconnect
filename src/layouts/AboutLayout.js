import React from "react";
import styled from "styled-components";

const info = [
  {
    icon: "plus.svg",
    title: "Share your actions",
    text:
      "Have you ever wondered what is being done about climate change in your region and globally? By enabling climate protectors to share their project on Climate Connect, we will provide a comprehensive up to date list of what is being done about climate change."
  },
  {
    icon: "collaboration.svg",
    title: "Measure the impact",
    text:
      "You are thinking about getting involved in climate action, but don't know how you can be most effective? On Climate Connect each action will have an impact score. This way you can find out how you can maximize your impact"
  },
  {
    icon: "collaboration.svg",
    title: "Collaborate globally",
    text:
      "Climate change is a global issue. This is why we want to create a global network of climate protectors. Climate Connect allows you to see where you can make the biggest difference with your personal strengths and skillset. If you're already working on an impactful project, you will be able to find collaborators here."
  },
  {
    icon: "lightbulb.svg",
    title: "Get inspired",
    text:
      "On Climate Connect, you will find blue prints of high-impact projects, that you will be able to replicate at your location. This way you can very easily find the most effective thing you can work on with your specific skillset."
  },
  {
    icon: "eye.svg",
    title: "Maximum transparency",
    text:
      "Our code is available open source and can be found in our Github repository. The impact algorithm will be open source and the community will make the decisions on how to develop it further."
  }
];

function renderBubbles(info) {
  return info.map(i => {
    return <InfoBubble data={i} key={i.title}></InfoBubble>;
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
      <LinkContainer>
        <img src="/file.svg"></img>
        <h2>Read our onepager</h2>
      </LinkContainer>
      <LinkContainer>
        <img src="/blueprint.svg"></img>
        <h2>View our interactive prototype</h2>
      </LinkContainer>
      <LinkContainer>
        <img src="/algorithm.svg"></img>
        <h2>View our FAQ section for in depth explanations</h2>
      </LinkContainer>
      <h1>Join our Team</h1>
      {/*Photo Grid*/}
      <h2>Currently all members of our team are volunteers.</h2>
      <h1>Interested in joining us in accelerating climate action worldwide?</h1>
      <h1>Contact us at contact@climateconnect.earth</h1>
    </Container>
  );
}

const InfoBubble = ({ data }) => (
  <InfoBubbleContainer>
    <Bubble>
      <IconWrapper>
        <img src={data.icon}></img>
      </IconWrapper>
    </Bubble>
    <h3>{data.title}</h3>
    <InfoText>{data.text}</InfoText>
  </InfoBubbleContainer>
);

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

const InfoText = styled.div`
  max-width: 350px;
  color: #484848;
  margin: 0 auto;
  font-size: 20px;
`;

const HeadlineText = styled.div`
  color: white;
  font-size: 85px;
  border: 5px solid white;
  display: inline-block;
  margin: 0 auto;
  padding: 69.5px;
  padding-right: 291.5px;
  padding-left: 291.5px;
`;

const Container = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  h1 {
    font-weight: 500;
    font-size: 52px;
  }
  h2 {
    font-size: 32px;
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
  display: table-cell;
  vertical-align: middle;
  margin: 0 auto;
`;

const LinkContainer = styled.div`
  img {
    display: inline-block;
    margin-right: 10px;
  }
  h2 {
    display: inline-block;
  }
`;
