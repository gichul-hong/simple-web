'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

interface JwtHeader {
  alg?: string;
  typ?: string;
  [key: string]: any;
}

interface JwtPayload {
  sub?: string;
  name?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

export default function JwtParserPage() {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState<JwtHeader | null>(null);
  const [payload, setPayload] = useState<JwtPayload | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token.trim()) {
      setHeader(null);
      setPayload(null);
      setSignature(null);
      setError(null);
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format: Token must have 3 parts (Header, Payload, Signature)');
      }

      const decodeBase64 = (str: string) => {
        try {
            // Replace standard base64 url characters
            const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
            // Pad if necessary
            const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
            return JSON.parse(atob(padded));
        } catch (e) {
            throw new Error('Failed to decode Base64 string');
        }
      };

      const decodedHeader = decodeBase64(parts[0]);
      const decodedPayload = decodeBase64(parts[1]);

      setHeader(decodedHeader);
      setPayload(decodedPayload);
      setSignature(parts[2]);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while parsing the token');
      }
      // Keep previous valid data if possible, or clear? Better to clear for clarity.
      // But if user is typing, maybe keep? Let's clear to avoid confusion.
      setHeader(null);
      setPayload(null);
      setSignature(null);
    }
  }, [token]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  const handleClear = () => {
    setToken('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">JWT Parser</h1>
        <p className="mt-2 text-lg text-gray-600">
          Decode and inspect JSON Web Tokens (JWT) directly in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Encoded</h2>
            <div className="flex gap-2">
                 <button
                    onClick={handleClear}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Clear"
                  >
                    <Trash2 size={18} />
                  </button>
            </div>
          </div>
          <div className="relative">
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your JWT here (e.g., eyJhbGci...)"
              className="w-full h-[600px] p-4 font-mono text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none shadow-sm transition-shadow text-gray-600 leading-relaxed break-all"
              spellCheck={false}
            />
            {error && (
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Decoded</h2>
             {/* Status Badge */}
             {header && !error && (
                 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                     <ShieldCheck size={14} />
                     Valid Format
                 </span>
             )}
          </div>

          {/* Header */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Header</span>
              <span className="text-xs font-mono text-gray-400">Algorithm & Token Type</span>
            </div>
            <div className="p-4 relative group">
               <pre className="font-mono text-sm text-red-500 whitespace-pre-wrap break-all">
                {header ? JSON.stringify(header, null, 2) : <span className="text-gray-300 italic">waiting for input...</span>}
               </pre>
               {header && (
                   <button 
                        onClick={() => handleCopy(JSON.stringify(header, null, 2))}
                        className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 rounded-md text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                       <Copy size={14} />
                   </button>
               )}
            </div>
          </div>

          {/* Payload */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Payload</span>
              <span className="text-xs font-mono text-gray-400">Data</span>
            </div>
            <div className="p-4 relative group">
               <pre className="font-mono text-sm text-purple-600 whitespace-pre-wrap break-all">
                {payload ? JSON.stringify(payload, null, 2) : <span className="text-gray-300 italic">waiting for input...</span>}
               </pre>
                {payload && (
                   <button 
                        onClick={() => handleCopy(JSON.stringify(payload, null, 2))}
                        className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 rounded-md text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                       <Copy size={14} />
                   </button>
               )}
            </div>
          </div>

          {/* Signature */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Signature</span>
              <span className="text-xs font-mono text-gray-400">Verify Signature</span>
            </div>
            <div className="p-4 relative group">
               <pre className="font-mono text-sm text-blue-500 whitespace-pre-wrap break-all">
                {signature ? signature : <span className="text-gray-300 italic">waiting for input...</span>}
               </pre>
               {signature && (
                   <button 
                        onClick={() => handleCopy(signature)}
                        className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 rounded-md text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                       <Copy size={14} />
                   </button>
               )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
