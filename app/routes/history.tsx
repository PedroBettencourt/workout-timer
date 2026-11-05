import { useEffect, useMemo, useState } from "react"
import { MAX_REPS, dateFromISO, dateToISO, formatDate, type WorkoutType, TYPES, TYPE_LABELS } from "./utils";
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

interface WorkoutSetProps {
    id: string;
    date: string;
    reps: number;
    type?: WorkoutType;
}

// For the chart
const shortDate = new Intl.DateTimeFormat("en-gb", { day: "2-digit", month: "2-digit" });

const TYPE_COLORS: Record<WorkoutType, string> = {
    none: "var(--muted)",
    sixcount: "var(--accent)",
    navyseals: "var(--text)",
};

export default function History() {
    const [data, setData] = useState<WorkoutSetProps[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [errorData, setErrorData] = useState(false);
    const [editingIds, setEditingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("workout-sets") ?? "[]");
            setData(saved);
        } catch {
            setErrorData(true);
        } finally {
            setLoadingData(false);
        }
    }, []);

    function startEdit(id: string) {
        setEditingIds(prev => new Set(prev).add(id));
    };

    function finishEdit(id: string) {
        setEditingIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        })
    };

    function handleDelete(id: string) {
        if (!window.confirm("Delete this workout?")) return;

        const editedData = data.filter(item => item.id !== id);
        setData(editedData);
        localStorage.setItem("workout-sets", JSON.stringify(editedData));
    }

    function handleSave(id: string, reps: number, date: string, type: WorkoutType) {
        const editedData = data
            .map(item => item.id === id ? { ...item, reps, date, type } : item)
            .sort((a, b) => b.date.localeCompare(a.date));

        setData(editedData);
        localStorage.setItem("workout-sets", JSON.stringify(editedData));
        finishEdit(id);
    };

    // For the chart
    const chartData = useMemo(() => 
        [...data]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((item) => ({ 
                date: new Date(item.date).getTime(), 
                [item.type ?? "none"]: item.reps 
            })),
        [data]
    );

    // Multiple entries on the same day make only 1 tick
    const dayTicks = [...new Map(chartData.map(
        p => [shortDate.format(p.date), p.date]
    )).values()];

    return (
        <section className="flex flex-col justify-center items-center gap-6">
            {loadingData && <p>Loading...</p>}
            {errorData && <p>Error. Try again</p>}
            
            <h2 className="text-4xl font-semibold text-(color:--muted)">History</h2>

            {!loadingData && !errorData && data.length === 0 && (
                <p className="text-(color:--muted)">No workouts saved yet.</p>
            )}
            
            {data.length > 0 && (
                <>
                    {/* table */}
                    <h3 className="text-2xl font-semibold text-(color:--muted)">Table</h3>
                    <section className="grid grid-cols-[5rem_15rem_8rem_12rem] items-center gap-2">
                        <div className="col-span-4 grid grid-cols-subgrid text-sm font-semibold text-(color:--muted)">                    
                            <span className="text-center">Reps</span>
                            <span className="px-3">Date</span>
                            <span className="text-center">Type</span>
                            <span />
                        </div>
                        {data.map(item => (
                            (editingIds.has(item.id) ?
                                <EditRow 
                                    key={item.id} 
                                    item={item} 
                                    onCancel={() => finishEdit(item.id)}
                                    onSave={(reps: number, date: string, type: WorkoutType) => handleSave(item.id, reps, date, type)}
                                />
                            :
                                <div className="col-span-4 grid grid-cols-subgrid items-center" key={item.id}>
                                    <span className="text-center">{item.reps}</span>
                                    <span className="px-3 text-(color:--muted)">{formatDate(new Date(item.date))}</span>
                                    <span className="text-center text-(color:--muted)">{TYPE_LABELS[item.type ?? "none"]}</span>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            className="btn btn-sm btn-muted"
                                            onClick={() => startEdit(item.id)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-muted text-red-400"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )
                        ))}
                    </section>

                    {/* graph */}
                    <h3 className="text-2xl font-semibold text-(color:--muted)">Graph</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 8, right: 24, bottom: 24, left: 8 }}>
                                <CartesianGrid stroke="var(--surface)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    type="number"
                                    scale="time"
                                    domain={["dataMin", "dataMax"]}
                                    ticks={dayTicks}
                                    tickFormatter={(date) => shortDate.format(date)}
                                    stroke="var(--muted)"
                                    tickLine={false}
                                    tickMargin={8}
                                >
                                    <Label value="Date" position="bottom" offset={8} fill="var(--muted)" />
                                </XAxis>
                                <YAxis 
                                    stroke="var(--muted)" 
                                    allowDecimals={false} 
                                    tickLine={false}
                                    tickMargin={8}
                                >
                                    <Label value="Reps" position="insideLeft" angle={-90} style={{ textAnchor: "middle" }} fill="var(--muted)" />
                                </YAxis>
                                <Tooltip
                                    labelFormatter={(date) => formatDate(new Date(Number(date)))}
                                    contentStyle={{ background: "var(--surface)", border: "none", borderRadius: 12 }}
                                />
                                <Legend position="top" offset={6} />
                                {TYPES.map(type => (
                                    <Line 
                                        key={type.value} 
                                        type="monotone" 
                                        dataKey={type.value} 
                                        name={type.label}
                                        stroke={TYPE_COLORS[type.value]} 
                                        strokeWidth={2} 
                                        connectNulls
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </section>
    )
}

function EditRow({ 
    item, 
    onCancel, 
    onSave,
} : { 
    item: WorkoutSetProps; 
    onCancel: () => void;
    onSave: (reps: number, date: string, type: WorkoutType) => void;
}) {
    const [reps, setReps] = useState(item.reps);
    const [date, setDate] = useState(dateFromISO(item.date));
    const [type, setType] = useState<WorkoutType>(item.type ?? "none");

    function handleRepsChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value;
        const value = Math.max(Math.floor(Number(raw)) || 0, 0);
        setReps(Math.min(value, MAX_REPS));
    }

    function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        setDate(e.target.value);
    }

    function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setType(e.target.value as WorkoutType);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (reps < 1 || !date) return; 
        onSave(reps, dateToISO(date), type);
    }

    return(
        <form 
            className="col-span-4 grid grid-cols-subgrid items-center"  
            onSubmit={handleSubmit}
        >
            <input
                className="field text-center font-bold"
                type="number"
                min={1}
                max={MAX_REPS}
                step={1}
                autoComplete="off"
                value={reps || ""}
                placeholder={String(item.reps)}
                onChange={handleRepsChange}
            />
            <input 
                className="field"
                type="datetime-local"
                value={date} 
                onChange={handleDateChange} 
            />
            <select className="field" value={type} onChange={handleTypeChange}>
                {TYPES.map((i) => (
                    <option key={i.value} value={i.value}>{i.label}</option>
                ))}
            </select>
            <div className="flex justify-end gap-2">
                <button
                    type="submit"
                    className="btn btn-sm btn-accent"
                >
                    Save
                </button>
                <button
                    type="button"
                    className="btn btn-sm btn-muted"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}