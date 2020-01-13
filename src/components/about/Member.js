import React from "react";
import styled from "styled-components";
import FA from "react-fontawesome";

const Member = ({ data }) => (
  <MemberInfo>
    <img src={"images/" + data.image} />
    <h2>{data.name}</h2>
    <Location>
      <FA name="map-marker-alt" />
      {data.location}
    </Location>
  </MemberInfo>
);

export default Member;

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
  span {
    margin-right: 5px;
  }
`;
