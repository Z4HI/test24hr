import React from "react";
import Typewriter from "typewriter-effect";
import ImageComponent from "./ImageComponent";

export const Story_image = ({ story, imageURL }) => {
  return (
    <div>
      <div className="flex p-4 h-120">
        <div className="w-[70%] %">
          <h5 className=" text-[#00df9a] text-center text-2xl">Story:</h5>
          <Typewriter
            options={{
              strings: [story],
              autoStart: true,
              loop: true,
              delay: 65,
              pauseFor: 900000,
              wrapperClassName: " text-[#00df9a]",
            }}
          />
        </div>

        <div className=" text-[#00df9a] w-[30%] ">
          <h5 className=" text-[#00df9a] text-center">
            <ImageComponent imageURL={imageURL} />
          </h5>
        </div>
      </div>
    </div>
  );
};
