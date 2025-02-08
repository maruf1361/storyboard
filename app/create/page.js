'use client'
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowRight, Sparkles, AlertCircle, MessageCircle, Brain, GripHorizontal, PlusCircle, Trash2, Grid, AlignJustify, Download, ImageIcon, Loader2, LayoutGrid, LayoutList } from "lucide-react";
import Image from "next/image";
import html2canvas from 'html2canvas';

const BubbleStyle = {
  normal: "rounded-xl border-2 border-gray-900 bg-white shadow-comic",
  shout: "rounded-lg border-4 border-gray-900 bg-yellow-50 shadow-comic",
  whisper: "rounded-3xl border border-dashed border-gray-900 bg-white shadow-comic",
  think: "rounded-full border-2 border-gray-900 bg-white shadow-comic",
  electronic: "clip-path-hex border-2 border-gray-900 bg-white shadow-comic",
  emphasis: "rounded-lg border-4 border-gray-900 bg-white shadow-comic",
  cloud: "bubble-cloud border-2 border-gray-900 bg-white shadow-comic",
  spiral: "rounded-full border-2 border-gray-900 bg-white shadow-comic",
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

  // Update bubble style to ensure text fits in thought bubbles
  const bubbleStyle = {
    position: 'absolute',
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    transform: 'translate(-50%, -50%)',
    cursor: isDragging ? 'grabbing' : 'grab',
    maxWidth: '25%',
    padding: '0.35rem 0.5rem',
    backgroundColor: 'white',
    fontSize: type === 'thought' ? '0.65rem' : '0.75rem',
    lineHeight: '1.1',
    zIndex: isDragging ? 50 : 10,
    userSelect: 'none',
    transition: isDragging ? 'none' : 'all 0.2s',
    fontFamily: 'Comic Neue, "Comic Sans MS", cursive',
    fontWeight: style === 'shout' ? 700 : 400,
    letterSpacing: style === 'whisper' ? '0.05em' : '0.025em',
    border: '1.5px solid #111827',
    boxShadow: isDragging 
      ? '2px 2px 0 rgba(17, 24, 39, 0.9)'
      : '1px 1px 0 rgba(17, 24, 39, 0.9)',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    ...(type === 'thought' && {
      width: 'auto',
      minWidth: '45px',
      maxWidth: '120px',
      aspectRatio: '1/1',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0.5rem',
    }),
  };

  // Update thought bubble indicators to be smaller
  const thoughtBubbleStyle1 = {
    position: 'absolute',
    width: '4px',
    height: '4px',
    backgroundColor: 'white',
    borderRadius: '50%',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    border: '1.5px solid #111827',
  };

  const thoughtBubbleStyle2 = {
    position: 'absolute',
    width: '3px',
    height: '3px',
    backgroundColor: 'white',
    borderRadius: '50%',
    bottom: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    border: '1.5px solid #111827',
  };

  const thoughtBubbleStyle3 = {
    position: 'absolute',
    width: '2px',
    height: '2px',
    backgroundColor: 'white',
    borderRadius: '50%',
    bottom: '-15px',
    left: '50%',
    transform: 'translateX(-50%)',
    border: '1.5px solid #111827',
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
      style={bubbleStyle}
      className={`${BubbleStyle[style]} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <textarea
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          className="bg-transparent resize-none outline-none w-full"
          autoFocus
          style={{
            height: 'auto',
            minHeight: '1.1em',
            fontFamily: 'Comic Neue, "Comic Sans MS", cursive',
            fontSize: type === 'thought' ? '0.65rem' : '0.75rem',
            textAlign: type === 'thought' ? 'center' : 'left',
            letterSpacing: '0.025em',
            lineHeight: '1.1',
          }}
        />
      ) : (
        <div 
          style={{ 
            wordBreak: 'break-word',
            width: '100%',
            textAlign: type === 'thought' ? 'center' : 'left',
            fontSize: type === 'thought' ? '0.65rem' : '0.75rem',
            fontFamily: 'Comic Neue, "Comic Sans MS", cursive',
            letterSpacing: '0.025em',
            lineHeight: '1.1',
          }}
        >
          {text}
        </div>
      )}
      
      {type === 'thought' && (
        <>
          <div style={thoughtBubbleStyle1} />
          <div style={thoughtBubbleStyle2} />
          <div style={thoughtBubbleStyle3} />
        </>
      )}
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

// Update ComicImage component to handle CORS
const ComicImage = ({ src, alt, width, height }) => {
  const [error, setError] = useState(false);

  return (
    <>
      {!error ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto rounded-md"
          onError={() => setError(true)}
          priority
          unoptimized // Add this to bypass image optimization
          crossOrigin="anonymous" // Add this for CORS
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-md">
          <div className="text-center p-4">
            <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Image no longer available</p>
          </div>
        </div>
      )}
    </>
  );
};

// Add this SVG arrow component
const DialogueTail = ({ angle }) => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 20 20" 
    className="dialogue-tail"
    style={{
      position: 'absolute',
      left: '50%',
      bottom: '-20px',
      transform: `translateX(-50%) rotate(${angle}deg)`,
      transformOrigin: 'top center',
      cursor: 'grab',
      zIndex: 5,
    }}
  >
    <path 
      d="M10 0 L20 20 L0 20 Z" 
      fill="white" 
      stroke="#111827" 
      strokeWidth="2"
    />
  </svg>
);

export default function CreatePage() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('manga');
  const [panels, setPanels] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedPanels, setGeneratedPanels] = useState([]);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [layout, setLayout] = useState('grid'); // 'grid' or 'row'

  const handleSave = async () => {
    if (!generatedPanels?.length || !generatedPanels[0]?.url) return;

    try {
      const comicContainer = document.querySelector('.comic-container');
      
      const canvas = await html2canvas(comicContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Hide controls
          const controlButtons = clonedDoc.querySelectorAll('.bubble-controls');
          controlButtons.forEach(button => {
            button.style.display = 'none';
          });

          // Handle bubbles
          const bubbles = clonedDoc.querySelectorAll('[data-bubble]');
          bubbles.forEach(bubble => {
            const originalBubble = document.querySelector(
              `[data-bubble="${bubble.dataset.bubble}"][style*="left: ${bubble.style.left}"]`
            );
            
            if (originalBubble) {
              const originalRect = originalBubble.getBoundingClientRect();
              
              // Apply base styles with smaller dimensions
              bubble.style.position = 'absolute';
              bubble.style.left = originalBubble.style.left;
              bubble.style.top = originalBubble.style.top;
              bubble.style.transform = originalBubble.style.transform;
              bubble.style.fontFamily = 'Comic Neue, "Comic Sans MS", cursive';
              bubble.style.border = '1.5px solid #111827';
              bubble.style.backgroundColor = 'white';
              bubble.style.maxWidth = '25%'; // Reduced from original size

              // Handle thought bubbles specifically
              if (bubble.dataset.bubble === 'thought') {
                const textContent = bubble.querySelector('div');
                const text = textContent.textContent;
                
                // Set smaller dimensions for thought bubbles
                const baseSize = Math.min(originalRect.width * 0.8, 100); // 80% of original, max 100px
                bubble.style.width = `${baseSize}px`;
                bubble.style.height = `${baseSize}px`;
                bubble.style.borderRadius = '50%';
                bubble.style.display = 'flex';
                bubble.style.alignItems = 'center';
                bubble.style.justifyContent = 'center';
                bubble.style.padding = '0.35rem';
                
                // Style the text container
                if (textContent) {
                  textContent.style.width = '100%';
                  textContent.style.textAlign = 'center';
                  textContent.style.fontSize = '0.65rem';
                  textContent.style.lineHeight = '1.1';
                  textContent.style.wordBreak = 'break-word';
                  textContent.style.whiteSpace = 'pre-wrap';
                  textContent.style.margin = '0';
                  textContent.style.padding = '0'; // Reset padding
                  textContent.style.display = 'flex';
                  textContent.style.alignItems = 'center';
                  textContent.style.justifyContent = 'center';
                  textContent.style.height = '100%';
                }

                // Handle thought indicators with smaller sizes
                const indicators = originalBubble.querySelectorAll('div[style*="border-radius: 50%"]');
                const clonedIndicators = bubble.querySelectorAll('div[style*="border-radius: 50%"]');
                
                indicators.forEach((indicator, index) => {
                  if (clonedIndicators[index]) {
                    clonedIndicators[index].style.position = 'absolute';
                    clonedIndicators[index].style.borderRadius = '50%';
                    clonedIndicators[index].style.backgroundColor = 'white';
                    clonedIndicators[index].style.border = '1.5px solid #111827';
                    clonedIndicators[index].style.width = index === 0 ? '4px' : index === 1 ? '3px' : '2px';
                    clonedIndicators[index].style.height = index === 0 ? '4px' : index === 1 ? '3px' : '2px';
                    clonedIndicators[index].style.bottom = index === 0 ? '-8px' : index === 1 ? '-12px' : '-15px';
                    clonedIndicators[index].style.left = '50%';
                    clonedIndicators[index].style.transform = 'translateX(-50%)';
                  }
                });
              } else {
                // Handle regular dialogue bubbles with smaller dimensions
                const width = Math.min(originalRect.width * 0.8, originalRect.width); // 80% of original width
                bubble.style.width = `${width}px`;
                bubble.style.height = 'auto';
                bubble.style.padding = '0.35rem 0.5rem';
                bubble.style.borderRadius = '0.5rem';

                const textElement = bubble.querySelector('div');
                if (textElement) {
                  textElement.style.width = '100%';
                  textElement.style.textAlign = 'left';
                  textElement.style.fontSize = '0.65rem';
                  textElement.style.lineHeight = '1.1';
                  textElement.style.wordBreak = 'break-word';
                  textElement.style.whiteSpace = 'pre-wrap';
                  textElement.style.fontFamily = 'Comic Neue, "Comic Sans MS", cursive';
                }
              }
            }
          });
        }
      });

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'comic.png';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Save error:', error);
      setError('Failed to save comic');
    }
  };

  const handleGenerate = async () => {
    setError(null);
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
        }),
      });

      if (!response.ok) throw new Error('Failed to generate panels');

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Create proxied URLs for the images
      setGeneratedPanels(data.images.map(image => ({
        ...image,
        url: `/api/proxy-image?url=${encodeURIComponent(image.url)}`,
        dialogues: [],
        thoughts: [],
      })));

    } catch (error) {
      console.error('Generation error:', error);
      setError(error.message);
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
    if (type === 'dialogue') {
      updatedPanels[panelIndex].dialogues.splice(bubbleIndex, 1);
    } else {
      updatedPanels[panelIndex].thoughts.splice(bubbleIndex, 1);
    }
    setGeneratedPanels(updatedPanels);
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

  const getLayoutClass = (totalPanels, layout) => {
    if (layout === 'row') {
      return "flex flex-col gap-4 max-w-4xl mx-auto";
    }
    
    return `grid ${
      totalPanels === 4 ? 'grid-cols-2' :
      totalPanels === 3 ? 'grid-cols-2' :
      totalPanels === 2 ? 'grid-cols-2' :
      'grid-cols-1'
    } gap-4 max-w-4xl mx-auto`;
  };

  // Add function to create empty panel placeholders
  const createEmptyPanels = (count) => {
    return Array(count).fill({
      url: null,
      dialogues: [],
      thoughts: []
    });
  };

  // Update panels state when panel count changes
  useEffect(() => {
    if (generatedPanels.length === 0) {
      setGeneratedPanels(createEmptyPanels(panels));
    }
  }, [panels]);

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

  useEffect(() => {
    return () => {
      // Cleanup object URLs when component unmounts
      generatedPanels.forEach(panel => {
        if (panel.url && panel.url.startsWith('blob:')) {
          URL.revokeObjectURL(panel.url);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Input Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Create your story</h2>
            <div className="space-y-5">
              {/* Prompt Input */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Story prompt
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your story..."
                  className="w-full min-h-[100px] text-sm rounded-md border-gray-200 focus:border-gray-300 focus:ring-0 placeholder:text-gray-400 resize-none transition-colors"
                />
              </div>

              {/* Style Options */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Style
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['manga', 'comic', 'realistic'].map((styleOption) => (
                    <Button
                      key={styleOption}
                      variant={style === styleOption ? 'default' : 'outline'}
                      onClick={() => setStyle(styleOption)}
                      className={`h-8 text-xs font-medium ${
                        style === styleOption 
                          ? 'bg-gray-900 text-white hover:bg-gray-800'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                      } transition-all duration-150`}
                    >
                      {styleOption.charAt(0).toUpperCase() + styleOption.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className={`w-full h-9 text-xs font-medium ${
                  isGenerating || !prompt.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                } transition-colors duration-150`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Drawing your story...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Generate
                  </>
                )}
              </Button>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-md">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Preview</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setLayout(layout === 'grid' ? 'row' : 'grid')}
                  variant="outline"
                  className="h-8 text-xs font-medium"
                >
                  {layout === 'grid' ? <LayoutGrid className="w-4 h-4" /> : <LayoutList className="w-4 h-4" />}
                </Button>
                {generatedPanels.length > 0 && generatedPanels[0].url && (
                  <Button 
                    onClick={handleSave} 
                    variant="outline"
                    className="h-8 text-xs font-medium"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Save comic
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 min-h-[600px] border border-gray-100">
              {isGenerating ? (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      Creating your masterpiece
                    </h3>
                    <p className="text-xs text-gray-500 animate-pulse">
                      {[
                        "Drawing panel details...",
                        "Maintaining consistency...",
                        "Perfecting the scenes...",
                        "Almost there..."
                      ][Math.floor((Date.now() / 2000) % 4)]}
                    </p>
                  </div>
                  <div className={`grid ${getLayoutClass(panels, layout)}`}>
                    {Array(panels).fill(0).map((_, i) => (
                      <LoadingPanel key={i} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className={`comic-container ${getLayoutClass(panels, layout)}`}>
                  {generatedPanels.map((panel, i) => (
                    <div
                      key={i}
                      className={`relative ${
                        layout === 'row' ? 'w-full' : 
                        panels === 3 && i === 2 ? 'col-span-2' : ''
                      } aspect-square bg-white rounded-md shadow-sm border border-gray-100`}
                    >
                      {panel.url ? (
                        <>
                          <ComicImage
                            src={panel.url}
                            alt={`Comic panel ${i + 1}`}
                            width={1024}
                            height={1024}
                          />

                          {/* Add bubble controls */}
                          <div className="absolute top-2 right-2 flex gap-1.5 z-20 bubble-controls">
                            <button
                              onClick={() => addDialogue(i)}
                              className="p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                              title="Add dialogue bubble"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                            <button
                              onClick={() => addThought(i)}
                              className="p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                              title="Add thought bubble"
                            >
                              <Brain className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                          </div>

                          {/* Dialogue bubbles container */}
                          <div className="absolute inset-0">
                            {panel.dialogues?.map((dialogue, dialogueIndex) => (
                              <SpeechBubble 
                                key={`dialogue-${dialogueIndex}`}
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
                            ))}
                          </div>

                          {/* Thought bubbles container */}
                          <div className="absolute inset-0">
                            {panel.thoughts?.map((thought, thoughtIndex) => (
                              <SpeechBubble 
                                key={`thought-${thoughtIndex}`}
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
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-xs text-gray-400">
                            Panel {i + 1}
                          </p>
                        </div>
                      )}
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