import React from "react";
import styled from "styled-components";
import Link from "next/link";
import FA from "react-fontawesome";

const InfoLink = ({ data }) => (
  <LinkContainer>
    <h2>
      <Link href={data.href} target="_blank" rel="noopener noreferrer">
        <a>
          <FA name={data.icon} />
          {data.text}
        </a>
      </Link>
    </h2>
  </LinkContainer>
);

export default InfoLink;

const LinkContainer = styled.div`
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
