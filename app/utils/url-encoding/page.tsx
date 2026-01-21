'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Copy, Trash2, Link, AlertCircle, Check } from 'lucide-react';

export default function UrlEncodingPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);

  const handleEncode = () => {
    try {
      setError(null);
      if (!inputText) {
        setOutputText('');
        return;
      }
      const encoded = encodeURIComponent(inputText);
      setOutputText(encoded);
    } catch (err) {
      setError('Failed to encode. Ensure input is valid text.');
    }
  };

  const handleDecode = () => {
    try {
      setError(null);
      if (!inputText) {
        setOutputText('');
        return;
      }
      const decoded = decodeURIComponent(inputText);
      setOutputText(decoded);
    } catch (err) {
        console.error(err);
      setError('Failed to decode. Input might contain invalid characters or be malformed.');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        if (mode === 'encode') {
            handleEncode();
        } else {
            handleDecode();
        }
    }, 300); // Debounce
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, mode]);

  const handleCopy = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(outputText).then(() => {
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
    textArea.value = outputText;
    
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

  const clearAll = () => {
      setInputText('');
      setOutputText('');
      setError(null);
  };

  const swap = () => {
      setInputText(outputText);
      setOutputText(''); // Will be filled by effect
      setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Link className="text-orange-600" />
          URL Encoder / Decoder
        </h1>
        <p className="text-lg text-gray-600">
          Encode and decode text for safe use in URLs.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                    {mode === 'encode' ? 'Text Input' : 'URL-encoded Input'}
                </label>
                <div className="flex items-center gap-2">
                     <button 
                        onClick={clearAll}
                        className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                        <Trash2 size={14} /> Clear
                    </button>
                </div>
            </div>
            
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={mode === 'encode' ? "Type text to encode..." : "Paste URL-encoded string here..."}
                className="w-full h-80 p-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none font-mono text-sm resize-none bg-white shadow-sm"
                spellCheck={false}
            />

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                 <div className="flex items-center gap-4">
                     <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                         <input 
                            type="checkbox" 
                            checked={mode === 'encode'} 
                            onChange={() => setMode('encode')}
                            className="text-orange-600 focus:ring-orange-500 rounded"
                         />
                         Encode
                     </label>
                     <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                         <input 
                            type="checkbox" 
                            checked={mode === 'decode'} 
                            onChange={() => setMode('decode')}
                            className="text-orange-600 focus:ring-orange-500 rounded"
                         />
                         Decode
                     </label>
                 </div>
            </div>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                 <label className="text-sm font-medium text-gray-700">
                    {mode === 'encode' ? 'URL-encoded Output' : 'Text Output'}
                </label>
                <button 
                    onClick={swap}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                    title="Use output as input"
                >
                    <ArrowRightLeft size={14} /> Swap
                </button>
            </div>

            <div className="relative">
                <textarea
                    value={outputText}
                    readOnly
                    placeholder="Result will appear here..."
                    className={`w-full h-80 p-4 rounded-xl border focus:ring-1 outline-none font-mono text-sm resize-none shadow-sm ${ 
                        error 
                        ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 bg-gray-50 text-gray-800 focus:border-orange-500 focus:ring-orange-500'
                    }`}
                />
                
                {outputText && !error && (
                    <button
                        onClick={handleCopy}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-white/80 backdrop-blur border border-gray-200 shadow-sm hover:bg-gray-100 transition-colors text-gray-600"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                </div>
            )}
            
            <div className="text-xs text-gray-400 text-right">
                Length: {outputText.length} chars
            </div>
        </div>
      </div>
    </div>
  );
}
