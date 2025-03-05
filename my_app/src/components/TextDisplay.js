import React from "react";

const TextDisplay = ({ sentence }) => {
  return (
    <div className="sentence-container">
      <p className="sentence">{sentence}</p>
    </div>
  );
};

export default TextDisplay;
