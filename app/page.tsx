"use client"
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="font-bold text-9xl">Menu</div>
      <ul className="flex flex-col items-start font-bold text-2xl">
        <li>
          <Link href={"/branch"}>- Branch</Link>
        </li>
        <li>
          <Link href={"/database"}>- Database</Link>
        </li>
        <li>
          <Link href={"/log-work"}>- Log work (Jira)</Link>
        </li>
        <li>
          <Link href={"/seed-data"}>- Seed data (PostgreSql)</Link>
        </li>
        <li>
          <Link href={"/format-query"}>- Format query</Link>
        </li>

      </ul>
    </div>
  );
}
