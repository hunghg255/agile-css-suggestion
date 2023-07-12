import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getClassNames } from './utils';

const extensionArray: string[] = ['htm', 'html', 'jsx', 'tsx', 'js'];
const htmMatchRegex = /class=["'][\w- ]+["']/g;
const fileSep = path.sep;
const regWords = [
  'styles',
  'classNames',
  'cx',
  'clx',
  'cls',
  'true',
  'false',
  'main',
  'div',
  'a',
  'ul',
  'li',
  'section',
  'nav',
  'p',
  'span',
  'img',
  'header',
  'body',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'table',
  'thead',
  'tbody',
  'tr',
  'td',
  'i',
  'b',
  'u',
  'pre',
  'ol',
  'lh',
  'input',
  'abbr',
];

const onReplace = (className: string) => {
  let classNameFormat = className.replace(/styles\./g, ' ');
  classNameFormat = className.replace(/[\'\"\{\[\]\}\.\,\:\$\`\(\)\+\?\=\>\<\&\|\!]/g, ' ');

  return classNameFormat
    .split(' ')
    .filter((v) => v.length > 2)
    .map((v) => v.trim());
};

function provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
  const typeText = document
    .lineAt(position)
    .text.substring(position.character - 1, position.character);

  if (typeText !== '.') {
    return;
  }

  // current file path
  const filePath: string = document.fileName;

  let classNames: string[] = [];
  const isVueFile =
    document.languageId === 'vue' ||
    document.languageId === 'svelte' ||
    filePath.includes('htm') ||
    filePath.includes('vue') ||
    filePath.includes('svelte');

  // vue
  if (isVueFile) {
    classNames = getClass(filePath);
  }
  // css-like file
  else {
    // current dir path
    const dir: string = filePath.slice(0, filePath.lastIndexOf(fileSep));
    // current dir files
    const files: string[] = fs.readdirSync(dir);
    // filter target file
    const target: string[] = files.filter((item: string) =>
      extensionArray.includes(item.split('.')[1]),
    );
    // get target files class name
    target.forEach((item: string) => {
      const filePath = `${dir}${fileSep}${item}`;
      const fileClass = getClass(filePath);
      classNames = classNames.concat(fileClass);
    });
  }

  classNames = classNames.reduce((arr, ele) => {
    let className: string = '';

    if (isVueFile) {
      className = ele.split('class=').join(' ');
    } else {
      className = ele.split('className=').join(' ');
    }

    const field: string[] = onReplace(className);

    arr.push(...field);

    return arr;
  }, [] as string[]);

  // de-duplication
  classNames = [...new Set(classNames)];

  return classNames
    .filter((v) => !regWords.includes(v))
    .map((ele: string) => {
      const snippetCompletion = new vscode.CompletionItem({
        label: `.${ele}`,
        description: 'Agile Css Suggestion',
      });
      if (isVueFile) {
        snippetCompletion.insertText = new vscode.SnippetString(`${ele} {
  ${`\${0}`}
}`);
      } else {
        snippetCompletion.insertText = new vscode.SnippetString(`.${ele} {
  ${`\${0}`}
}`);
      }

      return snippetCompletion;
    });
}

function getClass(path: string) {
  const data: string = fs.readFileSync(path, 'utf8').split('\n').join('');

  // htm/html/vue use class
  if (path.includes('html') || path.includes('vue') || path.includes('svelte')) {
    return data.match(htmMatchRegex) ?? [];
  }

  // tsx/jsx use className
  if (path.includes('sx') || path.includes('js')) {
    return getClassNames(data) ?? [];
  }

  return [];
}

/**
 * @param {*} item
 * @param {*} token
 */
function resolveCompletionItem() {
  return null;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // trigger only when type dot
  const disposable = vscode.languages.registerCompletionItemProvider(
    [
      { scheme: 'file', language: 'css' },
      { scheme: 'file', language: 'less' },
      { scheme: 'file', language: 'scss' },
      { scheme: 'file', language: 'sass' },
      { scheme: 'file', language: 'stylus' },
      { scheme: 'file', language: 'vue' },
      { scheme: 'file', language: 'html' },
      { scheme: 'file', language: 'svelte' },
    ],
    {
      provideCompletionItems,
      resolveCompletionItem,
    },
    '.',
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
