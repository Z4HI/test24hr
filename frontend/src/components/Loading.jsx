import React from "react";
import Typewriter from "typewriter-effect";
const Loading = () => {
  return (
    <div className="text-center">
      <Typewriter
        options={{
          strings: ["Options Loading", "Get ready to vote"],
          autoStart: true,
          loop: true,
          delay: 90,
          pauseFor: 20000,
          wrapperClassName: " text-white",
        }}
      />
    </div>
  );
};

export default Loading;
