import React, { useState } from "react";  
import MonacoEditor from "@monaco-editor/react";  
import Confetti from "react-confetti";  
import "./Editor.css";  
  
function CodeEditor({ email, refreshCodes }) {  
  const [title, setTitle] = useState("");  
  const [code, setCode] = useState(`# Try me! Type some Python code below  
x = 5  
print("Hello World!")`);  
  
  const [output, setOutput] = useState("");  
  const [score, setScore] = useState(null);  
  const [issues, setIssues] = useState([]);  
  const [suggestions, setSuggestions] = useState([]);  
  const [suggestedCode, setSuggestedCode] = useState("");  
  const [showConfetti, setShowConfetti] = useState(false);  
  
  const BASE_URL = "https://opticodex-backend.onrender.com";
  
  // RUN CODE  
  const runCode = async () => {  
    setOutput("⏳ Running...");  
    try {  
      const res = await fetch(`${BASE_URL}/run_python`, {  
        method: "POST",  
        headers: {  
          "Content-Type": "application/json"  
        },  
        body: JSON.stringify({ code })  
      });  
  
      const data = await res.json();  
  
      if (data.has_syntax_error) {  
        setOutput(`💥 Syntax Error:\n${data.error}`);  
      } else if (data.error) {  
        setOutput(`❌ Error:\n${data.error}`);  
      } else {  
        setOutput(data.output || "✅ Code ran successfully (no output)");  
      }  
  
    } catch {  
      setOutput("🌐 Backend not running");  
    }  
  };  
  
  // ANALYZE CODE  
  const analyzeCode = async () => {  
    try {  
      const res = await fetch(`${BASE_URL}/analyze`, {  
        method: "POST",  
        headers: {  
          "Content-Type": "application/json"  
        },  
        body: JSON.stringify({ code })  
      });  
  
      const data = await res.json();  
  
      setScore(data.score);  
      setIssues(data.friendly_explanations || []);  
      setSuggestions(data.suggestions || []);  
      setSuggestedCode(data.suggested_code || "");  
  
      if (data.score === 10) {  
        setShowConfetti(true);  
        setTimeout(() => setShowConfetti(false), 4000);  
      }  
  
    } catch (err) {  
      console.error(err);  
    }  
  };  
  
  // SAVE  
  const saveCode = async () => {  
    if (!title.trim()) {  
      alert("Enter title first");  
      return;  
    }  
  
    try {  
      const res = await fetch(`${BASE_URL}/save_code`, {  
        method: "POST",  
        headers: {  
          "Content-Type": "application/json"  
        },  
        body: JSON.stringify({  
          email: email || "demo@opticodex.com",  
          title,  
          codeSnippet: code,  
          score: score || 0  
        })  
      });  
  
      const data = await res.json();  
  
      if (data.success) {  
        alert("Saved successfully");  
        if (refreshCodes) refreshCodes();  
        setTitle("");  
      }  
  
    } catch {  
      alert("Save failed");  
    }  
  };  
  
  // APPLY FIX  
  const applyFix = () => {  
    if (suggestedCode) {  
      setCode(suggestedCode);  
      setScore(null);  
      setIssues([]);  
      setSuggestions([]);  
      setSuggestedCode("");  
    }  
  };  
  
  return (  
    <div className="editor-container">  
  
      {showConfetti && <Confetti />}  
  
      <h2>💻 Opticodex Playground</h2>  
  
      <input  
        type="text"  
        placeholder="Enter code title..."  
        value={title}  
        onChange={(e) => setTitle(e.target.value)}  
      />  
  
      <MonacoEditor  
        height="350px"  
        language="python"  
        theme="vs-dark"  
        value={code}  
        onChange={(value) => setCode(value || "")}  
      />  
  
      <div className="editor-buttons">  
        <button onClick={runCode}>▶ Run</button>  
        <button onClick={analyzeCode}>🤖 Analyze</button>  
        <button onClick={saveCode}>💾 Save</button>  
        {suggestedCode && (  
          <button onClick={applyFix}>✨ Use Fix</button>  
        )}  
      </div>  
  
      <div className="output-box">  
        <h3>📤 Output</h3>  
        <pre>{output}</pre>  
      </div>  
  
      {score !== null && (  
        <div className="score-box">  
          <h3>⭐ Score: {score}/10</h3>  
          {score === 10 && <p className="perfect">Perfect 🎉</p>}  
        </div>  
      )}  
  
      {issues.length > 0 && (  
        <div className="issues-box">  
          <h3>⚠️ What to improve</h3>  
          {issues.map((issue, i) => (  
            <p key={i}>{issue}</p>  
          ))}  
        </div>  
      )}  
  
      {suggestions.length > 0 && (  
        <div className="suggestions-box">  
          <h3>💡 Quick fixes</h3>  
          {suggestions.map((s, i) => (  
            <p key={i}>{s}</p>  
          ))}  
        </div>  
      )}  
  
      {suggestedCode && (  
        <div className="suggested-code-box">  
          <h3>  
            ✨ Improved version  
            <button  
              onClick={applyFix}  
              style={{  
                float: "right",  
                fontSize: "12px",  
                padding: "5px 10px",  
                cursor: "pointer"  
              }}  
            >  
              Use Fix  
            </button>  
          </h3>  
          <pre>{suggestedCode}</pre>  
        </div>  
      )}  
  
    </div>  
  );  
}  
// redeploy 
  
export default CodeEditor;