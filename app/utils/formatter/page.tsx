'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Trash2, Code, FileJson, FileText, Check, AlertCircle, Wand2 } from 'lucide-react';

type FormatType = 'json' | 'yaml' | 'unknown';

export default function FormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [detectedType, setDetectedType] = useState<FormatType>('unknown');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-detect and Format on input change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFormat();
    }, 500);

    return () => clearTimeout(timer);
  }, [input]);

  const detectType = (text: string): FormatType => {
    const trimmed = text.trim();
    if (!trimmed) return 'unknown';
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
    if (trimmed.includes(':') && !trimmed.startsWith('{')) return 'yaml'; // Very basic heuristic
    return 'unknown';
  };

  const handleFormat = () => {
    if (!input.trim()) {
      setOutput('');
      setDetectedType('unknown');
      setError(null);
      return;
    }

    const type = detectType(input);
    setDetectedType(type);
    setError(null);

    if (type === 'json') {
      try {
        const parsed = JSON.parse(input);
        setOutput(JSON.stringify(parsed, null, 2));
      } catch (e) {
        // Don't clear output while typing, just show error
        // setOutput(input); 
        setError((e as Error).message);
      }
    } else if (type === 'yaml') {
        // Since we don't have a yaml parser lib installed, we pass it through
        // but we can add basic syntax highlighting in the render.
        // We will just assume it's valid for "formatting" purposes (pass-through)
        // or potentially implement a simple indentation fixer if needed.
        // For now, identity transform with highlighting.
        setOutput(input);
    } else {
      setOutput(input);
    }
  };

  const handleCopy = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(output).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy with clipboard API:', err);
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    const textArea = document.createElement('textarea');
    textArea.value = output;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Fallback copy was unsuccessful');
      }
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      setError('Failed to copy text to clipboard.');
    }

    document.body.removeChild(textArea);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
    setDetectedType('unknown');
  };

  // Simple Syntax Highlighter Component
  const SyntaxHighlighter = ({ code, type }: { code: string; type: FormatType }) => {
    if (!code) return <span className="text-foreground/60 italic">Result will appear here...</span>;

    const lines = code.split('\n');

    return (
      <div className="font-mono text-sm leading-6">
        {lines.map((line, i) => {
          if (type === 'json') {
            // Basic JSON Regex Tokenizer
            const parts = line.split(/(".*?"|:|,|{|}|[|])/g).filter(Boolean);
            return (
              <div key={i} className="whitespace-pre">
                {parts.map((part, j) => {
                  if (part.startsWith('"') && part.endsWith('"')) {
                    // Check if it's a key or value
                    const isKey = line.trim().startsWith(part) && line.includes(':');
                    return <span key={j} className={isKey ? "text-primary-text font-semibold" : "text-green-600"}>{part}</span>;
                  }
                  if (part === ':' || part === ',' || part === '{' || part === '}' || part === '[' || part === ']') {
                    return <span key={j} className="text-foreground/70">{part}</span>;
                  }
                  if (part.match(/true|false|null/)) return <span key={j} className="text-purple-600 font-bold">{part}</span>;
                  if (part.match(/^-?\d+(\.\d+)?$/)) return <span key={j} className="text-secondary-text">{part}</span>;
                  return <span key={j} className="text-foreground">{part}</span>;
                })}
              </div>
            );
          } else if (type === 'yaml') {
            // Very Basic YAML Highlighter
            const keyMatch = line.match(/^(\s*)([\w\d_-]+):(.*)/);
            if (keyMatch) {
                return (
                    <div key={i} className="whitespace-pre">
                        <span>{keyMatch[1]}</span>
                        <span className="text-primary-text font-semibold">{keyMatch[2]}:</span>
                        <span className="text-green-700">{keyMatch[3]}</span>
                    </div>
                )
            }
             // Comment
             if (line.trim().startsWith('#')) {
                return <div key={i} className="whitespace-pre text-foreground/60 italic">{line}</div>;
             }
             return <div key={i} className="whitespace-pre text-foreground">{line}</div>;
          }
          return <div key={i} className="whitespace-pre text-foreground">{line}</div>;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Format & Validator</h1>
        <p className="mt-2 text-lg text-foreground/80">
          Auto-detects JSON/YAML, formats code, and highlights syntax.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText size={20} className="text-foreground/70" />
              Input
            </h2>
            <button
              onClick={handleClear}
              className="p-2 text-foreground/70 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <div className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste JSON or YAML here..."
              className="w-full h-[600px] p-4 font-mono text-sm bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none shadow-sm transition-shadow text-foreground/90 leading-relaxed"
              spellCheck={false}
            />
             {error && (
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm animate-in fade-in slide-in-from-bottom-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-foreground">Result</h2>
                {/* Type Badge */}
                {detectedType !== 'unknown' && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wide
                        ${detectedType === 'json' ? 'bg-primary-light text-primary-text border-primary' : ''}
                        ${detectedType === 'yaml' ? 'bg-secondary-light text-secondary-text border-secondary' : ''}
                    `}>
                        {detectedType === 'json' ? <FileJson size={12} /> : <Code size={12} />}
                        {detectedType}
                    </span>
                )}
            </div>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground/80 bg-card border-border rounded-lg hover:bg-background/80 hover:text-foreground transition-colors disabled:opacity-50"
            >
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="h-[600px] bg-card border-border rounded-xl shadow-sm overflow-auto p-4 relative">
             <SyntaxHighlighter code={output || (error ? input : '')} type={detectedType} />
             
             {!output && !input && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/60">
                    <Wand2 size={48} className="mb-4 opacity-20" />
                    <p>Paste text to format</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
