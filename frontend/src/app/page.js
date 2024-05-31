"use client";

import { useState, useEffect } from 'react';
import CodeEditor from '../components/CodeEditor';
import styles from './page.module.css';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

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
      <ResizablePanelGroup direction="horizontal" className={styles.resizableGroup}>
        <ResizablePanel defaultSize={33}>
          <div className={styles.textSection}>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">{currentTutorial.title}</h1>
            <p className="leading-7 [&:not(:first-child)]:mt-6">{currentTutorial.description}</p>

            {currentTutorial.narrative && <blockquote className="mt-6 border-l-2 pl-6 italic"><em>{currentTutorial.narrative}</em></blockquote>}

            {currentTutorial.explanations && (
              <div>
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight first:mt-5">
                  Explanation
                </h3>
                <ul>
                  {Object.entries(currentTutorial.explanations).map(([key, explanation], index) => (
                    <li key={index} className="leading-7 [&:not(:first-child)]:mt-6">
                      <strong>{key}:</strong> {explanation}
                    </li>
                  ))}
                </ul>
              </div>
            )}



            {currentTutorial.hints && (
              <div flex justify-end>
                <Button onClick={() => setShowHints(!showHints)}>
                  {showHints ? "Hide Hints" : "Show Hints"}
                </Button>
                {showHints && (
                  <ul>
                    {currentTutorial.hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={33}>
          <div className={styles.editorSection}>
            {currentTutorial.requiresCode && <CodeEditor code={code} setCode={setCode} />}
            {currentTutorial.requiresCode && <button className={styles.runButton} onClick={runCode} disabled={!currentTutorial.requiresCode}>Run</button>}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={33}>
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
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
