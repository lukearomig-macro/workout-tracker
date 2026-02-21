import { useState, useEffect } from "react";

const PROTOCOL = {
  days: [
    {
      id: 1,
      name: "Day 1",
      label: "PUSH — Heavy Chest + Abs",
      color: "#FF4D1C",
      exercises: [
        { name: "Incline DB Press", sets: 4, repRange: [6, 10], rpe: "8 / last RPE 9" },
        { name: "Machine Chest Press", sets: 3, repRange: [8, 12], rpe: "8 / last rest-pause RPE 10" },
        { name: "Low-to-High Cable Fly", sets: 3, repRange: [12, 15], rpe: "9 all sets" },
        { name: "Seated DB Shoulder Press", sets: 3, repRange: [8, 12], rpe: "8 / last RPE 9" },
        { name: "Cable Lateral Raise", sets: 4, repRange: [12, 20], rpe: "9 all sets" },
        { name: "Rope Triceps Pushdown", sets: 3, repRange: [10, 15], rpe: "9 all sets" },
        { name: "Ab Wheel Rollout", sets: 4, repRange: [6, 12], rpe: "8" },
        { name: "Reverse Crunch / Pelvic Tilt", sets: 4, repRange: [10, 15], rpe: "8" },
        { name: "Pallof Press", sets: 3, repRange: [20, 30], rpe: "7" },
      ],
    },
    {
      id: 2,
      name: "Day 2",
      label: "PULL — Width + Thickness",
      color: "#0EA5E9",
      exercises: [
        { name: "Neutral-Grip Pulldown", sets: 4, repRange: [8, 12], rpe: "8 / last RPE 9" },
        { name: "Chest-Supported Row", sets: 4, repRange: [8, 12], rpe: "8 / last RPE 9" },
        { name: "Barbell or Machine Row", sets: 3, repRange: [8, 10], rpe: "8 / last RPE 9" },
        { name: "Single-Arm Lat Pull-In", sets: 3, repRange: [10, 15], rpe: "9 all sets" },
        { name: "Reverse Pec Deck", sets: 4, repRange: [12, 20], rpe: "9 all sets" },
        { name: "Incline DB Curl", sets: 3, repRange: [8, 12], rpe: "8 / last RPE 9" },
        { name: "Cable Curl", sets: 2, repRange: [12, 15], rpe: "9 all sets" },
      ],
    },
    {
      id: 3,
      name: "Day 3",
      label: "LEGS — Balanced + Abs",
      color: "#22C55E",
      exercises: [
        { name: "Smith Squat", sets: 4, repRange: [8, 12], rpe: "8 / last RPE 9" },
        { name: "Romanian Deadlift", sets: 4, repRange: [8, 12], rpe: "8 / last RPE 9" },
        { name: "Bulgarian Split Squat", sets: 3, repRange: [8, 12], rpe: "8" },
        { name: "Leg Extension", sets: 3, repRange: [12, 20], rpe: "9 all sets" },
        { name: "Lying Leg Curl", sets: 3, repRange: [10, 15], rpe: "9 all sets" },
        { name: "Calf Raise", sets: 4, repRange: [8, 12], rpe: "9" },
        { name: "Weighted Floor Crunch", sets: 4, repRange: [8, 12], rpe: "8" },
        { name: "Ab Wheel Rollout", sets: 3, repRange: [6, 12], rpe: "8" },
        { name: "Pallof Press", sets: 3, repRange: [20, 30], rpe: "7" },
      ],
    },
    {
      id: 4,
      name: "Day 4",
      label: "PUSH — Volume + Shape",
      color: "#FF4D1C",
      exercises: [
        { name: "Incline Smith Press", sets: 4, repRange: [8, 12], rpe: "8 / last RPE 9" },
        { name: "Flat DB Press", sets: 3, repRange: [8, 12], rpe: "8 / last RPE 9" },
        { name: "High-to-Low Cable Fly", sets: 3, repRange: [12, 15], rpe: "9 all sets" },
        { name: "Cable Fly", sets: 3, repRange: [12, 15], rpe: "9 all sets" },
        { name: "DB Lateral Raise", sets: 4, repRange: [15, 25], rpe: "9 all sets" },
        { name: "Overhead Triceps Extension", sets: 3, repRange: [10, 15], rpe: "9 all sets" },
      ],
    },
    {
      id: 5,
      name: "Day 5",
      label: "ARMS + DELTS",
      color: "#A855F7",
      exercises: [
        { name: "Cable Lateral Raise", sets: 5, repRange: [12, 20], rpe: "9 all sets" },
        { name: "Face Pull", sets: 3, repRange: [15, 20], rpe: "7 — health not strength" },
        { name: "EZ-Bar Curl", sets: 4, repRange: [8, 12], rpe: "8 / last RPE 9" },
        { name: "Dip Machine", sets: 4, repRange: [8, 12], rpe: "8 / last RPE 9" },
        { name: "Hammer Curl", sets: 3, repRange: [10, 15], rpe: "9 all sets" },
        { name: "Rear-Delt Cable Fly", sets: 4, repRange: [15, 20], rpe: "9 all sets" },
      ],
    },
    {
      id: 6,
      name: "Day 6",
      label: "REST / Zone 2 Only",
      color: "#64748B",
      exercises: [],
    },
  ],
};

const DELOAD_FREQUENCY = 5;

const defaultStorage = () => ({
  sessions: [],
  weekCount: 1,
  sessionCount: 0,
});

function loadData() {
  try {
    const raw = localStorage.getItem("workout_tracker_v1");
    return raw ? JSON.parse(raw) : defaultStorage();
  } catch {
    return defaultStorage();
  }
}

function saveData(data) {
  try {
    localStorage.setItem("workout_tracker_v1", JSON.stringify(data));
  } catch {}
}

function getDeloadStatus(weekCount) {
  return weekCount % DELOAD_FREQUENCY === 0;
}

function checkProgressionFlag(sessions, exerciseName, repRange) {
  const relevantSessions = sessions
    .filter(s => s.entries.some(e => e.exerciseName === exerciseName))
    .slice(-3);
  if (relevantSessions.length < 2) return null;
  const last2 = relevantSessions.slice(-2);
  const hitTop = last2.every(session => {
    const entry = session.entries.find(e => e.exerciseName === exerciseName);
    if (!entry) return false;
    return entry.sets.every(set => parseInt(set.reps) >= repRange[1]);
  });
  if (hitTop) {
    const lastEntry = last2[last2.length - 1].entries.find(e => e.exerciseName === exerciseName);
    return lastEntry?.sets?.[0]?.weight || null;
  }
  return null;
}

export default function WorkoutTracker() {
  const [data, setData] = useState(loadData);
  const [view, setView] = useState("home");
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [setInputs, setSetInputs] = useState([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [coachAlerts, setCoachAlerts] = useState([]);

  useEffect(() => { saveData(data); }, [data]);

  useEffect(() => {
    const alerts = [];
    const isDeload = getDeloadStatus(data.weekCount);
    if (isDeload) {
      alerts.push({ type: "deload", message: `Week ${data.weekCount} is a DELOAD week. Drop all weights to 60%, halve your sets, stop at RPE 6. This is mandatory.` });
    }
    PROTOCOL.days.forEach(day => {
      day.exercises.forEach(ex => {
        const flag = checkProgressionFlag(data.sessions, ex.name, ex.repRange);
        if (flag) {
          alerts.push({ type: "progress", message: `${ex.name}: Hit top of rep range two sessions in a row at ${flag}lbs. Add the smallest increment next session.` });
        }
      });
    });
    setCoachAlerts(alerts);
  }, [data]);

  function startSession(dayId) {
    const day = PROTOCOL.days.find(d => d.id === dayId);
    if (!day || day.exercises.length === 0) return;
    const entries = {};
    day.exercises.forEach(ex => { entries[ex.name] = []; });
    setActiveSession({ dayId, entries });
    setCurrentExerciseIdx(0);
    setSetInputs([{ weight: "", reps: "", rpe: "" }]);
    setSessionComplete(false);
    setView("log");
  }

  function addSet() {
    setSetInputs(prev => [...prev, { weight: "", reps: "", rpe: "" }]);
  }

  function updateSet(idx, field, value) {
    setSetInputs(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  }

  function removeSet(idx) {
    setSetInputs(prev => prev.filter((_, i) => i !== idx));
  }

  function saveExerciseAndNext() {
    const day = PROTOCOL.days.find(d => d.id === activeSession.dayId);
    const ex = day.exercises[currentExerciseIdx];
    const validSets = setInputs.filter(s => s.reps);
    const updatedSession = {
      ...activeSession,
      entries: { ...activeSession.entries, [ex.name]: validSets }
    };
    setActiveSession(updatedSession);
    if (currentExerciseIdx < day.exercises.length - 1) {
      setCurrentExerciseIdx(prev => prev + 1);
      setSetInputs([{ weight: "", reps: "", rpe: "" }]);
    } else {
      finishSession(updatedSession);
    }
  }

  function finishSession(session) {
    const today = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const entries = Object.entries(session.entries).map(([exerciseName, sets]) => ({ exerciseName, sets }));
    const newSession = { date: today, dayId: session.dayId, entries };
    setData(prev => {
      const newSessionCount = prev.sessionCount + 1;
      const newWeekCount = newSessionCount % 6 === 0 ? prev.weekCount + 1 : prev.weekCount;
      return { ...prev, sessions: [...prev.sessions, newSession], sessionCount: newSessionCount, weekCount: newWeekCount };
    });
    setSessionComplete(true);
  }

  function resetAll() {
    if (window.confirm("Reset ALL data? This cannot be undone.")) {
      setData(defaultStorage());
      setView("home");
    }
  }

  const activeDay = activeSession ? PROTOCOL.days.find(d => d.id === activeSession.dayId) : null;
  const activeEx = activeDay ? activeDay.exercises[currentExerciseIdx] : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0A",
      color: "#F0EDE8",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      maxWidth: 480,
      margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 0", borderBottom: "1px solid #1E1E1E" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 4, color: "#555", textTransform: "uppercase", marginBottom: 4 }}>Training Log</div>
            <div style={{ fontSize: 26, fontWeight: "normal", letterSpacing: -0.5 }}>Coach Protocol</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Week</div>
            <div style={{ fontSize: 32, color: getDeloadStatus(data.weekCount) ? "#FF4D1C" : "#F0EDE8", fontWeight: "bold", lineHeight: 1 }}>{data.weekCount}</div>
            {getDeloadStatus(data.weekCount) && <div style={{ fontSize: 9, color: "#FF4D1C", letterSpacing: 2, textTransform: "uppercase" }}>DELOAD</div>}
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 20 }}>
          {[["home", "Program"], ["history", "History"], ["coach", `Coach${coachAlerts.length > 0 ? ` (${coachAlerts.length})` : ""}`]].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              flex: 1, background: "none", border: "none",
              borderBottom: `2px solid ${view === v ? "#FF4D1C" : "transparent"}`,
              color: view === v ? "#F0EDE8" : "#555", padding: "10px 0", cursor: "pointer",
              fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontFamily: "inherit",
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: 20 }}>

        {/* HOME */}
        {view === "home" && (
          <div>
            {coachAlerts.length > 0 && (
              <div style={{ background: "#1A0800", border: "1px solid #FF4D1C", borderRadius: 8, padding: 14, marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "#FF4D1C", textTransform: "uppercase", marginBottom: 8 }}>Coach Alerts</div>
                {coachAlerts.slice(0, 2).map((a, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#FF8C5A", marginBottom: 4, lineHeight: 1.5 }}>→ {a.message}</div>
                ))}
                {coachAlerts.length > 2 && (
                  <div style={{ fontSize: 12, color: "#555", marginTop: 6, cursor: "pointer" }} onClick={() => setView("coach")}>+{coachAlerts.length - 2} more in Coach tab</div>
                )}
              </div>
            )}

            <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 14 }}>Select Day</div>
            {PROTOCOL.days.map(d => {
              const lastSession = [...data.sessions].reverse().find(s => s.dayId === d.id);
              const isSelected = selectedDay === d.id;
              return (
                <div key={d.id}
                  onClick={() => setSelectedDay(isSelected ? null : d.id)}
                  style={{
                    background: isSelected ? "#141414" : "#0F0F0F",
                    border: `1px solid ${isSelected ? d.color : "#1E1E1E"}`,
                    borderRadius: 10, padding: "14px 16px", marginBottom: 10,
                    cursor: "pointer", transition: "all 0.15s",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: 3, color: d.color, textTransform: "uppercase", marginBottom: 3 }}>{d.name}</div>
                      <div style={{ fontSize: 15 }}>{d.label}</div>
                    </div>
                    {lastSession && <div style={{ fontSize: 10, color: "#444" }}>{lastSession.date}</div>}
                  </div>
                  {d.exercises.length > 0 && isSelected && (
                    <div style={{ marginTop: 14 }}>
                      {d.exercises.map(ex => (
                        <div key={ex.name} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1A1A1A", fontSize: 13 }}>
                          <span>{ex.name}</span>
                          <span style={{ color: "#555", fontSize: 11 }}>{ex.sets}×{ex.repRange[0]}–{ex.repRange[1]}</span>
                        </div>
                      ))}
                      <button onClick={(e) => { e.stopPropagation(); startSession(d.id); }} style={{
                        marginTop: 16, width: "100%", background: d.color, border: "none",
                        color: "#fff", padding: "13px 0", borderRadius: 8, fontSize: 13,
                        letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
                      }}>
                        {getDeloadStatus(data.weekCount) ? "Start Deload Session" : "Start Session"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <button onClick={resetAll} style={{
              marginTop: 24, width: "100%", background: "none", border: "1px solid #2A2A2A",
              color: "#444", padding: "10px 0", borderRadius: 8, fontSize: 11,
              letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit"
            }}>Reset All Data</button>
          </div>
        )}

        {/* LOG */}
        {view === "log" && activeSession && !sessionComplete && activeEx && (
          <div>
            {getDeloadStatus(data.weekCount) && (
              <div style={{ background: "#1A0800", border: "1px solid #FF4D1C", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12, color: "#FF8C5A" }}>
                ⚡ DELOAD WEEK — 60% weight, half sets, RPE 6 max.
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: activeDay.color, textTransform: "uppercase", marginBottom: 4 }}>
                {activeDay.label} — {currentExerciseIdx + 1} of {activeDay.exercises.length}
              </div>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{activeEx.name}</div>
              <div style={{ fontSize: 12, color: "#555" }}>
                {activeEx.sets} sets × {activeEx.repRange[0]}–{activeEx.repRange[1]} reps · RPE {activeEx.rpe}
              </div>
            </div>

            <div style={{ height: 3, background: "#1A1A1A", borderRadius: 3, marginBottom: 20 }}>
              <div style={{ height: 3, background: activeDay.color, borderRadius: 3, width: `${(currentExerciseIdx / activeDay.exercises.length) * 100}%`, transition: "width 0.3s" }} />
            </div>

            {(() => {
              const prev = [...data.sessions].reverse().find(s => s.dayId === activeSession.dayId && s.entries.some(e => e.exerciseName === activeEx.name));
              const prevEntry = prev?.entries.find(e => e.exerciseName === activeEx.name);
              if (!prevEntry || prevEntry.sets.length === 0) return null;
              return (
                <div style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: "#444", textTransform: "uppercase", marginBottom: 8 }}>Last time · {prev.date}</div>
                  {prevEntry.sets.map((s, i) => (
                    <div key={i} style={{ fontSize: 13, color: "#888", marginBottom: 3 }}>
                      Set {i + 1}: {s.weight ? `${s.weight}lbs` : "BW"} × {s.reps} reps {s.rpe ? `@ RPE ${s.rpe}` : ""}
                    </div>
                  ))}
                </div>
              );
            })()}

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 12 }}>Log Sets</div>
              {setInputs.map((s, i) => (
                <div key={i} style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Set {i + 1}</div>
                    {setInputs.length > 1 && (
                      <button onClick={() => removeSet(i)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 18, padding: 0 }}>×</button>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginBottom: 4 }}>WEIGHT (lbs)</div>
                      <input
                        placeholder="0"
                        value={s.weight}
                        onChange={e => updateSet(i, "weight", e.target.value)}
                        inputMode="decimal"
                        style={{ width: "100%", background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 6, padding: "10px 12px", color: "#F0EDE8", fontSize: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginBottom: 4 }}>REPS</div>
                      <input
                        placeholder="0"
                        value={s.reps}
                        onChange={e => updateSet(i, "reps", e.target.value)}
                        inputMode="numeric"
                        style={{ width: "100%", background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 6, padding: "10px 12px", color: "#F0EDE8", fontSize: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                    <div style={{ width: 72 }}>
                      <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginBottom: 4 }}>RPE</div>
                      <input
                        placeholder="8"
                        value={s.rpe}
                        onChange={e => updateSet(i, "rpe", e.target.value)}
                        inputMode="decimal"
                        style={{ width: "100%", background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 6, padding: "10px 12px", color: "#F0EDE8", fontSize: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addSet} style={{
                background: "none", border: "1px dashed #2A2A2A", color: "#555",
                padding: "9px 0", width: "100%", borderRadius: 6, cursor: "pointer",
                fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontFamily: "inherit"
              }}>+ Add Set</button>
            </div>

            <button onClick={saveExerciseAndNext} style={{
              width: "100%", background: activeDay.color, border: "none", color: "#fff",
              padding: "14px 0", borderRadius: 8, fontSize: 13, letterSpacing: 2,
              textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
            }}>
              {currentExerciseIdx < activeDay.exercises.length - 1 ? "Save & Next →" : "Finish Session"}
            </button>

            <button onClick={() => { setView("home"); setActiveSession(null); }} style={{
              marginTop: 12, width: "100%", background: "none", border: "none",
              color: "#444", padding: "10px 0", fontSize: 12, cursor: "pointer", fontFamily: "inherit"
            }}>Cancel Session</button>
          </div>
        )}

        {/* SESSION COMPLETE */}
        {view === "log" && sessionComplete && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <div style={{ fontSize: 22, marginBottom: 8 }}>Session logged.</div>
            <div style={{ fontSize: 13, color: "#555", marginBottom: 32 }}>Data saved. Coach alerts updated.</div>
            {coachAlerts.length > 0 && (
              <div style={{ background: "#1A0800", border: "1px solid #FF4D1C", borderRadius: 8, padding: 16, marginBottom: 24, textAlign: "left" }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "#FF4D1C", textTransform: "uppercase", marginBottom: 10 }}>Coach Alerts</div>
                {coachAlerts.map((a, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#FF8C5A", marginBottom: 8, lineHeight: 1.5 }}>→ {a.message}</div>
                ))}
              </div>
            )}
            <button onClick={() => { setView("home"); setActiveSession(null); setSessionComplete(false); }} style={{
              width: "100%", background: "#FF4D1C", border: "none", color: "#fff",
              padding: "14px 0", borderRadius: 8, fontSize: 13, letterSpacing: 2,
              textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
            }}>Back to Program</button>
          </div>
        )}

        {/* HISTORY */}
        {view === "history" && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 16 }}>Session History</div>
            {data.sessions.length === 0 && <div style={{ color: "#444", fontSize: 14 }}>No sessions logged yet.</div>}
            {[...data.sessions].reverse().map((session, idx) => {
              const day = PROTOCOL.days.find(d => d.id === session.dayId);
              const [open, setOpen] = useState(false);
              return (
                <div key={idx} style={{ border: "1px solid #1E1E1E", borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
                  <div onClick={() => setOpen(!open)} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: 3, color: day?.color || "#555", textTransform: "uppercase", marginBottom: 3 }}>{session.date}</div>
                      <div style={{ fontSize: 15 }}>{day?.label || "Unknown"}</div>
                    </div>
                    <div style={{ color: "#444", fontSize: 18 }}>{open ? "−" : "+"}</div>
                  </div>
                  {open && (
                    <div style={{ padding: "0 16px 16px" }}>
                      {session.entries.map((entry, ei) => (
                        <div key={ei} style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{entry.exerciseName}</div>
                          {entry.sets.map((s, si) => (
                            <div key={si} style={{ fontSize: 13, color: "#555", marginBottom: 3 }}>
                              Set {si + 1}: {s.weight ? `${s.weight}lbs` : "BW"} × {s.reps} reps {s.rpe ? `@ RPE ${s.rpe}` : ""}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* COACH */}
        {view === "coach" && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 16 }}>Coach Dashboard</div>

            <div style={{ background: "#111", border: `1px solid ${getDeloadStatus(data.weekCount) ? "#FF4D1C" : "#1E1E1E"}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 6 }}>Current Week</div>
                  <div style={{ fontSize: 28 }}>Week {data.weekCount}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 4 }}>Next Deload</div>
                  <div style={{ fontSize: 20, color: "#FF4D1C" }}>Week {Math.ceil(data.weekCount / DELOAD_FREQUENCY) * DELOAD_FREQUENCY}</div>
                </div>
              </div>
              {getDeloadStatus(data.weekCount) && (
                <div style={{ marginTop: 12, background: "#1A0800", borderRadius: 6, padding: "10px 12px", fontSize: 13, color: "#FF8C5A", lineHeight: 1.5 }}>
                  Deload week. 60% weights, half sets, RPE 6 cap.
                </div>
              )}
            </div>

            {coachAlerts.length === 0 ? (
              <div style={{ background: "#0A1A0A", border: "1px solid #1E3A1E", borderRadius: 10, padding: 16, fontSize: 14, color: "#22C55E" }}>
                ✓ No alerts. Stay the course.
              </div>
            ) : (
              coachAlerts.map((a, i) => (
                <div key={i} style={{
                  background: a.type === "deload" ? "#1A0800" : "#0A100A",
                  border: `1px solid ${a.type === "deload" ? "#FF4D1C" : "#22C55E"}`,
                  borderRadius: 10, padding: 16, marginBottom: 12
                }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: a.type === "deload" ? "#FF4D1C" : "#22C55E", textTransform: "uppercase", marginBottom: 8 }}>
                    {a.type === "deload" ? "Deload Required" : "Add Weight"}
                  </div>
                  <div style={{ fontSize: 14, color: "#F0EDE8", lineHeight: 1.6 }}>{a.message}</div>
                </div>
              ))
            )}

            <div style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 10, padding: 16, marginTop: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 14 }}>Stats</div>
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28 }}>{data.sessions.length}</div>
                  <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Sessions</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28 }}>{data.weekCount}</div>
                  <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Weeks</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28 }}>{Math.floor(data.sessions.length / 5)}</div>
                  <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Deloads</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
