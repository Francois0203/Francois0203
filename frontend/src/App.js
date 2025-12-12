import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Hello React</h1>
      <button onClick={() => setCount(count + 1)}>
        You clicked {count} times.
      </button>
    </div>
  );
}

export default App;