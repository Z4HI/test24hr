import { useState ,useEffect, useRef} from 'react'
import axios from 'axios'
import { use } from 'react'
import fs from 'fs'
import path from "path";

function App() {

  const [story,setStory] = useState('Tell me a story, the protagonists name is Adam and he lives in a quiet forest. He is tasked with taking on a quest to ...')
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storyParts, setStoryParts] = useState([story]);
  const Initializaed = useRef(false);
  const [userChoice, setUserChoice] = useState("")
  const [input, setInput] = useState("");
  const fetchTriggeredRef = useRef(false)
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);


  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  useEffect(() => {
    if (!audioUrl) return;
      const newAudio = new Audio(audioUrl);
      const handleAudioEnd = async () => {
        console.log('Audio finished. Sending request to delete file...');
        deleteAudioUrl(audioUrl)
      };
      newAudio.play()
      .then(() => console.log("Audio is playing..."))
      .catch((err) => console.error("Audio play error:", err));

      newAudio.onended = handleAudioEnd;
      
  }, [audioUrl]);
  
  useEffect(() => {
    if(Initializaed.current === false){
      GenerateOptions(storyParts.join(" "));
      Initializaed.current = true;
    }
  },[]);

  useEffect(() => {
    if (fetchTriggeredRef.current === true) {
      fetchStory(storyParts.join(" "),userChoice);
      GenerateOptions(storyParts.join(" "));
    }
    if (storyParts.length > 5) {
      storyParts.shift(); // Remove the first part if length exceeds 5
    }
    generateTTS()
  }, [storyParts])
  

  //Initial call to get the first part of the story when the page loads
  const GenerateOptions = async (currentStory) => {
    try {
      const response = await axios.post('http://localhost:5000/GenerateOptions',{
        story: currentStory
      })
      .then((response) =>{
        setOptions(response.data.split(/\d+\.\s*/).filter(Boolean))
      })
    } catch (error) {
      console.error("Error fetching data:", error);
    }finally {
      setLoading(false)
      setText("")
    }

  }

  const fetchStory = async (storyparts,userChoice) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/GenerateNextChapter", {
        prompt: {currentStory :storyParts,userchoice : userChoice} // Pass current story + user choice
      }).then((response) =>{
        setStory(response.data)
        setStoryParts([...storyParts, response.data])
        setText(response.data)
      })
    } catch (error) {
      console.error("Error fetching story:", error);
    } finally {
      setLoading(false);
      fetchTriggeredRef.current = false;
      
    }
  };


  const handleChange = (event) => {
    setInput(event.target.value);
  };


  const handleClick = () => {
    let detectedValue = null;
    if(input > 3){
      alert("Invalid choice")
      return;
    }else if (input.includes("1")) {
      detectedValue = 1;
    } else if (input.includes("2")) {
      detectedValue = 2;
    } else if (input.includes("3")) {
      detectedValue = 3;
    }
      console.log("Detected Value:", detectedValue); // Log before updating state

      if(detectedValue !== null){
        setUserChoice(options[detectedValue - 1]);
        setStoryParts((prevStoryParts) => [
          ...prevStoryParts
        ])
      setInput(""); // Clear input after processing
      setStory("")
      setOptions([])
  };
  fetchTriggeredRef.current = true;
  };

  const generateTTS = async () => {
    if (!text) return;
    try {
      const response = await fetch('http://localhost:5000/generate-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text:text }),
      })
     const data = await response.json()
     setAudioUrl(data.AudioUrl)
      console.log(data.AudioUrl)
    } catch (error) {
      console.error('Error generating TTS:', error);
    }
  }

  const deleteAudioUrl= async (audioUrl)=>{
    const filename = audioUrl.split('/').pop();
    try {
      const response = await axios.delete("http://localhost:5000/DeleteAudioUrl", {
        data: { filePath: filename },  // Send JSON data in body
        headers: { "Content-Type": "application/json" }  // Ensure JSON content type
      });
  
      console.log("Response from server:", response.data);
    } catch (error) {
      console.error("Error deleting audio file:", error);
    }
  }
  return (
    <>
    <div>
      <h1>OPEN AI API - gpt 3.5 responses</h1>
      <h3>Story:</h3>
      <button >Play Audio</button>
      <h4>{story}</h4>
      <h3>Options</h3>
    {loading ? (
        <p>Loading...</p>
      ) : options.length > 0 ? (
        <ul>
          {options.map((option, index) => (
            <li key={index}>{index+1}. {option}</li>
          ))}
        </ul>
      ) : (
        <p>No items available</p>
      )}

    </div>
    <div>
    <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Enter something..."
        className="border p-2 w-full rounded-md"
      />
    <button onClick={handleClick}>Enter</button>
    </div>
    
    </>
  )
}

export default App
