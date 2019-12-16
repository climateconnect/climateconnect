import React from "react";
import styled from "styled-components";

export default function Button(props) {
  const { type, children } = props;
  return <StyledButton type={type}>{children}</StyledButton>;
}

const StyledButton = styled.button`
  align-self: center;
  cursor: pointer;
  text-align: center;

  ${({ type, theme }) => {
    switch (type) {
      case "big":
        return `
        background: ${theme.colors.primary};
        padding: 14px 84px;
        font-size: 1.5rem;
        color: ${theme.colors.white};
          `;

      case "outlined":
        return `
        margin: 8px auto 0;
        width: 120px;
        border: 1px solid ${theme.colors.primary};
        border-radius: 3px;
        font-size: 0.9rem;
          `;
    }
  }}
`;
