import React from "react";
import Link from "next/link";
import { Icon } from "@material-ui/core";

const InfoLink = ({ data }) => (
  <div>
    <h2>
      <Link href={data.href} target="_blank" rel="noopener noreferrer">
        <a>
          <Icon name={data.icon} />
          {data.text}
        </a>
      </Link>
    </h2>
  </div>
);

export default InfoLink;

/*const LinkContainer = styled.div`
  margin: 0 auto;
  margin-bottom: 50px;
  span {
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
`;*/
