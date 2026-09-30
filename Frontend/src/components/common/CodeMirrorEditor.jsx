import React, { useMemo, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { keymap } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import { getLanguageExtension } from '../../utils/editorLanguages';

export default function CodeMirrorEditor({
  value = '',
  onChange,
  onCursorChange,
  onSave,
  language = 'javascript',
  filename = '',
  readOnly = false,
  height = '100%',
  className = '',
  placeholder = 'Write code here...',
}) {
  const handleUpdate = useCallback(
    (viewUpdate) => {
      if (onCursorChange) {
        const head = viewUpdate.state.selection.main.head;
        const line = viewUpdate.state.doc.lineAt(head);
        const lineNumber = line.number;
        const colNumber = head - line.from + 1;
        onCursorChange({
          line: lineNumber,
          col: colNumber,
          totalLines: viewUpdate.state.doc.lines,
          length: viewUpdate.state.doc.length,
        });
      }
    },
    [onCursorChange]
  );

  const extensions = useMemo(() => {
    const langExt = getLanguageExtension(filename || language);
    const exts = [langExt, oneDark];

    if (onSave) {
      exts.push(
        keymap.of([
          {
            key: 'Mod-s',
            run: () => {
              onSave();
              return true;
            },
          },
        ])
      );
    }

    return exts;
  }, [filename, language, onSave]);

  return (
    <div
      className={`w-full h-full overflow-hidden text-[13px] ${className}`}
      style={{
        fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', 'Courier New', monospace",
      }}
    >
      <CodeMirror
        value={value}
        height={height}
        theme={oneDark}
        extensions={extensions}
        onChange={onChange}
        onUpdate={handleUpdate}
        readOnly={readOnly}
        editable={!readOnly}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
        style={{
          height: '100%',
          backgroundColor: '#1E1E1E',
        }}
      />
    </div>
  );
}
