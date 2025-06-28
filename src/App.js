"use client"

import { useState } from "react"
import "./App.css"

const API_BASE = "http://localhost:5000/api"


function App() {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [fileName, setFileName] = useState("")
  const [question, setQuestion] = useState("")
  const [result, setResult] = useState(null)
  const [isAsking, setIsAsking] = useState(false)

  const handleFileUpload = async (e) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("pdf", file)

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        setUploadComplete(true)
        setFileName(result.fileName)
      }
    } catch (error) {
      alert("Upload failed: " + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAskQuestion = async (e) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsAsking(true)
    try {
      const response = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, fileName }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ answer: "Error: " + error.message, confidence: 0 })
    } finally {
      setIsAsking(false)
    }
  }

  return (
    <div className="App">
      <h1>Enhanced PDF Q&A System with Gemini</h1>

      {!uploadComplete ? (
        <div className="upload-section">
          <h2>Upload PDF</h2>
          <form onSubmit={handleFileUpload}>
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} required />
            <button type="submit" disabled={isUploading}>
              {isUploading ? "Processing with Enhanced Chunking..." : "Upload PDF"}
            </button>
          </form>
        </div>
      ) : (
        <div className="qa-section">
          <h2>Ask Detailed Questions about: {fileName}</h2>
          <form onSubmit={handleAskQuestion}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a detailed question about your PDF..."
              rows="4"
              required
            />
            <button type="submit" disabled={isAsking}>
              {isAsking ? "Analyzing with Gemini..." : "Get Detailed Answer"}
            </button>
          </form>

          {result && (
            <div className="result">
              <div className="answer">
                <h3>Detailed Answer:</h3>
                <div className="answer-text">{result.answer}</div>
              </div>

              <div className="metadata">
                <div className="confidence">
                  <strong>Confidence:</strong> {result.confidence}%
                </div>
                <div className="sources">
                  <strong>Sources Found:</strong> {result.sources} relevant chunks
                </div>
                <div className="analysis">
                  <strong>Analysis:</strong> {result.analysis}
                </div>
              </div>

              {result.sourceDetails && result.sourceDetails.length > 0 && (
                <div className="source-details">
                  <h4>Source Details:</h4>
                  {result.sourceDetails.map((source, index) => (
                    <div key={index} className="source-item">
                      <div className="source-header">
                        <strong>Chunk {source.chunkIndex + 1}</strong> - Similarity: {source.similarity}% - Words:{" "}
                        {source.wordCount}
                      </div>
                      <div className="source-preview">{source.preview}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
