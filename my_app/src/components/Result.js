import React from "react";

const Result = ({ result }) => {
  return (
    <div className="result">
      <p>Words per minute: {result.wpm}</p>
      <p>Accuracy: {result.accuracy}%</p>
      <p>Time taken: {result.timeTaken}s</p>
    </div>
  );
};

export default Result;
