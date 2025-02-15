import React from "react";

const Polling = ({ options, polls, timeleft, winningIndex }) => {
  return (
    <div className="w-full flex justify-evenly">
      <div className="flex flex-col justify-center">
        <h2 className="text-[#00df9a] mx-auto">Time Left to Vote:</h2>
        <h2 className="text-4xl text-center "> {timeleft}</h2>
      </div>
      <table className="table w-200 ">
        <thead>
          <tr className="">
            <th scope="">#</th>
            <th scope="">Choices</th>
            <th scope="">Votes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="" className="w-20">
              1
            </th>
            <td className="h-10">- {options[0]}</td>
            <td
              className={`border border-black rounded-4xl font-bold text-center h-10 transition-all duration-500 ${
                0 === winningIndex
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {polls[0]}
            </td>
          </tr>
          <tr>
            <th scope="">2</th>
            <td className="h-10">- {options[1]}</td>
            <td
              className={`border border-black rounded-4xl font-bold text-center h-10 ${
                1 === winningIndex
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {polls[1]}
            </td>
          </tr>
          <tr>
            <th scope="">3</th>
            <td>- {options[2]}</td>
            <td
              className={`border border-black rounded-4xl  font-bold text-center h-10 ${
                2 === winningIndex
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {polls[2]}
            </td>
          </tr>
          <tr>
            <th scope="">4</th>
            <td>- {options[3]}</td>
            <td
              className={`border border-black rounded-4xl font-bold text-center h-11 ${
                3 === winningIndex
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {polls[3]}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Polling;
