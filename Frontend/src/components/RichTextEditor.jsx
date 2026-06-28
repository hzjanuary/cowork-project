import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

const RichTextEditor = ({ value, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        }
    });

    useEffect(() => {
        if (!editor) return;

        const nextValue = value || '';
        if (nextValue !== editor.getHTML()) {
            editor.commands.setContent(nextValue, false);
        }
    }, [editor, value]);

    if (!editor) return null;

    return (
        <div className="editor-container">
            <div className="editor-toolbar">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    Bold
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    Italic
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    Underline
                </button>
            </div>

            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor;