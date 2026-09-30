import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { rust } from '@codemirror/lang-rust';
import { go } from '@codemirror/lang-go';
import { sql } from '@codemirror/lang-sql';
import { php } from '@codemirror/lang-php';
import { xml } from '@codemirror/lang-xml';
import { yaml } from '@codemirror/lang-yaml';

export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', ext: '.js' },
  { id: 'typescript', name: 'TypeScript', ext: '.ts' },
  { id: 'python', name: 'Python', ext: '.py' },
  { id: 'rust', name: 'Rust', ext: '.rs' },
  { id: 'go', name: 'Go', ext: '.go' },
  { id: 'java', name: 'Java', ext: '.java' },
  { id: 'cpp', name: 'C++', ext: '.cpp' },
  { id: 'c', name: 'C', ext: '.c' },
  { id: 'sql', name: 'SQL', ext: '.sql' },
  { id: 'php', name: 'PHP', ext: '.php' },
  { id: 'html', name: 'HTML', ext: '.html' },
  { id: 'css', name: 'CSS', ext: '.css' },
  { id: 'json', name: 'JSON', ext: '.json' },
  { id: 'xml', name: 'XML', ext: '.xml' },
  { id: 'yaml', name: 'YAML', ext: '.yaml' },
  { id: 'markdown', name: 'Markdown', ext: '.md' },
];

export function detectLanguage(filenameOrLang = '') {
  if (!filenameOrLang) return 'javascript';
  const ext = (
    filenameOrLang.includes('.')
      ? filenameOrLang.split('.').pop()
      : filenameOrLang
  ).toLowerCase();

  switch (ext) {
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
    case 'javascript':
      return 'javascript';
    case 'ts':
    case 'tsx':
    case 'typescript':
      return 'typescript';
    case 'py':
    case 'pyw':
    case 'python':
      return 'python';
    case 'rs':
    case 'rust':
      return 'rust';
    case 'go':
    case 'golang':
      return 'go';
    case 'java':
      return 'java';
    case 'c':
      return 'c';
    case 'cpp':
    case 'cxx':
    case 'cc':
    case 'h':
    case 'hpp':
      return 'cpp';
    case 'sql':
    case 'mysql':
    case 'pgsql':
    case 'postgres':
    case 'sqlite':
      return 'sql';
    case 'php':
    case 'phtml':
      return 'php';
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return 'css';
    case 'json':
      return 'json';
    case 'xml':
    case 'svg':
    case 'xaml':
      return 'xml';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'md':
    case 'markdown':
      return 'markdown';
    default:
      return ext || 'javascript';
  }
}

export function getLanguageExtension(filenameOrLang = '') {
  const lang = detectLanguage(filenameOrLang);

  switch (lang) {
    case 'javascript':
      return javascript({ jsx: true });
    case 'typescript':
      return javascript({ jsx: true, typescript: true });
    case 'python':
      return python();
    case 'rust':
      return rust();
    case 'go':
      return go();
    case 'java':
      return java();
    case 'c':
    case 'cpp':
      return cpp();
    case 'sql':
      return sql();
    case 'php':
      return php();
    case 'html':
      return html();
    case 'css':
      return css();
    case 'json':
      return json();
    case 'xml':
      return xml();
    case 'yaml':
      return yaml();
    case 'markdown':
      return markdown();
    default:
      return javascript();
  }
}
