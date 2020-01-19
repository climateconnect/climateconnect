import React from "react";
import { Icon } from "@material-ui/core";

const InfoBubble = ({ data }) => (
  <div>
    <div>
      <div>
        <Icon name={data.icon} />
      </div>
    </div>
    <h3>{data.title}</h3>
    <div>{data.text}</div>
  </div>
);

export default InfoBubble;

/*const InfoBubbleContainer = styled.div`
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
  line-height: 30px;
  margin-top: 20px;
`;

const IconWrapper = styled.div`
  width: 75px;
  font-size: 45px;
  display: table-cell;
  vertical-align: middle;
  margin: 0 auto;
`;*/
