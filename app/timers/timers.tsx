import { useEffect, useLayoutEffect, useState } from "react";

const TIME_SET = 20 * 60; // 20 minutes in seconds

function repLength(reps: number) {
  return Math.round(TIME_SET / reps);
}

export function Timers() {
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [numTotalRepsInput, setNumTotalRepsInput] = useState("");
  const [numReps, setNumReps] = useState(0);
  const [numTotalReps, setNumTotalReps] = useState(0);
  const [timeRep, setTimeRep] = useState(0);
  const [timeSet, setTimeSet] = useState(TIME_SET);

  // Rep and Set intervals
  useEffect(() => {
    if (!started || paused) return;

    const interval = setInterval(() => {
      setTimeRep((prev) => prev - 1); 
      setTimeSet((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [started, paused]);

  // Rep completion
  useLayoutEffect(() => {
    if (!started || timeRep > 0) return;

    const next = numReps + 1;
    setNumReps(next);

    if (next >= numTotalReps) {
      setStarted(false); // last rep done
      return;
    }

    // Use remaining time to calculate next rep time
    setTimeRep(Math.round(timeSet / (numTotalReps - next)));
  }, [started, timeRep, numReps, numTotalReps, timeSet]);

  // Set completion
  useEffect(() => {
    if (started && timeSet <= 0) setStarted(false);
  }, [started, timeSet]);

  function handleNumTotalRepsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setNumTotalRepsInput(raw);

    const value = raw === "" ? 0 : Math.floor(Number(raw));
    const clamped = Math.min(Math.max(value, 1), TIME_SET);
    setNumTotalReps(clamped);

    setNumReps(0);
    setTimeSet(TIME_SET);
    setTimeRep(repLength(clamped));
  }
  
  function handleTimeFormat(time: number) {
    const t = Math.max(time, 0);
    const minutes = Math.floor(t / 60);
    const seconds = t % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  function handleStart() {
    if (numTotalReps < 1) return;
    setStarted(true);
    setPaused(false);

    setNumReps(0);
    setTimeSet(TIME_SET);
    setTimeRep(repLength(numTotalReps));
  };

  function handlePause() {
    setPaused(true);
  };

  function handleResume() {
    setPaused(false);
  }

  function handleReset() {
    setStarted(false);
    setNumReps(0);
    setTimeRep(0);
    setTimeSet(TIME_SET);
  };

  return (
    <main className="min-h-screen flex flex-col items-center gap-6 bg-neutral-900 text-white p-6">
      <h1 className="text-3xl font-bold">Workout Timer</h1>
      {!started && (
        <form 
          className="flex gap-2 items-center" 
          onSubmit={(e) => {
            e.preventDefault(); 
            handleStart();
          }}
        >
          <label htmlFor="numTotalReps">Rep Amount: </label>
          <input
            className="bg-neutral-800 text-white border border-neutral-700 rounded px-2 py-1 w-20"
            id="numTotalReps"
            type="number"
            min={1}
            max={TIME_SET}
            step={1}
            autoComplete="off"
            value={numTotalRepsInput}
            onChange={handleNumTotalRepsChange}
          />
        </form>
      )}
      <div className="flex gap-4">
        {!started && (
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
            onClick={handleStart} 
          >
            Start
          </button>
        )}
        {started && (
          <>
            {!paused ? 
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={handlePause}
              >
                Pause
              </button> 
            :
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleResume}
              >
                Resume
              </button>
            }
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleReset}
            >
              Reset
            </button>
          </>
        )}
      </div>
      <p className="text-xl font-extrabold tabular-nums">Reps: {numReps} / {numTotalReps}</p>
      <p className="text-xl font-extrabold tabular-nums">Rep Time: {timeRep}</p>
      <p className="text-xl font-extrabold tabular-nums">Set Time: {handleTimeFormat(timeSet)}</p>
    </main>
  );
};