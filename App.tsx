import React, { useState } from 'react';
import { generateOrEditImage } from './services/geminiService';
import { ImageStyle, GenerationState } from './types';
import { Button } from './components/Button';
import { StyleSelector } from './components/StyleSelector';
import { 
  SparklesIcon, 
  ArrowDownTrayIcon, 
  ArrowPathIcon, 
  PencilSquareIcon, 
  PhotoIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const DEFAULT_CONTEXT = `AI has introduced a new term for non-tech members: "No-code Expert Engineers." This innovative name reflects the growing importance of individuals who can contribute to technology projects without traditional coding skills.`;
const DEFAULT_PROMPT = `A diverse group of professionals collaborating around a futuristic holographic interface showing code blocks connecting automatically. Bright, optimistic atmosphere.`;

const App: React.FC = () => {
  // Input State
  const [postContext, setPostContext] = useState(DEFAULT_CONTEXT);
  const [imagePrompt, setImagePrompt] = useState(DEFAULT_PROMPT);
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>(ImageStyle.ILLUSTRATION);
  
  // Generation State
  const [genState, setGenState] = useState<GenerationState>({
    status: 'idle',
    error: null,
    data: null,
  });

  // Edit Mode State (for the result card)
  const [isEditMode, setIsEditMode] = useState(false);
  const [editInstruction, setEditInstruction] = useState("");

  const handleGenerate = async () => {
    if (!imagePrompt.trim()) return;

    setGenState(prev => ({ ...prev, status: 'generating', error: null }));
    setIsEditMode(false);

    try {
      const url = await generateOrEditImage({
        postContext,
        imageDescription: imagePrompt,
        style: selectedStyle
      });

      setGenState({
        status: 'success',
        error: null,
        data: { url, prompt: imagePrompt, originalContext: postContext }
      });
    } catch (error: any) {
      setGenState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: error.message 
      }));
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleEditImage = async () => {
    if (!genState.data?.url || !editInstruction.trim()) return;

    setGenState(prev => ({ ...prev, status: 'editing', error: null }));
    
    try {
      const url = await generateOrEditImage({
        imageDescription: editInstruction,
        sourceImageBase64: genState.data.url
      });

      setGenState({
        status: 'success',
        error: null,
        data: { 
          url, 
          prompt: editInstruction, // Update prompt to the edit instruction for reference
          originalContext: postContext 
        }
      });
      setIsEditMode(false);
      setEditInstruction("");
    } catch (error: any) {
      setGenState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: error.message 
      }));
    }
  };

  const handleDownload = () => {
    if (!genState.data?.url) return;
    const link = document.createElement('a');
    link.href = genState.data.url;
    link.download = `nocode-visual-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white p-2 rounded-lg shadow-sm">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">LinkedIn Visuals AI</span>
          </div>
          <div className="text-xs font-medium text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            No-Code Expert Engineer Edition
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left Panel: Inputs */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto p-6 lg:p-8 border-r border-gray-200 bg-white">
          <div className="max-w-xl mx-auto space-y-8">
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create your post visual</h2>
              
              {/* Context Input */}
              <div className="space-y-2 mb-6">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-500" />
                  1. LinkedIn Post Context (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-2">Paste your post text here to give the AI context about the topic.</p>
                <textarea
                  className="w-full p-4 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none text-sm"
                  rows={4}
                  placeholder="e.g. We are launching a new product feature today..."
                  value={postContext}
                  onChange={(e) => setPostContext(e.target.value)}
                />
              </div>

              {/* Prompt Input */}
              <div className="space-y-2 mb-6">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <PhotoIcon className="w-4 h-4 mr-2 text-gray-500" />
                  2. Image Description (Required)
                </label>
                <p className="text-xs text-gray-500 mb-2">Describe exactly what you want to see in the image.</p>
                <textarea
                  className="w-full p-4 rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none text-base"
                  rows={4}
                  placeholder="e.g. A futuristic minimalist workspace with a neon blue glow..."
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                />
              </div>

              {/* Style Selector */}
              <div className="mb-8">
                <StyleSelector 
                  selectedStyle={selectedStyle} 
                  onSelect={setSelectedStyle} 
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                isLoading={genState.status === 'generating'}
                disabled={!imagePrompt.trim()}
                className="w-full h-12 text-lg shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all"
              >
                {genState.status === 'generating' ? 'Creating Magic...' : 'Generate Image'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-gray-50 p-6 lg:p-8 flex flex-col items-center justify-center relative">
          
          <div className="w-full max-w-xl">
            
            {/* Empty State */}
            {genState.status === 'idle' && (
              <div className="text-center text-gray-400 py-20 border-2 border-dashed border-gray-200 rounded-3xl">
                <PhotoIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Your masterpiece awaits</p>
                <p className="text-sm">Fill in the details on the left to start.</p>
              </div>
            )}

            {/* Loading State */}
            {(genState.status === 'generating' || genState.status === 'editing') && (
              <div className="aspect-square w-full bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center justify-center p-8">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
                  <SparklesIcon className="absolute inset-0 m-auto w-8 h-8 text-brand-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 animate-pulse">
                  {genState.status === 'editing' ? 'Refining your image...' : 'Dreaming up pixels...'}
                </h3>
                <p className="text-gray-500 mt-2 text-center max-w-xs">
                  {genState.status === 'editing' 
                    ? 'Applying your changes while keeping the good parts.' 
                    : 'Using Gemini 2.5 Flash to visualize your concept.'}
                </p>
              </div>
            )}

            {/* Error State */}
            {genState.status === 'error' && (
              <div className="aspect-square w-full bg-red-50 rounded-3xl border-2 border-red-100 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <XMarkIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-red-800 mb-2">Generation Failed</h3>
                <p className="text-red-600 mb-6">{genState.error}</p>
                <Button variant="outline" onClick={handleGenerate}>Try Again</Button>
              </div>
            )}

            {/* Success / Image View */}
            {genState.data && genState.status === 'success' && (
              <div className="relative group">
                <div className="bg-white p-3 rounded-3xl shadow-2xl shadow-gray-200/50 border border-white transition-transform duration-300 hover:scale-[1.01]">
                  <img 
                    src={genState.data.url} 
                    alt="Generated result" 
                    className="w-full aspect-square object-cover rounded-2xl"
                  />
                  
                  {/* Action Bar under image */}
                  <div className="mt-4 flex items-center justify-between px-2 pb-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={handleRegenerate}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Regenerate with same prompt"
                      >
                        <ArrowPathIcon className="w-4 h-4 mr-2" />
                        Regenerate
                      </button>
                      
                      <button 
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isEditMode ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        <PencilSquareIcon className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                    </div>

                    <Button variant="primary" onClick={handleDownload} className="!py-2 !px-4 !text-sm">
                      <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  {/* Edit Overlay Panel */}
                  {isEditMode && (
                    <div className="mt-3 p-4 bg-brand-50 rounded-xl border border-brand-100 animate-fadeIn">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-brand-900">
                          How should we change this image?
                        </label>
                        <button onClick={() => setIsEditMode(false)} className="text-brand-400 hover:text-brand-600">
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          className="flex-grow rounded-lg border-brand-200 focus:ring-brand-500 focus:border-brand-500 text-sm"
                          placeholder="e.g. Make it brighter, add a laptop..."
                          value={editInstruction}
                          onChange={(e) => setEditInstruction(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleEditImage()}
                          autoFocus
                        />
                        <Button 
                          onClick={handleEditImage} 
                          disabled={!editInstruction.trim()}
                          className="!py-2 !px-4 !text-sm whitespace-nowrap"
                        >
                          Update Image
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Prompt used badge */}
                <div className="mt-4 text-center">
                  <span className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-500 max-w-full truncate">
                    Generated from: "{genState.data.prompt.substring(0, 50)}{genState.data.prompt.length > 50 ? '...' : ''}"
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
