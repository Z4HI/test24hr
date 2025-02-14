import React from "react";

const ImageComponent = ({ imageURL }) => {
  return (
    <div className="p-4">
      <img
        src={imageURL}
        alt="Local"
        className="w-full max-w-sm rounded-b-4xl shadow-md"
      />
    </div>
  );
};

export default ImageComponent;
