import { useEffect, useState } from "react";

const TIME_SET = 20 * 60; // 20 minutes in seconds

type Status = "idle" | "running" | "paused";

function formatTime(time: number) {
  const tenths = Math.max(Math.ceil(time * 10 - 1e-6), 0);
  const minutes = Math.floor(tenths / 600);
  const seconds = Math.floor((tenths % 600) / 10);
  const frac = tenths % 10;

  if (minutes === 0) return `${seconds}.${frac}`;
  
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}.${frac}`;
};

export function Timers() {
  const [status, setStatus] = useState<Status>("idle");
  const [numTotalReps, setNumTotalReps] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0); // seconds passed
  const [repsDone, setRepsDone] = useState(0); // reps effectively done

  // Elapsed time counted from Date.now()
  useEffect(() => {
    if (status !== "running") return;

    let last = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const timePassed = (now - last) / 1000;
      last = now;

      setTimeElapsed((prev) => Math.min((prev + timePassed), TIME_SET));
    }, 50);
    
    return () => clearInterval(interval);
  }, [status]);

  // Finish when the set is over
  useEffect(() => {
    if (status === "running" && timeElapsed >= TIME_SET) setStatus("idle");
  }, [status, timeElapsed]);

  const n = numTotalReps;
  const numReps = n > 0 ? Math.min(Math.floor((timeElapsed * n) / TIME_SET), n) : 0; // n > 0 check is to avoid NaN values displayed
  const repEnd = n > 0 ? (Math.min(numReps + 1, n) * TIME_SET) / n : 0;
  const timeRep = Math.max(repEnd - timeElapsed, 0);
  const timeSet = Math.max(TIME_SET - timeElapsed, 0);

  function handleNumTotalRepsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const value = Math.max(Math.floor(Number(raw)) || 0, 0);
    const clamped = Math.min(value, TIME_SET);
    
    setNumTotalReps(clamped);
    setTimeElapsed(0);
    setRepsDone(0);
  };

  function handleStart() {
    if (numTotalReps < 1) return;

    setTimeElapsed(0);
    setStatus("running");
    setRepsDone(0);
  };

  function handlePause() {
    setStatus("paused");
  };

  function handleResume() {
    setStatus("running");
  }

  function handleReset() {
    setStatus("idle");
    setTimeElapsed(0);
    setRepsDone(0);
  };

  return (
    <main className="min-h-screen bg-[#023047] text-paper flex flex-col items-center gap-6 p-10">
      <h1 className="text-xl text-[#FFB703] font-bold">Workout Timer</h1>
      {status === "idle" && (
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
            value={numTotalReps || ""}
            placeholder="100"
            onChange={handleNumTotalRepsChange}
          />
        </form>
      )}

      <div className="flex gap-4">
        {status === "idle" && (
          <button 
            className="bg-blue-500 enabled:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-40 disabled:cursor-not-allowed" 
            onClick={handleStart} 
            disabled={numTotalReps < 1}
          >
            Start
          </button>
        )}
        {status === "running" && (
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={handlePause}
          >
            Pause
          </button> 
        )}
        {status === "paused" && (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleResume}
          >
            Resume
          </button>
        )}
        {status !== "idle" && (
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleReset}
          >
            Reset
          </button>
        )}
      </div>

      {status !== "idle" && (
        <>
          <h2 className="text-3xl">Your Reps</h2>
          <div className="flex gap-4 items-center">
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setRepsDone(prev => Math.max(prev - 1, 0))}
            >
              - 1
            </button>
            <h3 className="text-xl font-extrabold tabular-nums">{repsDone}</h3>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setRepsDone(prev => prev + 1)}
            >
              + 1
            </button>
          </div>
        </>
      )}

      {status !== "idle" && (
        <>
          <p className="text-xl font-extrabold tabular-nums">Reps: {numReps} / {numTotalReps}</p>
          <p className="text-xl font-extrabold tabular-nums">Reps Done: {repsDone}</p>
          <p className="text-xl font-extrabold tabular-nums">Rep Time: {formatTime(timeRep)}</p>
          <p className="text-xl font-extrabold tabular-nums">Set Time: {formatTime(timeSet)}</p>
        </>
      )}
    </main>
  );
};