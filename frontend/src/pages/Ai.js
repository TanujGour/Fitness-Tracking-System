import { useState } from "react";

function AI() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const handleAsk = () => {
    setResponse("AI suggestion feature coming soon...");
  };

  return (
    <div className="page-container">
      <h2>AI Coach</h2>

      <input
        placeholder="Ask something..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={handleAsk}>Ask AI</button>

      <p>{response}</p>
    </div>
  );
}

export default AI;