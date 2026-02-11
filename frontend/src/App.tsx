import Timer from "./components/EnforcedTimer";

function App() {
  const handleTimeUp = () => {};

  return (
    <div>
      <header>
        <h2>Welcome to the Assessment </h2>
        <p>There are total</p>
      </header>
      <Timer duration={durationInMinutes} onTimeUp={handleTimeUp} />
    </div>
  );
}

export default App;
