function App() {
  const handleTimeUp = () => {};

  return (
    <div>
      <Timer duration={120} onTimeUp={handleTimeUp} />
    </div>
  );
}

export default App;
