import React from "react";
import styled from "styled-components";

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

export default InfoBubble;

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

const InfoText = styled.div`
  max-width: 350px;
  color: #484848;
  margin: 0 auto;
  font-size: 20px;
`;

const IconWrapper = styled.div`
  width: 75px;
  font-size: 45px;
  display: table-cell;
  vertical-align: middle;
  margin: 0 auto;
`;
