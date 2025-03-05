import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css"; // Ensure to import the CSS file for styling

// Random word generator function based on difficulty with two sets per difficulty
const getRandomWords = (difficulty, count) => {
  const easyWordsSet1 = ["cat", "dog", "apple", "ball", "tree"];
  const easyWordsSet2 = ["fish", "sun", "moon", "book", "pen"];
  
  const mediumWordsSet1 = ["pencil", "guitar", "library", "mountain", "window"];
  const mediumWordsSet2 = ["planet", "bicycle", "butterfly", "castle", "telephone"];
  
  const hardWordsSet1 = ["submarine", "philosophy", "equilibrium", "microphone", "astronomy"];
  const hardWordsSet2 = ["trapezoid", "magnetism", "neuroscience", "cylinder", "parallelogram"];

  let words;
  
  // Select random set based on difficulty
  if (difficulty === "easy") {
    words = Math.random() > 0.5 ? easyWordsSet1 : easyWordsSet2;
  } else if (difficulty === "medium") {
    words = Math.random() > 0.5 ? mediumWordsSet1 : mediumWordsSet2;
  } else {
    words = Math.random() > 0.5 ? hardWordsSet1 : hardWordsSet2;
  }

  // Generate a random sentence of 'count' words
  let randomWords = [];
  for (let i = 0; i < count; i++) {
    randomWords.push(words[Math.floor(Math.random() * words.length)]);
  }
  return randomWords.join(" ");
};

const App = () => {
  const [inputText, setInputText] = useState("");
  const [timeLeft, setTimeLeft] = useState(30); // Default to 30 seconds
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [isTimerEnded, setIsTimerEnded] = useState(false); // Track if timer ended
  const [result, setResult] = useState(null);
  const [sentence, setSentence] = useState(getRandomWords("medium", 10)); // Default sentence with medium difficulty
  const [timerOption, setTimerOption] = useState(30); // Default timer option
  const [difficulty, setDifficulty] = useState("medium"); // Default difficulty level
  const inputRef = useRef(null); // This is the reference to the input element

  const [rank, setRank] = useState(""); // State to hold the rank

  // Handle timer option change
  const handleTimerChange = (event) => {
    const selectedTimer = parseInt(event.target.value, 10);
    setTimerOption(selectedTimer);
    setTimeLeft(selectedTimer);
  };

  // Handle difficulty level change
  const handleDifficultyChange = (level) => {
    setDifficulty(level);
    setSentence(getRandomWords(level, timerOption === 10 ? 5 : timerOption === 20 ? 10 : 15));
  };

  // Start the test
  const startTest = () => {
    setIsTestStarted(true);
    setInputText("");
    setSentence(getRandomWords(difficulty, timerOption === 10 ? 5 : timerOption === 20 ? 10 : 15)); // Adjust sentence based on difficulty and timer
    setTimeLeft(timerOption);
    setIsTestCompleted(false);
    setIsTimerEnded(false);
    setResult(null);
    setRank(""); // Reset rank when the test starts
  };

  // Memoize the calculateAccuracy function
  const calculateAccuracy = useCallback((text) => {
    const correctChars = [...text].filter((char, index) => char === sentence[index]).length;
    return Math.round((correctChars / sentence.length) * 100);
  }, [sentence]); // Only depend on sentence

  // Memoize the calculateResult function to avoid re-creating it unnecessarily
  const calculateResult = useCallback(() => {
    const words = sentence.split(" ").length;
    const timeTaken = timerOption - timeLeft;
    const wpm = Math.round((words / timeTaken) * 60);
    const accuracy = calculateAccuracy(inputText);
    setResult({ wpm, accuracy, timeTaken });

    // Assign rank based on WPM
    let calculatedRank = "";
    if (wpm >= 40) {
      calculatedRank = "A";
    } else if (wpm >= 30) {
      calculatedRank = "B";
    } else {
      calculatedRank = "C";
    }
    setRank(calculatedRank); // Set the rank
  }, [sentence, timeLeft, timerOption, inputText, calculateAccuracy]); // Include calculateAccuracy as a dependency

  // Memoize the displayResults function
  const displayResults = useCallback(() => {
    if (isTimerEnded && !isTestCompleted) {
      setIsTestCompleted(true);
      calculateResult();
    }
  }, [isTimerEnded, isTestCompleted, calculateResult]);

  // Timer countdown logic
  useEffect(() => {
    let timer;
    if (isTestStarted && timeLeft > 0 && !isTestCompleted && !isTimerEnded) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isTestCompleted) {
      setIsTimerEnded(true); // Timer has ended
    }
    return () => clearInterval(timer);
  }, [isTestStarted, timeLeft, isTestCompleted, isTimerEnded]);

  // Focus the input element after the test starts (ensure the DOM is ready)
  useEffect(() => {
    if (isTestStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTestStarted]);

  // Handle input changes and capture "Enter" key to end test
  const handleInputChange = (e) => {
    if (!isTestCompleted) {
      setInputText(e.target.value);
    }
  };

  // Function to handle when the Enter key is pressed
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Check if the typed text matches the sentence
      if (inputText.trim() === sentence.trim()) {
        setIsTestCompleted(true);
        calculateResult(); // Calculate and show results immediately
      }
    }
  };

  // Function to display results after the timer ends if not completed earlier
  useEffect(() => {
    displayResults(); // Display results when timer ends
  }, [displayResults]); // Include displayResults in the dependency array

  return (
    <div className="App">
      <div className="timer-selection">
        <h1>WordScramb Test</h1>  {/* Updated the heading */}
        <select onChange={handleTimerChange} value={timerOption} className="timer-select">
          <option value={10}>10 Seconds</option>
          <option value={20}>20 Seconds</option>
          <option value={30}>30 Seconds</option>
        </select>
      </div>

      <div className="difficulty-selection">
        <button onClick={() => handleDifficultyChange("easy")}>Easy</button>
        <button onClick={() => handleDifficultyChange("medium")}>Medium</button>
        <button onClick={() => handleDifficultyChange("hard")}>Hard</button>
      </div>

      <div className="test-container">
        {!isTestStarted ? (
          <div>
            <button onClick={startTest} className="start-button">Start Test</button>
          </div>
        ) : (
          <div>
            <div className="sentence-display">
              <p>{sentence}</p>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown} // Listen for Enter key press
              placeholder="Start typing..."
              disabled={isTestCompleted}
              className="input-field"
            />
            <div className="timer">
              <p>{timeLeft} seconds left</p>
            </div>
            {isTestCompleted && <div className="results">
              <h2>Test Completed!</h2>
              <p>Words per minute: {result.wpm}</p>
              <p>Accuracy: {result.accuracy}%</p>
              <p>Time Taken: {result.timeTaken} seconds</p>
              <p>Rank: {rank}</p> {/* Display Rank */}
            </div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
