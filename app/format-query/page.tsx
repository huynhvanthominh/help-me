/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from "react";

function formatSQL(query: string, values: any[]): string {
  return query?.replace(/\$(\d+)/g, (_, indexStr) => {
    const index = parseInt(indexStr, 10) - 1;
    const value = values[index];

    if (value === null || value === 'null' || value === undefined) {
      return 'NULL';
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return value.toString();
    }

    if (typeof value === 'string') {
      // Escape single quotes
      const escaped = value.replace(/'/g, "''");
      return `'${escaped}'`;
    }

    // For arrays or objects (if needed), fallback to JSON
    return JSON.stringify(value);
  });
}

export default function FormatQueryPage() {
  const [output, setOutput] = useState<string>('');
  const [input, setInput] = useState<string>(``);
  useEffect(() => {
    const [query, params] = (input.replaceAll('\n', '').split("[").filter(item => item.trim().length > 0).map(item => item.replaceAll("]", '').trim()));
    const prs = params?.split(",").map(item => item.replaceAll('\'', '').trim())
    const out = formatSQL(query, prs)
    setOutput(out);
    console.log("Formatted SQL:", out);
  }, [input])
  return (
    <div>
      <textarea value={input} onChange={e => setInput(e.target.value)} />
      <textarea defaultValue={output} />
    </div>
  )
}
