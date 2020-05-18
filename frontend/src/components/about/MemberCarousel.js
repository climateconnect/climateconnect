import React from "react";
import Member from "./Member";
import Carousel from "react-multi-carousel";

export default function MemberCarousel({ members }) { 

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };

  return(
    <Carousel responsive={responsive}>
      {
        members.map((member, index) =>(
          <div key={index}>
            <Member member={member} />
          </div>
        )) 
      }   
    </Carousel>
  )  
}