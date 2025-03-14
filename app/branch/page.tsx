"use client"
import { Button } from "@/components/inputs";
import { useState } from "react";

export default function BranchPage() {
  const [val, setVal] = useState("");
  const [subfix, setSubfix] = useState("feature");
  const handleVal = (val: string) => {
    return subfix + "/" + val.trim().split(" ").map(item => item.trim()).filter(item => item !== "").join(" ").replaceAll(" ", "-").replaceAll('"', "").replaceAll("'", "").replaceAll("[", "").replaceAll("]", "-").toLowerCase()
  }

  const onCopy = async () => {
    await navigator.clipboard.writeText(handleVal(val))
  }

  return (
    <div>
      <label>Select </label>
      <select value={subfix} onChange={e => setSubfix(e.target.value)} >
        <option value={"feature"}>Feature</option>
      </select>
      <input value={val} onChange={(e) => setVal(e.target.value)} />
      <div>{handleVal(val)}</div>
      <Button label="Copy" onClick={onCopy} />
    </div>
  )
}
