import { useState ,useEffect, useRef} from 'react'
import axios from 'axios'
import { use } from 'react'
import fs from 'fs'
import path from "path";
import Typewriter from 'typewriter-effect';
import Navbar from './components/navbar';


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
  const [timeleft,setTimeLeft] = useState(10)
  const [polls,setPoll] = useState([[0],[0],[0],[0]])
  const [stillNarrating,setStillNarrating] = useState(false)

  const handleTextChange = (e) => {
    setText(e.target.value);
  };
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
        setText("")
      }
  
    }
  // Initial Generation of Options for the story
  useEffect(() => {
    if(Initializaed.current === false){
      GenerateOptions(storyParts.join(" "));
      Initializaed.current = true;
    }
    setLoading(false);
  },[]);

  //when audioUrl change is detetced, audio is played,
  //request to delete audio file is sent
  //Options are now set to be rendered on screen
  //Timer is set to start with setTimeLeft()
  useEffect(() => {
    if (!audioUrl) return;
      const newAudio = new Audio(audioUrl);
      const handleAudioEnd = async () => {
        console.log('Audio finished. Sending request to delete file...');
        deleteAudioUrl(audioUrl)
        setLoading(false);
        setTimeLeft(30)
      };
      newAudio.play()
      .then(() => console.log("Audio is playing..."))
      .catch((err) => console.error("Audio play error:", err));

      newAudio.onended = handleAudioEnd;
      
  }, [audioUrl]);
  

  //when the storyParts change, this useEffect is triggered to
  //fetchstory and GenerateOptions from api functions
  useEffect(() => {
    if (fetchTriggeredRef.current === true) {
      fetchStory(storyParts.join(" "),userChoice);
      GenerateOptions(storyParts.join(" "));
    }
    if (storyParts.length > 10) {
      storyParts.shift(); // Remove the first part if length exceeds 5
    }
    generateTTS()
  }, [storyParts])
  
  //FetchStory API
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
      
      fetchTriggeredRef.current = false;
      
    }
  };


  const handleChange = (event) => {
    setInput(event.target.value);
  };

  //Generate TTS API call
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
  const handleClick = () => {
    let detectedValue = null;
    if(input > 4){
      alert("Invalid choice")
      return;
    }else if (input.includes("1")) {
      detectedValue = 1;
    } else if (input.includes("2")) {
      detectedValue = 2;
    } else if (input.includes("3")) {
      detectedValue = 3;
    } else if (input.includes("4")) {
      detectedValue = 4;
    }
      console.log("Detected Value:", detectedValue); // Log before updating state

      setPoll((prevPolls) =>
        prevPolls.map((poll, i) =>
          i === detectedValue-1 ? [poll[0] + 1] : poll
        )
      );
  };

const handlePollEnd = ()=>{
  console.log('Submit poll, call api to generate next chapter')
  const flattenedPolls = polls.flat();

    let max = 0
    for(let i = 0;i<flattenedPolls.length;i++){
      if(flattenedPolls[i] > max){
        max = i
      }
    }
    console.log(options[max])
    setUserChoice(options[max]);
    setStoryParts((prevStoryParts) => [
      ...prevStoryParts,
    ])
    setInput(""); // Clear input after processing
    setStory("")
    setOptions([])
    setPoll([[0],[0],[0],[0]])
    fetchTriggeredRef.current = true
}

useEffect(()=>{
  if (timeleft === null) return;
  if (timeleft <= 0) {
    handlePollEnd();
    return;
  }
  const timer = setInterval(() => {
    setTimeLeft((prevTime)=> prevTime -1)
  }, 1000);
  return () => clearInterval(timer);
 
},[timeleft])


  return (
    <>
    <div className='text-white'>
      <Navbar/>
      <h1 className='light text-center'>Test Interactive Story</h1>
    
    {loading ? (
        <div>
            <div className=' d-flex justify-content-center'>
      <div className='w-50 bg-danger'>
        <h5 className=' text-[#00df9a]'>Story</h5>
      <Typewriter
        options={{
        strings: [story],
        autoStart: true,
        loop: true,
        delay: 65,
        pauseFor:900000,
        wrapperClassName:' text-[#00df9a]'
        }}
      />
      </div>
    
      <div className=' text-[#00df9a]'>Image</div>
    </div>
        </div>
      ) : options.length > 0 ? (
        
      <div className=''>
        <div className=''>
          <h2 className='text-[#00df9a]'>Time Left to Vote:</h2>
          <h2 className=''> {timeleft}</h2>
        </div>
        <table className="">
        <thead >
          <tr className="" >
            <th scope="">#</th>
            <th scope="">Choices</th>
            <th scope="">Votes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="">1</th>
            <td>{options[0]}</td>
            <td className=' '>{polls[0]}</td>
          </tr>
          <tr>
            <th scope="">2</th>
            <td>{options[1]}</td>
            <td className=''>{polls[1]}</td>
          </tr>
          <tr>
            <th scope="">3</th>
            <td >{options[2]}</td>
            <td className=''>{polls[2]}</td>
          </tr>
          <tr>
            <th scope="">4</th>
            <td >{options[3]}</td>
            <td className=''>{polls[3]}</td>
          </tr>
        </tbody>
      </table>
      </div>
      ) : (
        <p>No items available</p>
      )}


    </div>
    <div className='text-[#00df9a] '>
        <input
            type="text"
            value={input}
            onChange={handleChange}
            placeholder="Enter something..."
            className="r"
        />
        <button type="button" className="" onClick={handleClick}>Enter</button>
        </div>
    
    </>
  )
}

export default App
