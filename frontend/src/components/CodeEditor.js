import { useRef, useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import styles from './CodeEditor.module.css';

const CodeEditor = ({ code, setCode }) => {
  const monacoEl = useRef(null);
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    if (monacoEl.current) {
      const instance = monaco.editor.create(monacoEl.current, {
        value: code,
        language: 'rust',
        theme: 'vs-dark',
        automaticLayout: true,
      });

      instance.onDidChangeModelContent(() => {
        setCode(instance.getValue());
      });

      setEditor(instance);
      return () => instance.dispose();
    }
  }, [monacoEl.current]);

  useEffect(() => {
    if (editor) {
      const model = editor.getModel();
      if (model && model.getValue() !== code) {
        const position = editor.getPosition();
        const selection = editor.getSelection();
        model.setValue(code);
        editor.setPosition(position);
        editor.setSelection(selection);
      }
    }
  }, [code, editor]);

  return <div className={styles.editorContainer} ref={monacoEl}></div>;
};

export default CodeEditor;
