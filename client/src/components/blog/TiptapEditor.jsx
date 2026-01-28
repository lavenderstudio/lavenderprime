// client/src/components/blog/TiptapEditor.jsx
// ----------------------------------------------------
// TipTap editor wrapper
// - Controlled via "value" (HTML string) + onChange(html)
// - Uses StarterKit + Link + Placeholder
// - Includes a simple toolbar
// ----------------------------------------------------

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

// Optional extension (uncomment if you installed it)
// import TextAlign from "@tiptap/extension-text-align";

function Btn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
        active ? "bg-slate-900 text-white" : "bg-white text-slate-800 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function TiptapEditor({
  value = "",              // HTML string
  onChange,                // (html) => void
  placeholder = "Write your blog post…",
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Placeholder.configure({
        placeholder,
      }),

      // Optional alignment support:
      // TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none focus:outline-none min-h-[260px] p-4",
      },
    },
    onUpdate({ editor }) {
      // ✅ Always export HTML on change
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  // ✅ Keep editor content in sync when editing an existing blog (edit mode)
  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();
    if (value && value !== current) {
      editor.commands.setContent(value, false); // false = do not emit another history step
    }
  }, [value, editor]);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");

    // If user cancels
    if (url === null) return;

    // If user clears input => remove link
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // ✅ Apply link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="rounded-2xl border bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border-b bg-slate-50 p-3">
        <Btn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </Btn>
        <Btn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </Btn>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <Btn active={editor.isActive("link")} onClick={setLink}>
          Link
        </Btn>
        <Btn active={false} onClick={() => editor.chain().focus().unsetLink().run()}>
          Unlink
        </Btn>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
