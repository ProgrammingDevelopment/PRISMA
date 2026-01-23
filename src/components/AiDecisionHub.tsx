"use client";

import React, { useState } from 'react';
import { aiService, OptimizationInput } from '../Services/aiService';

export default function AiDecisionHub() {
    const [chatPrompt, setChatPrompt] = useState('');
    const [chatResponse, setChatResponse] = useState('');
    const [chatSource, setChatSource] = useState('');
    const [loadingChat, setLoadingChat] = useState(false);
    const [useLocal, setUseLocal] = useState(false);

    const [optInput, setOptInput] = useState<OptimizationInput>({ resourceA: 100, resourceB: 200, targetOutput: 150 });
    const [optResult, setOptResult] = useState<any>(null);
    const [loadingOpt, setLoadingOpt] = useState(false);

    // Memory/RAG State
    const [memoryTab, setMemoryTab] = useState(false);
    const [memKey, setMemKey] = useState('');
    const [memDesc, setMemDesc] = useState('');
    const [memText, setMemText] = useState('');
    const [memQuery, setMemQuery] = useState('');
    const [memResult, setMemResult] = useState('');

    const handleChat = async () => {
        if (!chatPrompt) return;
        setLoadingChat(true);
        setChatResponse('');
        setChatSource('');

        let res;
        if (useLocal) {
            res = await aiService.getLocalDecision(chatPrompt);
        } else {
            res = await aiService.getChatDecision(chatPrompt);
        }

        setChatResponse(res.decision);
        setChatSource(res.source || 'Unknown');
        setLoadingChat(false);
    };

    const handleOptimize = async () => {
        setLoadingOpt(true);
        try {
            const res = await aiService.optimizeResources(optInput);
            setOptResult(res);
        } catch (e) {
            setOptResult({ status: 'Error optimizing' });
        }
        setLoadingOpt(false);
    };

    const handleSaveMemory = async () => {
        const res = await aiService.saveMemory(memKey, memDesc, memText);
        alert(res);
    };

    const handleSearchMemory = async () => {
        const res = await aiService.searchMemory(memQuery);
        setMemResult(res);
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
            <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                AI Decision & Optimization Hub
            </h1>

            <div className="flex justify-center mb-6 space-x-4">
                <button
                    onClick={() => setMemoryTab(false)}
                    className={`px-4 py-2 rounded-lg ${!memoryTab ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                    Decisions & Chat
                </button>
                <button
                    onClick={() => setMemoryTab(true)}
                    className={`px-4 py-2 rounded-lg ${memoryTab ? 'bg-green-600' : 'bg-gray-700'}`}
                >
                    Knowledge Base (Vector Search)
                </button>
            </div>

            {!memoryTab ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">

                    {/* Chat Decision Section */}
                    <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 hover:border-blue-500 transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-blue-300">AI Assistant</h2>
                            <div className="flex items-center space-x-2">
                                <span className={`text-sm ${!useLocal ? 'text-blue-400 font-bold' : 'text-gray-500'}`}>Gemini</span>
                                <button
                                    onClick={() => setUseLocal(!useLocal)}
                                    className={`w-12 h-6 rounded-full p-1 transition-all ${useLocal ? 'bg-green-600' : 'bg-blue-600'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${useLocal ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                                <span className={`text-sm ${useLocal ? 'text-green-400 font-bold' : 'text-gray-500'}`}>Local (Ollama)</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <textarea
                                className="w-full h-32 bg-gray-900 border border-gray-600 rounded-xl p-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder={useLocal ? "Ask your local model..." : "Ask Gemini API..."}
                                value={chatPrompt}
                                onChange={(e) => setChatPrompt(e.target.value)}
                            />
                            <button
                                onClick={handleChat}
                                disabled={loadingChat}
                                className={`w-full py-3 rounded-xl font-medium transition-all disabled:opacity-50 ${useLocal ? 'bg-gradient-to-r from-green-600 to-teal-800' : 'bg-gradient-to-r from-blue-600 to-blue-800'}`}
                            >
                                {loadingChat ? 'Thinking...' : `Get Decision (${useLocal ? 'Local' : 'Cloud'})`}
                            </button>

                            {chatResponse && (
                                <div className="mt-6 p-4 bg-gray-700/50 rounded-xl border border-gray-600 animate-fade-in">
                                    <div className="flex justify-between mb-2">
                                        <h3 className="text-sm font-bold text-gray-400">Response:</h3>
                                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded border border-gray-600">{chatSource}</span>
                                    </div>
                                    <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">{chatResponse}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Optimization Section */}
                    <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 hover:border-purple-500 transition-all">
                        <h2 className="text-2xl font-semibold mb-4 text-purple-300">Resource Optimizer</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Resource A</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={optInput.resourceA}
                                        onChange={(e) => setOptInput({ ...optInput, resourceA: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Resource B</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={optInput.resourceB}
                                        onChange={(e) => setOptInput({ ...optInput, resourceB: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Target Output</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={optInput.targetOutput}
                                    onChange={(e) => setOptInput({ ...optInput, targetOutput: Number(e.target.value) })}
                                />
                            </div>

                            <button
                                onClick={handleOptimize}
                                disabled={loadingOpt}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl font-medium hover:from-purple-500 hover:to-purple-700 transition-all disabled:opacity-50"
                            >
                                {loadingOpt ? 'Optimizing...' : 'Run Optimization'}
                            </button>

                            {optResult && (
                                <div className="mt-6 p-4 bg-gray-700/50 rounded-xl border border-gray-600 animate-fade-in">
                                    <h3 className="text-sm font-bold text-gray-400 mb-2">Result:</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <p>Allocation A:</p> <p className="font-mono">{optResult.allocationA?.toFixed(2)}</p>
                                        <p>Allocation B:</p> <p className="font-mono">{optResult.allocationB?.toFixed(2)}</p>
                                        <p>Efficiency:</p> <p className="font-mono">{(optResult.efficiency * 100)?.toFixed(1)}%</p>
                                        <p>Status:</p> <p className="text-green-400">{optResult.status}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            ) : (
                /* Knowledge Base / Vector Search Tab */
                <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-4 text-green-300">Semantic Knowledge Base</h2>
                    <p className="text-sm text-gray-400 mb-6">Store and retrieve knowledge using vector embeddings (requires local model).</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4 border-r border-gray-700 pr-4">
                            <h3 className="text-lg font-medium text-white">Add Memory</h3>
                            <input
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2"
                                placeholder="ID/Key (e.g. 'rule-1')"
                                value={memKey} onChange={e => setMemKey(e.target.value)}
                            />
                            <input
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2"
                                placeholder="Description"
                                value={memDesc} onChange={e => setMemDesc(e.target.value)}
                            />
                            <textarea
                                className="w-full h-32 bg-gray-900 border border-gray-600 rounded p-2"
                                placeholder="Content to memorize..."
                                value={memText} onChange={e => setMemText(e.target.value)}
                            />
                            <button onClick={handleSaveMemory} className="w-full py-2 bg-green-700 rounded hover:bg-green-600">Save to Memory</button>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Semantic Search</h3>
                            <input
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2"
                                placeholder="Query (e.g. 'What are the rules?')"
                                value={memQuery} onChange={e => setMemQuery(e.target.value)}
                            />
                            <button onClick={handleSearchMemory} className="w-full py-2 bg-blue-700 rounded hover:bg-blue-600">Search Knowledge</button>

                            <div className="mt-4 p-4 bg-gray-900 rounded h-48 overflow-auto border border-gray-700">
                                <pre className="text-gray-300 whitespace-pre-wrap font-sans text-sm">{memResult || "Results will appear here..."}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
