import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

function getLanguageExtension(filenameOrLang = '') {
  const ext = (filenameOrLang.includes('.')
    ? filenameOrLang.split('.').pop()
    : filenameOrLang
  ).toLowerCase();

  switch (ext) {
    case 'js':
    case 'jsx':
    case 'javascript':
      return javascript({ jsx: true });
    case 'ts':
    case 'tsx':
    case 'typescript':
      return javascript({ jsx: true, typescript: true });
    case 'py':
    case 'python':
      return python();
    case 'java':
      return java();
    case 'c':
    case 'cpp':
    case 'cxx':
    case 'h':
    case 'hpp':
      return cpp();
    case 'html':
    case 'htm':
      return html();
    case 'css':
      return css();
    case 'json':
      return json();
    case 'md':
    case 'markdown':
      return markdown();
    default:
      return javascript();
  }
}

export default function CodeMirrorEditor({
  value = '',
  onChange,
  language = 'javascript',
  filename = '',
  readOnly = false,
  height = '100%',
  className = '',
  placeholder = 'Write code here...',
}) {
  const extensions = useMemo(() => {
    const langExt = getLanguageExtension(filename || language);
    return [langExt, oneDark];
  }, [filename, language]);

  return (
    <div className={`w-full h-full overflow-hidden font-mono text-[13px] ${className}`}>
      <CodeMirror
        value={value}
        height={height}
        theme={oneDark}
        extensions={extensions}
        onChange={onChange}
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
          backgroundColor: '#0A0A0A',
        }}
      />
    </div>
  );
}
