import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { MAX_REPS, formatDate, type WorkoutType, TYPES } from "./utils";


export default function Done() {
    const navigate = useNavigate();
    const initialReps = useLocation().state as number | null ?? 0;

    const [reps, setReps] = useState(initialReps);
    const [now] = useState(() => new Date());
    const [type, setType] = useState<WorkoutType>("none");

    const [loadingSave, setLoadingSave] = useState(false); // For future backend
    const [errorSave, setErrorSave] = useState(false);
    
    // Sends user back to main page if there are no reps
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
            const entry = { id: crypto.randomUUID(), date: now.toISOString(), reps: reps, type: type }
            const saved = JSON.parse(localStorage.getItem("workout-sets") ?? "[]");
            const sortedData = [entry, ...saved]
                .sort((a, b) => b.date.localeCompare(a.date));

            localStorage.setItem("workout-sets", JSON.stringify(sortedData));
        } catch {
            setErrorSave(true);
            setLoadingSave(false);
            return;
        }

        navigate("/history", { replace: true });
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
                    className="field w-30 text-2xl text-center font-bold"
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
            <div
                role="radiogroup"
                aria-labelledby="type-label"
                className="flex flex-wrap items-center justify-center gap-2"
            >
                <span id="type-label" className="text-(color:--muted)">Type:</span>
                <div className="flex gap-2">
                    {TYPES.map(item => (
                    <label
                        key={item.value}
                        className="btn btn-sm inline-flex cursor-pointer items-center bg-(color:--surface) text-(color:--muted) has-checked:bg-(color:--accent) has-checked:text-(color:--on-accent) hover:brightness-110"
                    >
                        <input
                            type="radio"
                            name="type"
                            value={item.value}
                            checked={type === item.value}
                            onChange={() => setType(item.value)}
                            className="sr-only"
                        />
                        {item.label}
                    </label>
                    ))}
                </div>
            </div>

            <p className="text-(color:--muted) text-center">
                Save <span className="font-bold text-(color:--text)">{reps}</span> 
                {reps === 1 ? " rep" : " reps"} on {formatDate(now)}?</p>

            <div className="flex flex-col items-center gap-5">
                {!loadingSave && (
                    <button
                        className="btn btn-lg btn-accent"
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
                    className="btn btn-sm btn-muted"
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