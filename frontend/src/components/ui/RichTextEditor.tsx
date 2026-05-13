import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export function RichTextEditor({ value, onChange, onImageUpload }: RichTextEditorProps) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({ inline: false, allowBase64: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  const handleImageInsert = useCallback(async () => {
    if (!onImageUpload) {
      const url = window.prompt(t('editor.image_url_prompt'));
      if (url && editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      try {
        const url = await onImageUpload(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        alert(t('editor.upload_error'));
      }
    };
    input.click();
  }, [editor, onImageUpload]);

  if (!editor) return null;

  return (
    <div className="rich-editor rounded-xl border border-stone-200 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-stone-100 px-3 py-2">
        <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title={t('editor.bold')}>
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title={t('editor.italic')}>
          <em>I</em>
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title={t('editor.heading2')}
        >
          H2
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title={t('editor.heading3')}
        >
          H3
        </ToolBtn>
        <Divider />
        <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title={t('editor.bullet_list')}>
          <span className="material-symbols-outlined text-base">format_list_bulleted</span>
        </ToolBtn>
        <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title={t('editor.numbered_list')}>
          <span className="material-symbols-outlined text-base">format_list_numbered</span>
        </ToolBtn>
        <Divider />
        <ToolBtn onClick={handleImageInsert} title={t('editor.insert_image')}>
          <span className="material-symbols-outlined text-base">image</span>
        </ToolBtn>
        <Divider />
        <button
          type="button"
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${preview ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
          onClick={() => setPreview(!preview)}
        >
          {preview ? t('editor.edit') : t('editor.preview')}
        </button>
      </div>

      {preview ? (
        <div
          className="prose prose-sm max-w-none px-4 py-3 min-h-[200px]"
          dangerouslySetInnerHTML={{ __html: value || editor.getHTML() }}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}

function ToolBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      className={`rounded-lg px-2.5 py-1.5 text-sm transition ${active ? 'bg-amber-100 text-amber-800' : 'text-stone-600 hover:bg-stone-100'}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px bg-stone-200" />;
}
