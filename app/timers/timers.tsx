import { useEffect, useState } from "react";

const TIME_SET = 10 * 20; // 20 minutes in seconds

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
    <main className="min-h-screen bg-(color:--background) flex flex-col items-center gap-12 p-10">
      <h1 className="text-2xl text-(color:--muted) font-semibold">Workout Timer</h1>
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
            className="bg-(color:--surface) text-(color:--text) placeholder:text-(color:--muted) rounded-full outline-none focus-visible:ring-2 focus-visible:ring-(color:--accent) px-3 py-1 w-21"
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

        <section className="flex flex-col items-center gap-2 tabular-nums">
          <p className="text-(color:--text) text-7xl font-extrabold">
            {n > 0 ? formatTime(timeRep) : "---"}
          </p>
          <div className="flex gap-6 text-(color:--muted)">
            <span>{n > 0 ? `Rep ${Math.min(numReps + 1, n)} of ${n}` : "Pick a rep amount"}</span>
            {n > 0 && <span>{formatTime(timeSet)} left</span>}
          </div>
          <div className="h-2 w-55 rounded-full bg-(color:--surface)">
            <div
              className="h-full rounded-full bg-(color:--muted)"
              style={{ width: `${(timeElapsed / TIME_SET) * 100}%` }}
            />
          </div>
        </section>

        {status !== "idle" && (
          <section>
            <div className="flex flex-col justify-center items-center gap-2">
              <h2 className="text-xl text-(color:--muted)">Your Reps</h2>
              <div className="flex gap-4 items-center w-50 justify-between">
                <button
                  className="flex justify-center items-center bg-(color:--surface) hover:brightness-110 size-9 rounded-full"
                  onClick={() => setRepsDone(prev => Math.max(prev - 1, 0))}
                >
                  <span className="block h-1 w-4 rounded-full bg-current" />
                </button>
                <p className="text-(color:--text) text-5xl font-bold tabular-nums">{repsDone}</p>
                <button
                  className="flex justify-center items-center bg-(color:--accent) hover:brightness-110 text-(color:--on-accent) size-9 rounded-full"
                  onClick={() => setRepsDone(prev => prev + 1)}
                >
                  <span className="relative block h-1 w-4 rounded-full bg-current before:absolute before:left-1/2 before:top-1/2 before:h-4 before:w-1 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-current" />
                </button>
              </div>
            </div>
          </section>
      )}

      <div className="flex flex-col items-center gap-5">
        {status === "idle" && (
          <button 
            className="bg-(color:--accent) hover:brightness-110 text-(color:--on-accent) text-lg w-25 py-3 font-bold rounded-full enabled:hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed" 
            onClick={handleStart} 
            disabled={numTotalReps < 1}
          >
            Start
          </button>
        )}
        {status === "running" && (
          <button
            className="bg-(color:--accent) hover:brightness-110 text-(color:--on-accent) text-lg w-25 py-3 font-bold rounded-full" 
            onClick={handlePause}
          >
            Pause
          </button> 
        )}
        {status === "paused" && (
          <button
            className="bg-(color:--accent) hover:brightness-110 text-(color:--on-accent) text-lg w-25 py-3 font-bold rounded-full" 
            onClick={handleResume}
          >
            Resume
          </button>
        )}
        {status !== "idle" && (
          <button
            className="bg-(color:--surface) hover:brightness-110 text-(color:--muted) text-sm w-15 font-bold py-2 rounded-full"
            onClick={handleReset}
          >
            Reset
          </button>
        )}
      </div>  
    </main>
  );
};