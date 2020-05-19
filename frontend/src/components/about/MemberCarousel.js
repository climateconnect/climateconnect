import React from "react";
import Member from "./Member";
import Carousel from "react-multi-carousel";
import { useTheme } from "@material-ui/core/styles";

export default function MemberCarousel({ members }) {
  const theme = useTheme();
  const responsive = {
    desktop: {
      breakpoint: { max: 5000, min: theme.breakpoints.values.md },
      items: 3
    },
    tablet: {
      breakpoint: { max: theme.breakpoints.values.md, min: theme.breakpoints.values.sm },
      items: 2
    },
    mobile: {
      breakpoint: { max: theme.breakpoints.values.sm, min: 0 },
      items: 1
    }
  };

  return (
    <Carousel
      responsive={responsive}
      autoPlay={true}
      autoPlaySpeed={3000}
      keyBoardControl={true}
      infinite={true}
    >
      {members.map((member, index) => (
        <div key={index}>
          <Member member={member} />
        </div>
      ))}
    </Carousel>
  );
}
