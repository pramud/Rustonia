"use client";

import { useState, useEffect } from 'react';
import CodeEditor from '../components/CodeEditor';
import styles from './page.module.css';

export default function Home() {
  const [tutorials, setTutorials] = useState([]);
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  useEffect(() => {
    fetch('/tutorials.json')
      .then((response) => response.json())
      .then((data) => {
        setTutorials(data);
        if (data.length > 0) {
          setCurrentTutorial(data[0]);
          setCode(data[0].initialCode || '');
          setIsNextEnabled(!data[0].requiresCode);
        }
      });
  }, []);

  const runCode = async () => {
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const result = await response.text();
    setOutput(result);

    console.log(currentTutorial.expectedOutput)
    console.log(result.trim())
    if (currentTutorial && result.trim() === currentTutorial.expectedOutput) {
      setIsNextEnabled(true);
      const updatedTutorials = tutorials.map((tutorial) =>
        tutorial.id === currentTutorial.id ? { ...tutorial, isCompleted: true } : tutorial
      );
      setTutorials(updatedTutorials);
    } else {
      setIsNextEnabled(false);
    }
  };

  const handleNext = () => {
    const currentIndex = tutorials.findIndex((tutorial) => tutorial.id === currentTutorial.id);
    if (currentIndex < tutorials.length - 1) {
      const nextTutorial = tutorials[currentIndex + 1];
      setCurrentTutorial(nextTutorial);
      setCode(nextTutorial.initialCode || '');
      setOutput('');
      setIsNextEnabled(!nextTutorial.requiresCode);
      setShowHints(false);
      setShowExplanations(false);
    }
  };

  const handleBack = () => {
    const currentIndex = tutorials.findIndex((tutorial) => tutorial.id === currentTutorial.id);
    if (currentIndex > 0) {
      const prevTutorial = tutorials[currentIndex - 1];
      setCurrentTutorial(prevTutorial);
      setCode(prevTutorial.initialCode || '');
      setOutput('');
      setIsNextEnabled(!prevTutorial.requiresCode);
      setShowHints(false);
      setShowExplanations(false);
    }
  };

  if (!currentTutorial) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.textSection}>
        <h1>{currentTutorial.title}</h1>
        <p>{currentTutorial.description}</p>
        {currentTutorial.narrative && <p><em>{currentTutorial.narrative}</em></p>}
        {currentTutorial.hints && (
          <div>
            <button onClick={() => setShowHints(!showHints)}>
              {showHints ? "Hide Hints" : "Show Hints"}
            </button>
            {showHints && (
              <ul>
                {currentTutorial.hints.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {currentTutorial.explanations && (
          <div>
            {/* <button onClick={() => setShowExplanations(!showExplanations)}>
              {showExplanations ? "Hide Explanations" : "Show Explanations"}
            </button> */}
            {/* {showExplanations && ( */}
              <ul>
                {Object.entries(currentTutorial.explanations).map(([key, explanation], index) => (
                  <li key={index}>
                    <strong>{key}:</strong> {explanation}
                  </li>
                ))}
              </ul>
            {/* )} */}
          </div>
        )}
      </div>
      <div className={styles.editorSection}>
        {currentTutorial.requiresCode && <CodeEditor code={code} setCode={setCode} />}
        {currentTutorial.requiresCode && <button className={styles.runButton} onClick={runCode} disabled={!currentTutorial.requiresCode}>Run</button>}
      </div>
      <div className={styles.outputSection}>
        <h2>Output</h2>
        <pre>{output}</pre>
        <div className={styles.buttonContainer}>
          <button className={styles.backButton} onClick={handleBack}>Back</button>
          <button className={styles.nextButton} onClick={handleNext} disabled={!isNextEnabled}>Next</button>
        </div>
        {isNextEnabled && currentTutorial.feedback && (
          <div>
            <p>{currentTutorial.feedback.success}</p>
          </div>
        )}
        {!isNextEnabled && currentTutorial.feedback && (
          <div>
            <p>{currentTutorial.feedback.failure}</p>
          </div>
        )}
      </div>
    </div>
  );
}
