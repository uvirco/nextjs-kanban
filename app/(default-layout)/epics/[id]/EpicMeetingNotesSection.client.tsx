"use client";

import React from "react";

interface EpicMeetingNotesSectionProps {
  epic: any;
  params: { id: string };
}

export default function EpicMeetingNotesSection({
  epic,
  params,
}: EpicMeetingNotesSectionProps) {
  console.log("EpicMeetingNotesSection is rendering!");
  return (
    <div
      style={{
        backgroundColor: "red !important",
        color: "white !important",
        padding: "50px !important",
        margin: "20px 0 !important",
        border: "10px solid yellow !important",
        minHeight: "300px !important",
        fontSize: "32px !important",
        fontWeight: "bold !important",
        display: "block !important",
        width: "100% !important",
        position: "relative" as any,
        zIndex: "9999 !important",
      }}
    >
      <h1 style={{ fontSize: "48px !important", color: "yellow !important" }}>
        ⚠️ MEETING NOTES SECTION ⚠️
      </h1>
      <p style={{ fontSize: "24px !important" }}>Epic ID: {params.id}</p>
      <p style={{ fontSize: "24px !important" }}>Epic Title: {epic?.title}</p>
      <p style={{ fontSize: "24px !important" }}>
        Current Time: {new Date().toLocaleTimeString()}
      </p>
      <button
        style={{
          backgroundColor: "blue !important",
          color: "white !important",
          padding: "30px 60px !important",
          fontSize: "24px !important",
          border: "none !important",
          marginTop: "20px !important",
          cursor: "pointer !important",
        }}
      >
        GIANT TEST BUTTON
      </button>
    </div>
  );
}
