import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";

const MAX_REPS = 20 * 60; // 1200 reps

// Created once, formats in the user's own locale (e.g. "Fri, 30 Oct, 14:03")
const dateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default function Done() {
    const navigate = useNavigate();
    const initialReps = useLocation().state as number | null ?? 0;

    const [reps, setReps] = useState(initialReps);
    const [now] = useState(() => new Date());

    const [loadingSave, setLoadingSave] = useState(false); // For future backend
    const [errorSave, setErrorSave] = useState(false);
    
    // Opened directly (no data from the timer): send them back
    if (!initialReps) return <Navigate to="/" replace />;

    function handleRepsChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value;
        const value = Math.max(Math.floor(Number(raw)) || 0, 0);
        setReps(Math.min(value, MAX_REPS));
    }

    function handleSave() {
        if (reps < 1) return;
        setErrorSave(false);

        try {
            setLoadingSave(true);
            const entry = { id: crypto.randomUUID(), date: now.toISOString(), reps: reps }
            const saved = JSON.parse(localStorage.getItem("workout-sets") ?? "[]");
            localStorage.setItem("workout-sets", JSON.stringify([entry, ...saved]))
        } catch {
            setErrorSave(true);
            setLoadingSave(false);
            return;
        }

        navigate("/", { replace: true });
    }

    function handleRetry() {
        navigate("/", { replace: true });
    }


    return (
        <section className="flex flex-col items-center gap-12 tabular-nums">
            <h2 className="text-4xl font-semibold text-(color:--muted)">Workout done!</h2>
            
            <form 
                className="flex items-center gap-2" 
                onSubmit={(e) => {
                    e.preventDefault(); 
                    handleSave();
                }}
            >
                <label htmlFor="reps" className="text-(color:--muted)">Reps:</label>
                <input
                    className="bg-(color:--surface) text-(color:--text) text-2xl text-center font-bold placeholder:text-(color:--muted) rounded-full outline-none focus-visible:ring-2 focus-visible:ring-(color:--accent) px-3 py-1 w-30"
                    id="reps"
                    type="number"
                    min={1}
                    max={MAX_REPS}
                    step={1}
                    autoComplete="off"
                    value={reps || ""}
                    placeholder="100"
                    onChange={handleRepsChange}
                />
            </form>

            <p className="text-(color:--muted) text-center">
                Save <span className="font-bold text-(color:--text)">{reps}</span> 
                {reps === 1 ? " rep" : " reps"} on {dateFormat.format(now)}?</p>

            <div className="flex flex-col items-center gap-5">
                {!loadingSave && (
                    <button
                    className="bg-(color:--accent) enabled:hover:brightness-110 text-(color:--on-accent) text-lg w-25 py-3 font-bold rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={handleSave}
                    disabled= {reps < 1}
                    >
                        Save
                    </button>
                )}
                {loadingSave && (
                    <p>Saving...</p>
                )}
                <button
                    className="bg-(color:--surface) hover:brightness-110 text-(color:--muted) text-sm w-15 font-bold py-2 rounded-full"
                    onClick={handleRetry}
                    >
                    Retry
                </button>
                {errorSave && (
                    <p role="alert" className="text-center text-(color:--muted)">Error while saving. Try again</p>
                )}
            </div>

        </section>
    );
}