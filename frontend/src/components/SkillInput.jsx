import { useState } from "react";
import Icon from "./Icon.jsx";

// Tag-style input: type a skill and press Enter or comma.
export default function SkillInput({ value, onChange, placeholder = "Type a skill and press Enter", suggestions = [] }) {
  const [text, setText] = useState("");
  const has = (s) => value.some((v) => v.toLowerCase() === s.toLowerCase());

  function add(raw) {
    const parts = String(raw).split(",").map((s) => s.trim()).filter(Boolean);
    const next = [...value];
    for (const p of parts) if (!has(p) && !next.some((v) => v.toLowerCase() === p.toLowerCase())) next.push(p);
    onChange(next.slice(0, 40));
    setText("");
  }

  return (
    <div>
      <div className="chip-input">
        {value.map((s) => (
          <span key={s} className="chip primary">
            {s}
            <button type="button" aria-label={`Remove ${s}`} onClick={() => onChange(value.filter((v) => v !== s))}><Icon name="x" size={13} /></button>
          </span>
        ))}
        <input
          value={text}
          placeholder={value.length ? "Add more..." : placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); if (text.trim()) add(text); }
            else if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => text.trim() && add(text)}
        />
      </div>
      {suggestions.filter((s) => !has(s)).length > 0 && (
        <div className="chips" style={{ marginTop: 8 }}>
          {suggestions.filter((s) => !has(s)).slice(0, 12).map((s) => (
            <button type="button" key={s} className="chip" style={{ cursor: "pointer" }} onClick={() => add(s)}>
              <Icon name="plus" size={12} />{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
