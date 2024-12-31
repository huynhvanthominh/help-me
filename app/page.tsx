"use client"
import React from "react";

export default function Home() {
  const [val, setVal] = React.useState("");
  const handleVal = (val: string) => {
    return val.replaceAll(" ", "-").replaceAll('"', "").replaceAll("'", "").replaceAll("[", "").replaceAll("]", "").toLowerCase()
  }
  return (
    <div>
      <input value={val} onChange={(e) => setVal(e.target.value)} />
      <div>{handleVal(val)}</div>
    </div>
  );
}
