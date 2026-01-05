"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className = "",
}: RichTextEditorProps) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "blockquote",
    "code-block",
    "color",
    "background",
    "link",
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      <style jsx global>{`
        .ql-container {
          background-color: #18181b !important;
          border-color: #3f3f46 !important;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          color: #ffffff !important;
          min-height: 150px;
        }

        .ql-editor {
          color: #ffffff !important;
          min-height: 150px;
        }

        .ql-editor.ql-blank::before {
          color: #71717a !important;
          font-style: normal;
        }

        .ql-toolbar {
          background-color: #27272a !important;
          border-color: #3f3f46 !important;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }

        .ql-stroke {
          stroke: #a1a1aa !important;
        }

        .ql-fill {
          fill: #a1a1aa !important;
        }

        .ql-picker-label {
          color: #a1a1aa !important;
        }

        .ql-picker-options {
          background-color: #27272a !important;
          border-color: #3f3f46 !important;
        }

        .ql-toolbar button:hover,
        .ql-toolbar button:focus,
        .ql-toolbar button.ql-active {
          color: #3b82f6 !important;
        }

        .ql-toolbar button:hover .ql-stroke,
        .ql-toolbar button:focus .ql-stroke,
        .ql-toolbar button.ql-active .ql-stroke {
          stroke: #3b82f6 !important;
        }

        .ql-toolbar button:hover .ql-fill,
        .ql-toolbar button:focus .ql-fill,
        .ql-toolbar button.ql-active .ql-fill {
          fill: #3b82f6 !important;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={content}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
