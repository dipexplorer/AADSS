"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import debounce from "lodash.debounce";
import { createClient } from "@/lib/supabase/client";
import { getNoteForDate, saveNoteForDate } from "@/lib/notes/actions";
import { toast } from "react-hot-toast";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from "lucide-react";

interface Profile {
  id: string;
}

interface NotesEditorProps {
  profile: Profile;
  date: string;
}

export default function NotesEditor({ profile, date }: NotesEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "">("");
  const currentNoteId = useRef<string | null>(null);
  const isLocalChange = useRef(false);

  const supabase = createClient();

  // 1. Initialize Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write your notes for today. Use markdown shortcuts like # or *...",
        emptyEditorClass:
          "cursor-text before:content-[attr(data-placeholder)] before:absolute before:text-muted-foreground before:opacity-50 before-pointer-events-none",
      }),
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[150px] w-full p-4",
      },
    },
    onUpdate: ({ editor }) => {
      isLocalChange.current = true;
      setSaveStatus("Saving...");
      debouncedSave(editor.getJSON());
    },
  });

  // 2. Debounced Save
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (content: any) => {
      const { data, error } = await saveNoteForDate(profile.id, date, content);
      if (error) {
        toast.error("Failed to save note");
        setSaveStatus("");
      } else {
        if (data) currentNoteId.current = data.id;
        setSaveStatus("Saved");
        setTimeout(() => setSaveStatus(""), 2000);
      }
      isLocalChange.current = false;
    }, 1000),
    [profile.id, date],
  );

  // 3. Load Initial Content
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const { data, error } = await getNoteForDate(profile.id, date);
      if (!isMounted) return;

      if (error) {
         toast.error("Failed to load notes");
      } else if (data && editor) {
         currentNoteId.current = data.id;
         // Cast as any to bypass strict setContent typings matching Json type
         editor.commands.setContent(data.content as Record<string, any>, false as any); 
      } else if (!data && editor) {
         currentNoteId.current = null;
         editor.commands.setContent("", false as any);
      }
      setLoading(false);
    }
    load();

    return () => {
      isMounted = false;
      debouncedSave.cancel();
    };
  }, [date, profile.id, editor, debouncedSave]);

  // 4. Supabase Realtime Sync
  useEffect(() => {
    const channel = supabase
      .channel(`notes-${profile.id}-${date}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notes",
          filter: `student_id=eq.${profile.id}`,
        },
        (payload) => {
          // If the update came from another tab/device, apply it
          if (!isLocalChange.current && payload.new.date === date && editor) {
             const newContent = payload.new.content as Record<string, any>;
             const currentPos = editor.state.selection;
             editor.commands.setContent(newContent, false as any);
             // Try to restore cursor position if possible
             try {
               editor.commands.setTextSelection(currentPos);
             } catch(e) {}
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [date, profile.id, editor, supabase]);


  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden mt-8 shadow-sm transition-all">
      <div className="bg-muted/30 border-b border-border/50 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
           </svg>
           <h3 className="font-semibold text-sm text-foreground">Daily Notes</h3>
        </div>
        <span className="text-xs text-muted-foreground font-medium min-w-[60px] text-right">
          {saveStatus}
        </span>
      </div>
      
      {loading ? (
        <div className="p-4 space-y-3">
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-muted/60 animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-muted/40 animate-pulse rounded" />
        </div>
      ) : (
        <div className="flex flex-col">
          {editor && (
            <div className="bg-muted/10 border-b border-border/50 px-3 py-2 flex flex-wrap items-center gap-1">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-1.5 rounded-md transition-colors ${
                  editor.isActive("bold")
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded-md transition-colors ${
                  editor.isActive("italic")
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={`p-1.5 rounded-md transition-colors ${
                  editor.isActive("strike")
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-border mx-2" />

              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={`p-1.5 rounded-md transition-colors ${
                  editor.isActive("heading", { level: 1 })
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={`p-1.5 rounded-md transition-colors ${
                  editor.isActive("heading", { level: 2 })
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-border mx-2" />

              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded-md transition-colors ${
                  editor.isActive("bulletList")
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded-md transition-colors ${
                  editor.isActive("orderedList")
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                title="Ordered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded-md transition-colors ${
                  editor.isActive("blockquote")
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                title="Blockquote"
              >
                <Quote className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-border mx-2" />

              <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="p-1.5 rounded-md transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="p-1.5 rounded-md transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="min-h-[150px] relative">
            <EditorContent editor={editor} />
          </div>
        </div>
      )}
    </div>
  );
}
