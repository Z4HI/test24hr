import React from "react";

const Polling = ({ options, polls, timeleft }) => {
  return (
    <div className="w-full flex justify-evenly">
      <div className="flex flex-col justify-center">
        <h2 className="text-[#00df9a] mx-auto">Time Left to Vote:</h2>
        <h2 className="text-2xl text-center "> {timeleft}</h2>
      </div>
      <table className="table w-200">
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
            <td>- {options[0]}</td>
            <td className=" text-center">{polls[0]}</td>
          </tr>
          <tr>
            <th scope="">2</th>
            <td>- {options[1]}</td>
            <td className="text-center">{polls[1]}</td>
          </tr>
          <tr>
            <th scope="">3</th>
            <td>- {options[2]}</td>
            <td className="text-center">{polls[2]}</td>
          </tr>
          <tr>
            <th scope="">4</th>
            <td>- {options[3]}</td>
            <td className="text-center">{polls[3]}</td>
          </tr>
        </tbody>
      </table>
      <div className="bg-[#00df9a] rounded-4xl text-black font-bold p-4">
        <h1 className="text-center">Future Updates</h1>
        <ul>
          <li>-AI images based off of user story choices</li>
          <li>-</li>
        </ul>
      </div>
    </div>
  );
};

export default Polling;
