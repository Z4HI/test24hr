import React from "react";
import { useState } from "react";

const InputComponent = ({ setPoll }) => {
  const [input, setInput] = useState("");

  const handleChange = (event) => {
    setInput(event.target.value);
  };
  const handleClick = () => {
    let detectedValue = null;
    if (input > 4) {
      alert("Invalid choice");
      return;
    } else if (input.includes("1")) {
      detectedValue = 1;
    } else if (input.includes("2")) {
      detectedValue = 2;
    } else if (input.includes("3")) {
      detectedValue = 3;
    } else if (input.includes("4")) {
      detectedValue = 4;
    }

    setPoll((prevPolls) =>
      prevPolls.map((poll, i) =>
        i === detectedValue - 1 ? [poll[0] + 1] : poll
      )
    );
    setInput("");
  };
  return (
    <div className=" w-full flex justify-center text-[#00df9a]">
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Enter something..."
        className="r"
      />
      <button type="button" className="ml-3" onClick={handleClick}>
        Enter
      </button>
    </div>
  );
};

export default InputComponent;
