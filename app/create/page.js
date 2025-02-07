'use client'
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowRight, Sparkles, AlertCircle, MessageCircle, Brain, GripHorizontal, PlusCircle, Trash2, Grid, AlignJustify, Download, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import html2canvas from 'html2canvas';

const BubbleStyle = {
  normal: "rounded-xl border-2",
  shout: "rounded-lg border-4 bg-yellow-50",
  whisper: "rounded-3xl border border-dashed",
  think: "rounded-full",
  electronic: "polygon-[75%_0,_100%_50%,_75%_100%,_0_100%,_25%_50%,_0_0]",
  emphasis: "rounded-lg border-4",
  cloud: "path-[M3,0 L7,0 C8,0 9,1 9,2 L9,8 C9,9 8,10 7,10 L3,10 C2,10 1,9 1,8 L1,2 C1,1 2,0 3,0 Z]",
  spiral: "rounded-full",
};

const SpeechBubble = ({ 
  text: initialText, 
  style = 'normal', 
  type = 'dialogue', 
  position, 
  onDragEnd, 
  onTextChange,
  isSelected,
  onSelect,
  panelIndex,
  bubbleIndex,
  onDelete
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const [pos, setPos] = useState(position || { x: 50, y: 50 });
  const bubbleRef = useRef(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, initialX: 0, initialY: 0 });
  const [indicatorAngle, setIndicatorAngle] = useState(0);
  const [isRotatingIndicator, setIsRotatingIndicator] = useState(false);
  const indicatorRef = useRef(null);
  
  // Store callbacks in refs to avoid dependency issues
  const onDragEndRef = useRef(onDragEnd);
  const posRef = useRef(pos);

  // Update refs when props/state change
  useEffect(() => {
    onDragEndRef.current = onDragEnd;
    posRef.current = pos;
  }, [onDragEnd, pos]);

  const handleMouseDown = (e) => {
    if (isEditing) return;
    
    const parentRect = bubbleRef.current.parentElement.getBoundingClientRect();
    
    // Store the initial mouse position relative to the parent
    dragStartRef.current = {
      mouseX: e.clientX - parentRect.left,
      mouseY: e.clientY - parentRect.top,
      initialX: pos.x,
      initialY: pos.y
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!bubbleRef.current) return;

      const parentRect = bubbleRef.current.parentElement.getBoundingClientRect();
      
      // Calculate mouse movement delta
      const deltaX = e.clientX - parentRect.left - dragStartRef.current.mouseX;
      const deltaY = e.clientY - parentRect.top - dragStartRef.current.mouseY;

      // Calculate new position as percentage
      const xPercent = dragStartRef.current.initialX + (deltaX / parentRect.width) * 100;
      const yPercent = dragStartRef.current.initialY + (deltaY / parentRect.height) * 100;

      // Constrain to boundaries (0% to 100%)
      const constrainedX = Math.max(0, Math.min(100, xPercent));
      const constrainedY = Math.max(0, Math.min(100, yPercent));

      setPos({
        x: constrainedX,
        y: constrainedY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (onDragEndRef.current) {
        onDragEndRef.current(posRef.current);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]); // Only depend on isDragging state

  // Handle back button/escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle escape to exit edit mode
      if (e.key === 'Escape' && isEditing) {
        e.preventDefault();
        setIsEditing(false);
        if (text !== initialText) {
          onTextChange(text);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, text, initialText, onTextChange]);

  // Handle double click to edit
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    onSelect();
  };

  // Add this function at the top of the SpeechBubble component
  const adjustTextareaHeight = (element) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  // Update the handleTextChange function
  const handleTextChange = (e) => {
    e.stopPropagation();
    setText(e.target.value);
    onTextChange(e.target.value);
    adjustTextareaHeight(e.target);
  };

  // Handle blur (clicking outside)
  const handleBlur = () => {
    setIsEditing(false);
    if (text !== initialText) {
      onTextChange(text);
    }
  };

  const bubbleStyle = {
    position: 'absolute',
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    transform: 'translate(-50%, -50%)',
    cursor: isDragging ? 'grabbing' : 'grab',
    maxWidth: '40%',
    padding: '0.5rem 1rem',
    backgroundColor: 'white',
    borderRadius: '1.5rem',
    fontSize: '0.75rem',
    lineHeight: '1.2',
    zIndex: isDragging ? 50 : 10,
    userSelect: 'none',
    transition: isDragging ? 'none' : 'box-shadow 0.2s',
    boxShadow: isDragging 
      ? 'rgba(0, 0, 0, 0.2) 0px 8px 16px'
      : 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
    fontFamily: 'var(--font-comic)',
    fontWeight: style === 'shout' ? 700 : 400,
    textTransform: style === 'shout' ? 'uppercase' : 'none',
    letterSpacing: style === 'whisper' ? '0.05em' : 'normal',
    clipPath: type === 'dialogue' ? 
      'path("M 0,10 C 0,4.477 4.477,0 10,0 H calc(100% - 10) C calc(100% - 4.477),0 100%,4.477 100%,10 V calc(100% - 10) C 100%,calc(100% - 4.477) calc(100% - 4.477),100% calc(100% - 10),100% H 10 C 4.477,100% 0,calc(100% - 4.477) 0,calc(100% - 10) Z")' : 
      'none',
  };

  // For thought bubbles, add circular indicators
  const thoughtBubbleStyle1 = {
    position: 'absolute',
    width: '10px',
    height: '10px',
    backgroundColor: 'white',
    borderRadius: '50%',
    bottom: '-12px',  // Moved closer to bubble
    left: '50%',
    transform: 'translateX(-50%)',
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
  };

  const thoughtBubbleStyle2 = {
    position: 'absolute',
    width: '6px',
    height: '6px',
    backgroundColor: 'white',
    borderRadius: '50%',
    bottom: '-20px',  // Adjusted spacing
    left: '50%',
    transform: 'translateX(-50%)',
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
  };

  const thoughtBubbleStyle3 = {
    position: 'absolute',
    width: '4px',
    height: '4px',
    backgroundColor: 'white',
    borderRadius: '50%',
    bottom: '-26px',  // Adjusted spacing
    left: '50%',
    transform: 'translateX(-50%)',
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
  };

  // Only render tail/indicators for dialogue and thought bubbles
  const showIndicator = type === 'dialogue' || type === 'thought';

  // Add handler for indicator rotation
  const handleIndicatorMouseDown = (e) => {
    e.stopPropagation(); // Prevent bubble drag when rotating indicator
    setIsRotatingIndicator(true);
  };

  useEffect(() => {
    if (!isRotatingIndicator) return;

    const handleMouseMove = (e) => {
      if (!bubbleRef.current || !indicatorRef.current) return;

      const bubbleRect = bubbleRef.current.getBoundingClientRect();
      const bubbleCenter = {
        x: bubbleRect.left + bubbleRect.width / 2,
        y: bubbleRect.top + bubbleRect.height / 2
      };

      // Calculate angle between bubble center and mouse position
      const angle = Math.atan2(
        e.clientY - bubbleCenter.y,
        e.clientX - bubbleCenter.x
      ) * (180 / Math.PI);

      setIndicatorAngle(angle + 90); // Add 90 degrees to make 0 point downward
    };

    const handleMouseUp = () => {
      setIsRotatingIndicator(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isRotatingIndicator]);

  // Update indicator styles
  const indicatorStyle = {
    position: 'absolute',
    left: '50%',
    bottom: '-20px',  // Position at the border
    transform: `translateX(-50%) rotate(${indicatorAngle}deg)`,
    transformOrigin: 'top center',
    cursor: 'grab',
    zIndex: 5,
  };

  return (
    <div
      ref={bubbleRef}
      data-bubble={type}
      style={{
        position: 'absolute',
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: isSelected ? 30 : 20,
        pointerEvents: 'auto',
        maxWidth: '200px',
        minWidth: '100px',
      }}
      onMouseDown={(e) => {
        if (e.detail === 1) { // Single click
          onSelect?.();
        }
        handleMouseDown(e);
      }}
      onDoubleClick={handleDoubleClick}
      className={`bg-white p-2 shadow-sm ${BubbleStyle[style]} 
        ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {isEditing ? (
        <textarea
          autoFocus
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          className="bg-transparent resize-none outline-none w-full font-comic overflow-hidden"
          style={{ 
            height: 'auto',
            minHeight: '1.2em',
            fontFamily: 'var(--font-comic)',
            fontSize: type === 'dialogue' ? '0.875rem' : '0.75rem',
            fontWeight: style === 'shout' ? 700 : 400,
          }}
          onFocus={(e) => adjustTextareaHeight(e.target)}
        />
      ) : (
        <div 
          style={{
            textAlign: style === 'shout' ? 'center' : 'left',
            fontStyle: type === 'thought' ? 'italic' : 'normal',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
          onDoubleClick={handleDoubleClick}
        >
          {text}
        </div>
      )}
      
      {showIndicator && (
        type === 'dialogue' ? (
          <div 
            ref={indicatorRef}
            className="dialogue-tail"
            style={indicatorStyle}
            onMouseDown={handleIndicatorMouseDown}
          />
        ) : (
          <div 
            ref={indicatorRef}
            style={indicatorStyle}
            onMouseDown={handleIndicatorMouseDown}
          >
            <div style={thoughtBubbleStyle1} />
            <div style={thoughtBubbleStyle2} />
            <div style={thoughtBubbleStyle3} />
          </div>
        )
      )}

      {/* Drag hint */}
      <div className="absolute -top-5 left-0 w-full text-center text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
        Drag to move
      </div>
    </div>
  );
};

const capturePanel = async (panelIndex) => {
  try {
    const panel = document.querySelector(`[data-panel="${panelIndex}"]`);
    if (!panel) return;

    // Hide delete buttons before capture
    const deleteButtons = panel.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => button.style.display = 'none');

    // Make sure bubbles are visible
    const bubbles = panel.querySelectorAll('[data-bubble]');
    bubbles.forEach(bubble => {
      bubble.style.opacity = '1';
      bubble.style.visibility = 'visible';
    });

    // Use html2canvas with specific options
    const canvas = await html2canvas(panel, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      scale: 2, // Higher quality
      logging: false,
      onclone: (clonedDoc) => {
        // Ensure Next.js images are loaded in clone
        const images = clonedDoc.getElementsByTagName('img');
        Array.from(images).forEach(img => {
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
        });
      }
    });

    // Restore delete buttons
    deleteButtons.forEach(button => button.style.display = '');

    // Convert to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `panel-${panelIndex + 1}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png', 1.0);

  } catch (error) {
    console.error('Failed to capture panel:', error);
  }
};

// Add this component before CreatePage
const LoadingPanel = ({ index, total }) => {
  return (
    <div className="aspect-square bg-gray-50 rounded-lg p-4 relative overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" 
           style={{ backgroundSize: '200% 100%' }}
      />
      
      {/* Loading content */}
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium text-gray-900">
            Generating panel {index + 1} of {total}
          </p>
          <p className="text-xs text-gray-500">
            This might take a minute due to rate limits...
          </p>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gray-300 rounded-full animate-progress" />
        </div>
      </div>
    </div>
  );
};

export default function CreatePage() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('manga');
  const [panels, setPanels] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedPanels, setGeneratedPanels] = useState([]);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [isGridLayout, setIsGridLayout] = useState(true);
  const [selectedBubble, setSelectedBubble] = useState(null); // { panelIndex, type, bubbleIndex }
  const [editingBubble, setEditingBubble] = useState(null);

  const handleSave = async (type = 'grid') => {
    if (!generatedPanels?.length) return;

    try {
      if (type === 'grid') {
        // Get the grid container element
        const gridContainer = document.querySelector('.grid');
        if (!gridContainer) return;

        // Temporarily hide delete buttons
        const deleteButtons = gridContainer.querySelectorAll('.delete-button');
        deleteButtons.forEach(button => button.style.display = 'none');

        // Capture the grid
        const canvas = await html2canvas(gridContainer, {
          backgroundColor: null,
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
        });

        // Restore delete buttons
        deleteButtons.forEach(button => button.style.display = '');

        // Convert and download
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'comic-grid.png';
          a.click();
          URL.revokeObjectURL(url);
        }, 'image/png');
      } else {
        // Individual panel save
        const selectedPanelData = generatedPanels[selectedPanel];
        if (!selectedPanelData) return;

        const response = await fetch('/api/capture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: selectedPanelData.url,
            dialogues: selectedPanelData.dialogues || [],
            thoughts: selectedPanelData.thoughts || [],
          }),
        });

        if (!response.ok) throw new Error('Failed to capture panel');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `panel-${selectedPanel + 1}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style,
          panels,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate panels');

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setGeneratedPanels(data.images.map(image => ({
        ...image,
        dialogues: [],
        thoughts: [],
      })));
    } catch (error) {
      console.error('Generation error:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsGenerating(false);
    }
  };

  const addBubble = (panelIndex, type = 'dialogue') => {
    const updatedPanels = [...generatedPanels];
    const panel = updatedPanels[panelIndex];
    
    const newBubble = {
      text: type === 'dialogue' ? 'New dialogue' : 'New thought',
      style: 'normal',
      position: 'center',
      coords: { x: 50, y: 50 }
    };

    if (type === 'dialogue') {
      // Initialize dialogues array if it doesn't exist
      if (!Array.isArray(panel.dialogues)) {
        panel.dialogues = [];
      }
      panel.dialogues.push(newBubble);
    } else {
      // Initialize thoughts array if it doesn't exist
      if (!Array.isArray(panel.thoughts)) {
        panel.thoughts = [];
      }
      panel.thoughts.push(newBubble);
    }

    setGeneratedPanels(updatedPanels);
  };

  const deleteBubble = (panelIndex, type, bubbleIndex) => {
    const updatedPanels = [...generatedPanels];
    const panel = updatedPanels[panelIndex];
    
    if (type === 'dialogue' && Array.isArray(panel.dialogues)) {
      // Remove the specific dialogue bubble
      panel.dialogues = panel.dialogues.filter((_, index) => index !== bubbleIndex);
    } else if (type === 'thought' && Array.isArray(panel.thoughts)) {
      // Remove the specific thought bubble
      panel.thoughts = panel.thoughts.filter((_, index) => index !== bubbleIndex);
    }

    setGeneratedPanels(updatedPanels);
    setSelectedBubble(null); // Clear selection after deletion
  };

  const addDialogue = (panelIndex) => {
    const updatedPanels = [...generatedPanels];
    if (!updatedPanels[panelIndex].dialogues) {
      updatedPanels[panelIndex].dialogues = [];
    }
    
    updatedPanels[panelIndex].dialogues.push({
      text: "New dialogue",
      style: "normal",
      position: { x: 50, y: 50 }, // Center of panel
      coords: { x: 50, y: 50 }
    });
    
    setGeneratedPanels(updatedPanels);
  };

  const addThought = (panelIndex) => {
    const updatedPanels = [...generatedPanels];
    if (!updatedPanels[panelIndex].thoughts) {
      updatedPanels[panelIndex].thoughts = [];
    }
    
    updatedPanels[panelIndex].thoughts.push({
      text: "New thought",
      style: "normal",
      position: { x: 50, y: 50 }, // Center of panel
      coords: { x: 50, y: 50 }
    });
    
    setGeneratedPanels(updatedPanels);
  };

  const getLayoutClass = (totalPanels, isGridLayout) => {
    // Always return single column since we're displaying one image
    return "grid-cols-1 gap-4";
  };

  // Update the keyboard event handler for delete/backspace
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle delete/backspace if:
      // 1. No other keys are pressed (no Ctrl, Alt, Shift, etc.)
      // 2. We have a selected bubble
      // 3. We're not in editing mode
      if (
        (e.key === 'Delete' || e.key === 'Backspace') && 
        selectedBubble && 
        !e.ctrlKey && 
        !e.altKey && 
        !e.shiftKey && 
        !e.metaKey && 
        !document.querySelector('textarea:focus, input:focus')
      ) {
        e.preventDefault();
        deleteBubble(
          selectedBubble.panelIndex,
          selectedBubble.type,
          selectedBubble.bubbleIndex
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBubble]);

  // Add click handler to clear selection when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-bubble]')) {
        setSelectedBubble(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-medium text-gray-900 mb-2">
              Create your comic
            </h1>
            <p className="text-sm text-gray-600">
              Describe your scene in detail. Include characters, actions, emotions, and setting.
            </p>
          </div>

          <div className="space-y-4">
            {/* Style Selection */}
            <div className="grid grid-cols-3 gap-2">
              {['manga', 'comic', 'realistic'].map((styleOption) => (
                <button
                  key={styleOption}
                  onClick={() => setStyle(styleOption)}
                  className={`px-4 py-2 text-sm rounded-md border ${
                    style === styleOption 
                      ? 'border-gray-900 text-gray-900 bg-gray-50' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {styleOption.charAt(0).toUpperCase() + styleOption.slice(1)}
                </button>
              ))}
            </div>

            {/* Panel Count */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setPanels(num)}
                  className={`px-4 py-2 text-sm rounded-md border ${
                    panels === num 
                      ? 'border-gray-900 text-gray-900 bg-gray-50' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {num} {num === 1 ? 'Panel' : 'Panels'}
                </button>
              ))}
            </div>

            {/* Scene Description */}
            <Textarea 
              placeholder="A young hero standing on a rooftop at sunset, cape flowing in the wind..."
              className="min-h-[200px] text-base resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            {error && (
              <div className="text-red-500 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button 
              className="w-full bg-black hover:bg-gray-900 text-white text-sm rounded
                        transition-colors duration-200 flex items-center justify-center h-11"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                  Generating story...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Generate comic <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </div>

          {/* Tips Section */}
          <div className="border-t border-gray-100 pt-6 space-y-4">
            <h2 className="text-sm font-medium text-gray-900">Tips for {style} style</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              {style === 'manga' && (
                <>
                  <li>• Use dynamic angles and expressive character emotions</li>
                  <li>• Consider speed lines and impact frames</li>
                  <li>• Think about panel layout and flow</li>
                </>
              )}
              {style === 'comic' && (
                <>
                  <li>• Focus on bold, clear character designs</li>
                  <li>• Use strong colors and dramatic lighting</li>
                  <li>• Consider classic superhero poses</li>
                </>
              )}
              {style === 'realistic' && (
                <>
                  <li>• Describe detailed lighting and shadows</li>
                  <li>• Include specific facial features and expressions</li>
                  <li>• Add environmental details for atmosphere</li>
                </>
              )}
              <li>• Specify any particular art style you want</li>
            </ul>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:border-l lg:border-gray-100 lg:pl-8">
          <div className="sticky top-24">
            {/* Layout toggle */}
            <div className="flex justify-end mb-4 gap-2">
              {/* Save options - Only show when panels are generated */}
              {generatedPanels.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-1 flex gap-1">
                  <button
                    onClick={() => handleSave('grid')}
                    className="p-1.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                    title="Save all panels"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-sm">Save All</span>
                  </button>
                  <button
                    onClick={() => handleSave('single')}
                    className="p-1.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                    title="Save current panel"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-sm">Save Panel</span>
                  </button>
                </div>
              )}

              {/* Existing layout toggle */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-1 flex gap-1">
                <button
                  onClick={() => setIsGridLayout(true)}
                  className={`p-1.5 rounded ${
                    isGridLayout 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Grid layout"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsGridLayout(false)}
                  className={`p-1.5 rounded ${
                    !isGridLayout 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Single column layout"
                >
                  <AlignJustify className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Panels container with dynamic layout */}
            <div className="w-full">
              {isGenerating ? (
                <div className="space-y-6">
                  <div className="text-center space-y-2 mb-8">
                    <h3 className="text-lg font-medium text-gray-900">
                      Creating your comic
                    </h3>
                    <p className="text-sm text-gray-500 animate-loading-text">
                      Generating a {panels}-panel comic page...
                    </p>
                  </div>

                  {/* Single loading panel */}
                  <div className="w-full max-w-4xl mx-auto">
                    <LoadingPanel index={0} total={1} />
                  </div>
                </div>
              ) : generatedPanels.length > 0 ? (
                // Generated panels with correct layout
                <div className={`grid ${getLayoutClass(panels, isGridLayout)} w-full max-w-4xl gap-4 mx-auto`}>
                  {generatedPanels.map((panel, i) => (
                    <div 
                      key={i} 
                      data-panel={i}
                      className="relative group bg-white rounded-lg shadow-sm"
                      onClick={() => setSelectedPanel(i)}
                      style={{ 
                        isolation: 'isolate',
                        transform: 'none',
                        position: 'relative',
                        overflow: 'visible'
                      }}
                    >
                      {/* Image */}
                      <Image
                        src={panel.url}
                        alt="Comic page"
                        width={1024}
                        height={1024}
                        className="w-full h-auto rounded-lg"
                      />

                      {/* Add buttons - Updated positioning and visibility */}
                      <div className="absolute top-2 right-2 flex gap-1 z-20">
                        <button
                          onClick={() => addDialogue(i)}
                          className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                          title="Add dialogue bubble"
                        >
                          <MessageCircle className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => addThought(i)}
                          className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                          title="Add thought bubble"
                        >
                          <Brain className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Dialogue bubbles container */}
                      <div className="absolute inset-0">
                        {panel.dialogues?.map((dialogue, dialogueIndex) => (
                          <div key={`dialogue-${dialogueIndex}`} className="absolute inset-0">
                            <SpeechBubble 
                              text={dialogue.text}
                              style={dialogue.style}
                              position={dialogue.position}
                              type="dialogue"
                              panelIndex={i}
                              bubbleIndex={dialogueIndex}
                              isSelected={selectedBubble?.panelIndex === i && 
                                         selectedBubble?.type === 'dialogue' && 
                                         selectedBubble?.bubbleIndex === dialogueIndex}
                              onSelect={() => setSelectedBubble({
                                panelIndex: i,
                                type: 'dialogue',
                                bubbleIndex: dialogueIndex
                              })}
                              onDelete={() => {
                                deleteBubble(i, 'dialogue', dialogueIndex);
                                setSelectedBubble(null);
                              }}
                              onDragEnd={(coords) => {
                                const updatedPanels = [...generatedPanels];
                                updatedPanels[i].dialogues[dialogueIndex].position = coords;
                                setGeneratedPanels(updatedPanels);
                              }}
                              onTextChange={(newText) => {
                                const updatedPanels = [...generatedPanels];
                                updatedPanels[i].dialogues[dialogueIndex].text = newText;
                                setGeneratedPanels(updatedPanels);
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteBubble(i, 'dialogue', dialogueIndex);
                                setSelectedBubble(null);
                              }}
                              className="delete-button absolute -top-2 -right-2 p-1 bg-white rounded-full 
                                         shadow-sm hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete bubble"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Thought bubbles container */}
                      <div className="absolute inset-0">
                        {panel.thoughts?.map((thought, thoughtIndex) => (
                          <div key={`thought-${thoughtIndex}`} className="absolute inset-0">
                            <SpeechBubble 
                              text={thought.text}
                              style={thought.style}
                              position={thought.position}
                              type="thought"
                              panelIndex={i}
                              bubbleIndex={thoughtIndex}
                              isSelected={selectedBubble?.panelIndex === i && 
                                         selectedBubble?.type === 'thought' && 
                                         selectedBubble?.bubbleIndex === thoughtIndex}
                              onSelect={() => setSelectedBubble({
                                panelIndex: i,
                                type: 'thought',
                                bubbleIndex: thoughtIndex
                              })}
                              onDelete={() => {
                                deleteBubble(i, 'thought', thoughtIndex);
                                setSelectedBubble(null);
                              }}
                              onDragEnd={(coords) => {
                                const updatedPanels = [...generatedPanels];
                                updatedPanels[i].thoughts[thoughtIndex].position = coords;
                                setGeneratedPanels(updatedPanels);
                              }}
                              onTextChange={(newText) => {
                                const updatedPanels = [...generatedPanels];
                                updatedPanels[i].thoughts[thoughtIndex].text = newText;
                                setGeneratedPanels(updatedPanels);
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteBubble(i, 'thought', thoughtIndex);
                                setSelectedBubble(null);
                              }}
                              className="delete-button absolute -top-2 -right-2 p-1 bg-white rounded-full 
                                         shadow-sm hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete bubble"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Empty state with same layout options
                <div className={`grid ${getLayoutClass(panels, isGridLayout)} w-full max-w-4xl gap-4 mx-auto`}>
                  {Array.from({ length: panels }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`aspect-square bg-gray-50 rounded-lg flex items-center justify-center ${
                        panels === 3 && i === 2 && isGridLayout ? 'col-start-1 row-start-2' : ''
                      }`}
                    >
                      <p className="text-sm text-gray-500">Panel {i + 1}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}