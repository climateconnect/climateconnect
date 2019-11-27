import React from "react";
import styled from "styled-components";

const info = [
  {
    icon:null,
    title:'Share your actions',
    text:'test'
  },
  {
    icon:null,
    title:'Measure the impact',
    text:'test'
  },
  {
    icon:null,
    title:'Collaborate globally',
    text:'test'
  },
  {
    icon:null,
    title:'Get inspired',
    text:'test'
  },
  {
    icon:null,
    title:'Maximum transparency',
    text:'test'
  }
]

function renderBubbles(info) {
  return info.map(i=> {
    return <InfoBubble data={i} key={i.title}></InfoBubble>
  })
}

export default function about() {
  return (
    <Container>
      <AboutImage src="/about_background.png">
      </AboutImage>
      <h2>We are an international team of volunteers building a non-profit climate action webplatform</h2>
      <h1>Our goal is to help you fight climate change most effectively</h1>        
      <BubbleGrid>
        {renderBubbles(info)}
      </BubbleGrid>
      <h1>Find out more</h1>
      <h2>Read our onepager</h2>
      <h2>View our interactive prototype</h2>
      <h2>View our FAQ section for in depth explanations</h2>
      <h1>Join our Team</h1>
      {/*Photo Grid*/}
      <h2>Currently all members of our team are volunteers.</h2>
      <h1>Interested in joining us in accelerating climate action worldwide?</h1>
      <h1>Contact us at contact@climateconnect.earth</h1>
    </Container>
  )
}

const InfoBubble = ({ data }) => (
  <div>
    <Bubble>

    </Bubble>
    <h3>{data.title}</h3>
    <div>{data.text}</div>
  </div>
)

const AboutImage = styled.img`
  height: 373px;
  width: 100%;
`;

const Container = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  text-align:center;
  h1 {
    font-weight: 500;
    font-size: 52px;
  }
  h2 {
    font-size: 32px;
  }
`;

const BubbleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 32px 24px;
  align-items: center;
  margin-bottom: 3rem;
`;

const Bubble = styled.div`
  border: 1px solid black;
  border-radius: 100%;
  width: 100px;
  height: 100px;
  margin: auto;
`;