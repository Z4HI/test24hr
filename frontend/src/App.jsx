import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { use } from "react";
import fs from "fs";
import path from "path";
import Navbar from "./components/navbar";
import { Story_image } from "./components/story_image";
import Polling from "./components/polling";
import imageURL from "./assets/testIMG.webp";
import InputComponent from "./components/InputComponent";
import Loading from "./components/Loading";

function App() {
  const [story, setStory] = useState(
    "Tell me a story, the protagonists name is Adam and he lives in a quiet forest. He is tasked with taking on a quest to ..."
  );
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storyParts, setStoryParts] = useState([story]);
  const Initializaed = useRef(false);
  const [userChoice, setUserChoice] = useState("");
  const fetchTriggeredRef = useRef(false);
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [timeleft, setTimeLeft] = useState(30);
  const [polls, setPoll] = useState([[0], [0], [0], [0]]);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };
  //Initial call to get the first part of the story when the page loads
  const GenerateOptions = async (currentStory) => {
    try {
      const response = await axios
        .post("http://localhost:5000/GenerateOptions", {
          story: currentStory,
        })
        .then((response) => {
          setOptions(response.data.split(/\d+\.\s*/).filter(Boolean));
        });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setText("");
    }
  };
  // Initial Generation of Options for the story
  useEffect(() => {
    if (Initializaed.current === false) {
      GenerateOptions(storyParts.join(" "));
      Initializaed.current = true;
    }
    setLoading(false);
  }, []);

  //when audioUrl change is detetced, audio is played,
  //request to delete audio file is sent
  //Options are now set to be rendered on screen
  //Timer is set to start with setTimeLeft(100)
  useEffect(() => {
    if (!audioUrl) return;

    const newAudio = new Audio(audioUrl);
    const handleAudioEnd = () => {
      console.log("Audio finished. Sending request to delete file...");
      deleteAudioUrl(audioUrl);
      setLoading(false);
      setTimeLeft(30);
    };
    newAudio
      .play()
      .then(() => console.log("Audio is playing..."))
      .catch((err) => console.error("Audio play error:", err));

    newAudio.onended = handleAudioEnd;
  }, [audioUrl]);

  //when the storyParts change, this useEffect is triggered to
  //fetchstory and GenerateOptions from api functions
  useEffect(() => {
    if (fetchTriggeredRef.current === true) {
      fetchStory(storyParts.join(" "), userChoice);
      GenerateOptions(storyParts.join(" "));
    }
    if (storyParts.length > 10) {
      storyParts.shift(); // Remove the first part if length exceeds 5
    }
    generateTTS();
  }, [storyParts]);

  //FetchStory API
  const fetchStory = async (storyparts, userChoice) => {
    setLoading(true);
    try {
      const response = await axios
        .post("http://localhost:5000/GenerateNextChapter", {
          prompt: { currentStory: storyParts, userchoice: userChoice }, // Pass current story + user choice
        })
        .then((response) => {
          setStory(response.data);
          setStoryParts([...storyParts, response.data]);
          setText(response.data);
        });
    } catch (error) {
      console.error("Error fetching story:", error);
    } finally {
      fetchTriggeredRef.current = false;
    }
  };

  //Generate TTS API call
  const generateTTS = async () => {
    if (!text) return;
    try {
      const response = await fetch("http://localhost:5000/generate-tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text }),
      });
      const data = await response.json();
      setAudioUrl(data.AudioUrl);
    } catch (error) {
      console.error("Error generating TTS:", error);
    }
  };

  const deleteAudioUrl = async (audioUrl) => {
    const filename = audioUrl.split("/").pop();
    try {
      const response = await axios.delete(
        "http://localhost:5000/DeleteAudioUrl",
        {
          data: { filePath: filename }, // Send JSON data in body
          headers: { "Content-Type": "application/json" }, // Ensure JSON content type
        }
      );
    } catch (error) {
      console.error("Error deleting audio file:", error);
    }
  };

  const handlePollEnd = () => {
    console.log("Submit poll, call api to generate next chapter");
    const flattenedPolls = polls.flat();

    let max = 0;
    for (let i = 0; i < flattenedPolls.length; i++) {
      if (flattenedPolls[i] > max) {
        max = i;
      }
    }
    console.log(options[max]);
    setUserChoice(options[max]);
    setStoryParts((prevStoryParts) => [...prevStoryParts]);
    setStory("");
    setOptions([]);
    setPoll([[0], [0], [0], [0]]);
    fetchTriggeredRef.current = true;
  };

  useEffect(() => {
    if (timeleft === null) return;
    if (timeleft <= 0) {
      handlePollEnd();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeleft]);

  return (
    <>
      <div className="h-full text-white overflow-y-hidden">
        <Navbar />

        <Story_image story={story} imageURL={imageURL} />
        {loading ? (
          <Loading />
        ) : options.length > 0 ? (
          <>
            <Polling options={options} polls={polls} timeleft={timeleft} />
            <InputComponent setPoll={setPoll} />
          </>
        ) : (
          <p>Get ready to vote on the next chapter!</p>
        )}
      </div>
    </>
  );
}

export default App;
