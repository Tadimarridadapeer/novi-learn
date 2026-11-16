'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WhiteboardCommand } from '@/lib/tutor/types';

export interface WhiteboardCanvasProps {
  commands: WhiteboardCommand[];
  topicSlug?: string;
  onCanvasClick?: (coords: { x: number; y: number }) => void;
  onSubmitWhiteboardAnswer?: (answerText: string) => void;
  onRecognitionUpdate?: (recognition: {
    status: 'IDLE' | 'LISTENING' | 'RECOGNIZING' | 'RECOGNIZED' | 'LOW_CONFIDENCE' | 'FAILED';
    recognizedText: string;
    confidence: number;
  }) => void;
  isAiWriting?: boolean;
}

interface UserStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface UserTextNote {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  commands,
  topicSlug = 'quadratic-equations',
  onCanvasClick,
  onSubmitWhiteboardAnswer,
  onRecognitionUpdate,
  isAiWriting = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [activeTool, setActiveTool] = useState<'pen' | 'text' | 'eraser'>('pen');
  const [selectedColor, setSelectedColor] = useState('#0f172a'); // Ink color

  // STUDENT_ANSWER_LAYER State (Strokes & Text created exclusively by student)
  const [userStrokes, setUserStrokes] = useState<UserStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[] | null>(null);
  const [userTexts, setUserTexts] = useState<UserTextNote[]>([]);
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState('');

  // Recognition Pipeline State (Literal Transcription STAGE 1)
  const [recognitionStatus, setRecognitionStatus] = useState<
    'IDLE' | 'LISTENING' | 'RECOGNIZING' | 'RECOGNIZED' | 'LOW_CONFIDENCE' | 'FAILED'
  >('IDLE');
  const [recognizedText, setRecognizedText] = useState('');
  const [confidence, setConfidence] = useState(0);

  const isDrawingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestRequestIdRef = useRef(0);

  const hasUserDrawings = userStrokes.length > 0 || userTexts.length > 0;

  // Render Layered Whiteboard Surface
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr * zoom, dpr * zoom);

    // 1. CLEAN CRISP WHITE BACKGROUND
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width / zoom, rect.height / zoom);

    // 2. LIGHT MATHEMATICAL GRID LINES
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    const gridSize = 28;
    for (let x = 0; x < rect.width / zoom; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height / zoom);
      ctx.stroke();
    }
    for (let y = 0; y < rect.height / zoom; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width / zoom, y);
      ctx.stroke();
    }

    // --------------------------------------------------
    // QUESTION_LAYER (Top Zone - Excluded from recognition crop)
    // --------------------------------------------------
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(30, 20, rect.width / zoom - 60, 65, 12);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#0284c7';
    ctx.fillText('QUESTION ZONE', 45, 38);
    ctx.restore();

    // --------------------------------------------------
    // TUTOR_LAYER (Tutor Annotations & Step Commands - Excluded from recognition crop)
    // --------------------------------------------------
    commands.forEach((cmd) => {
      ctx.save();

      if (cmd.action === 'WRITE' && cmd.content && cmd.position) {
        if (cmd.stepLabel) {
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = cmd.color || '#0284c7';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(cmd.position.x - 10, cmd.position.y - 25, 340, 48, 10);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 10px sans-serif';
          ctx.fillStyle = cmd.color || '#0284c7';
          ctx.fillText(cmd.stepLabel.toUpperCase(), cmd.position.x, cmd.position.y - 10);
        }

        ctx.font = '600 20px "JetBrains Mono", monospace, sans-serif';
        ctx.fillStyle = cmd.color === '#f8fafc' || cmd.color === '#38bdf8' ? '#0f172a' : (cmd.color || '#0f172a');
        ctx.fillText(cmd.content, cmd.position.x, cmd.position.y + 10);
      } else if (cmd.action === 'HIGHLIGHT') {
        const hx = cmd.position?.x || 180;
        const hy = cmd.position?.y || 240;
        ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(hx - 15, hy - 30, 360, 52, 10);
        ctx.fill();
        ctx.stroke();
      } else if (cmd.action === 'GRAPH') {
        const gx = cmd.position?.x || 80;
        const gy = cmd.position?.y || 260;
        const width = 360;
        const height = 180;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(gx, gy, width, height, 12);
        ctx.fill();
        ctx.stroke();

        const originX = gx + width / 2;
        const originY = gy + height / 2 + 15;

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gx + 15, originY);
        ctx.lineTo(gx + width - 15, originY);
        ctx.moveTo(originX, gy + 15);
        ctx.lineTo(originX, gy + height - 15);
        ctx.stroke();

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#0284c7';
        ctx.fillText(`y = ${cmd.expression || 'x² + 5x + 6'}`, gx + 15, gy + 25);
      }

      ctx.restore();
    });

    // --------------------------------------------------
    // STUDENT_ANSWER_LAYER (Student Pen Strokes & Text Notes ONLY)
    // --------------------------------------------------
    userStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    });

    if (currentStroke && currentStroke.length > 1) {
      ctx.save();
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    userTexts.forEach((txt) => {
      ctx.save();
      ctx.font = '600 20px "JetBrains Mono", monospace, sans-serif';
      ctx.fillStyle = txt.color;
      ctx.fillText(txt.text, txt.x, txt.y);
      ctx.restore();
    });

  }, [commands, zoom, userStrokes, currentStroke, userTexts, selectedColor]);

  // Export TIGHT CROPPED Image of ONLY STUDENT_ANSWER_LAYER (Excludes question & tutor content)
  const getCroppedStudentAnswerImage = useCallback((): string => {
    if (typeof window === 'undefined' || userStrokes.length === 0) return '';

    // 1. Calculate tight bounding box around student strokes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    userStrokes.forEach((stroke) => {
      stroke.points.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
    });

    userTexts.forEach((txt) => {
      if (txt.x < minX) minX = txt.x;
      if (txt.x + 100 > maxX) maxX = txt.x + 100;
      if (txt.y - 20 < minY) minY = txt.y - 20;
      if (txt.y + 10 > maxY) maxY = txt.y + 10;
    });

    const padding = 25;
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const cropWidth = Math.max(120, maxX - minX + padding * 2);
    const cropHeight = Math.max(80, maxY - minY + padding * 2);

    // 2. Render tight crop to off-screen canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = cropWidth;
    offscreen.height = cropHeight;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cropWidth, cropHeight);
    ctx.translate(-cropX, -cropY);

    userStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    });

    userTexts.forEach((txt) => {
      ctx.save();
      ctx.font = '600 20px "JetBrains Mono", monospace, sans-serif';
      ctx.fillStyle = txt.color;
      ctx.fillText(txt.text, txt.x, txt.y);
      ctx.restore();
    });

    return offscreen.toDataURL('image/png');
  }, [userStrokes, userTexts]);

  // Perform Literal Handwriting Recognition with 800ms Debounce
  const performRecognition = useCallback(
    async (strokesToRecognize: UserStroke[], textsToRecognize: UserTextNote[]) => {
      if (strokesToRecognize.length === 0 && textsToRecognize.length === 0) {
        setRecognitionStatus('IDLE');
        setRecognizedText('');
        setConfidence(0);
        if (onRecognitionUpdate) {
          onRecognitionUpdate({ status: 'IDLE', recognizedText: '', confidence: 0 });
        }
        return;
      }

      // If student typed text notes, typed text is transcribed literally
      if (textsToRecognize.length > 0 && strokesToRecognize.length === 0) {
        const text = textsToRecognize.map((t) => t.text).join(' ');
        setRecognitionStatus('RECOGNIZED');
        setRecognizedText(text);
        setConfidence(1.0);
        if (onRecognitionUpdate) {
          onRecognitionUpdate({ status: 'RECOGNIZED', recognizedText: text, confidence: 1.0 });
        }
        return;
      }

      const currentReqId = ++latestRequestIdRef.current;
      setRecognitionStatus('RECOGNIZING');
      if (onRecognitionUpdate) {
        onRecognitionUpdate({ status: 'RECOGNIZING', recognizedText, confidence });
      }

      try {
        const imageBase64 = getCroppedStudentAnswerImage();
        const res = await fetch('/api/whiteboard/recognize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            strokes: strokesToRecognize,
            imageBase64,
            topicSlug,
          }),
        });

        // Cancel / Ignore stale requests if a newer stroke was drawn
        if (currentReqId !== latestRequestIdRef.current) {
          return;
        }

        const data = await res.json();
        if (data.success && data.result) {
          const resText = data.result.recognizedText || '';
          const resConf = data.result.confidence || 0.96;
          
          let status: 'RECOGNIZED' | 'LOW_CONFIDENCE' | 'FAILED' = 'RECOGNIZED';
          if (resConf < 0.7) status = 'FAILED';
          else if (resConf < 0.9) status = 'LOW_CONFIDENCE';

          setRecognitionStatus(status);
          setRecognizedText(resText);
          setConfidence(resConf);

          if (onRecognitionUpdate) {
            onRecognitionUpdate({
              status,
              recognizedText: resText,
              confidence: resConf,
            });
          }
        }
      } catch (err) {
        console.warn('Recognition API error:', err);
        if (currentReqId === latestRequestIdRef.current) {
          setRecognitionStatus('FAILED');
          if (onRecognitionUpdate) {
            onRecognitionUpdate({ status: 'FAILED', recognizedText: '', confidence: 0 });
          }
        }
      }
    },
    [getCroppedStudentAnswerImage, topicSlug, onRecognitionUpdate, recognizedText, confidence]
  );

  // Trigger Debounced Recognition (800ms pause after student stops writing)
  const triggerDebouncedRecognition = useCallback(
    (strokes: UserStroke[], texts: UserTextNote[]) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      setRecognitionStatus('LISTENING');
      if (onRecognitionUpdate) {
        onRecognitionUpdate({ status: 'LISTENING', recognizedText, confidence });
      }

      debounceTimerRef.current = setTimeout(() => {
        performRecognition(strokes, texts);
      }, 800);
    },
    [performRecognition, onRecognitionUpdate, recognizedText, confidence]
  );

  // Pointer Handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.round((clientX - rect.left) / zoom),
      y: Math.round((clientY - rect.top) / zoom),
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    isDrawingRef.current = true;

    if (activeTool === 'pen') {
      setCurrentStroke([coords]);
    } else if (activeTool === 'text') {
      setTextInputPos(coords);
      setTextInputValue('');
    } else if (activeTool === 'eraser') {
      eraseNear(coords);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const coords = getCanvasCoords(e);

    if (activeTool === 'pen') {
      setCurrentStroke((prev) => (prev ? [...prev, coords] : [coords]));
    } else if (activeTool === 'eraser') {
      eraseNear(coords);
    }
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (activeTool === 'pen' && currentStroke && currentStroke.length > 0) {
      const newStrokes = [
        ...userStrokes,
        {
          id: `stroke_${Date.now()}`,
          points: currentStroke,
          color: selectedColor,
          width: 3.5,
        },
      ];
      setUserStrokes(newStrokes);
      setCurrentStroke(null);

      // Trigger automatic 800ms debounced literal transcription
      triggerDebouncedRecognition(newStrokes, userTexts);
    }
  };

  const eraseNear = (coords: { x: number; y: number }) => {
    const radius = 25;
    const updatedStrokes = userStrokes.filter(
      (stroke) => !stroke.points.some((p) => Math.hypot(p.x - coords.x, p.y - coords.y) < radius)
    );
    const updatedTexts = userTexts.filter(
      (txt) => Math.hypot(txt.x - coords.x, txt.y - coords.y) > radius * 1.5
    );
    setUserStrokes(updatedStrokes);
    setUserTexts(updatedTexts);

    triggerDebouncedRecognition(updatedStrokes, updatedTexts);
  };

  const handleAddText = () => {
    if (textInputPos && textInputValue.trim()) {
      const updatedTexts = [
        ...userTexts,
        {
          id: `text_${Date.now()}`,
          x: textInputPos.x,
          y: textInputPos.y,
          text: textInputValue.trim(),
          color: selectedColor,
        },
      ];
      setUserTexts(updatedTexts);
      triggerDebouncedRecognition(userStrokes, updatedTexts);
    }
    setTextInputPos(null);
    setTextInputValue('');
  };

  const handleSubmitWhiteboard = () => {
    if (!onSubmitWhiteboardAnswer) return;

    let answerToSend = recognizedText.trim();
    if (!answerToSend && userTexts.length > 0) {
      answerToSend = userTexts.map((t) => t.text).join(' ');
    }

    if (!answerToSend) {
      // If recognition has not completed yet or returned empty, do not submit dummy text
      return;
    }

    onSubmitWhiteboardAnswer(answerToSend);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xl select-none">
      {/* Top Floating Whiteboard Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-black/10 shadow-md">
        <button
          onClick={() => setActiveTool('pen')}
          className={`px-3 py-1.5 rounded-xl transition-all text-xs font-bold ${
            activeTool === 'pen' ? 'bg-brand-600 text-white shadow-sm' : 'text-black/70 hover:bg-black/5'
          }`}
          title="Pen / Draw"
        >
          Pen
        </button>

        <button
          onClick={() => setActiveTool('text')}
          className={`px-3 py-1.5 rounded-xl transition-all text-xs font-bold ${
            activeTool === 'text' ? 'bg-brand-600 text-white shadow-sm' : 'text-black/70 hover:bg-black/5'
          }`}
          title="Add Text"
        >
          Text
        </button>

        <button
          onClick={() => setActiveTool('eraser')}
          className={`px-3 py-1.5 rounded-xl transition-all text-xs font-bold ${
            activeTool === 'eraser' ? 'bg-brand-600 text-white shadow-sm' : 'text-black/70 hover:bg-black/5'
          }`}
          title="Eraser"
        >
          Eraser
        </button>

        <div className="h-5 w-px bg-black/10 mx-1" />

        <div className="flex items-center gap-1">
          {['#000000', '#800020', '#4a0013', '#666666'].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedColor(c)}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                selectedColor === c ? 'scale-125 border-brand-600 shadow-sm' : 'border-transparent hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="h-5 w-px bg-black/10 mx-1" />

        <button
          onClick={() => setZoom((z) => Math.min(z + 0.1, 1.5))}
          className="px-2 py-1 text-black font-bold text-xs hover:bg-black/5 rounded-lg transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.1, 0.7))}
          className="px-2 py-1 text-black font-bold text-xs hover:bg-black/5 rounded-lg transition-colors"
          title="Zoom Out"
        >
          -
        </button>

        <button
          onClick={() => {
            setUserStrokes([]);
            setUserTexts([]);
            setRecognizedText('');
            setRecognitionStatus('IDLE');
            if (onRecognitionUpdate) {
              onRecognitionUpdate({ status: 'IDLE', recognizedText: '', confidence: 0 });
            }
          }}
          className="px-2.5 py-1 text-black/60 hover:text-black hover:bg-black/5 rounded-lg transition-colors text-xs font-bold"
          title="Clear Work"
        >
          Clear
        </button>
      </div>

      {/* Recognition Real-Time Floating Indicator (LITERAL TRANSCRIPTION) */}
      {recognitionStatus !== 'IDLE' && (
        <div className="absolute top-16 left-4 z-20 flex items-center gap-2 bg-white/95 border border-black/10 text-black px-3.5 py-2 rounded-2xl text-xs font-bold shadow-md backdrop-blur-md">
          {recognitionStatus === 'LISTENING' && (
            <span className="text-brand-700">Listening to your handwriting...</span>
          )}
          {recognitionStatus === 'RECOGNIZING' && (
            <span className="text-brand-700">Recognizing...</span>
          )}
          {recognitionStatus === 'RECOGNIZED' && (
            <span className="text-black">
              Recognized: <span className="font-mono font-bold text-brand-700">{recognizedText}</span> ({Math.round(confidence * 100)}%)
            </span>
          )}
          {recognitionStatus === 'LOW_CONFIDENCE' && (
            <span className="text-black/80">Please check your answer on the right</span>
          )}
          {recognitionStatus === 'FAILED' && (
            <span className="text-black/60">Could not read handwriting clearly</span>
          )}
        </div>
      )}

      {/* AI Writing Indicator */}
      {isAiWriting && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-brand-50 text-brand-900 border border-brand-200 px-3.5 py-2 rounded-2xl text-xs font-bold backdrop-blur-md animate-pulse shadow-sm">
          Novi Learn is updating the workspace...
        </div>
      )}

      {/* Floating Submit Whiteboard Answer Button */}
      <div className="absolute bottom-4 right-4 z-10">
        <button
          onClick={handleSubmitWhiteboard}
          disabled={!hasUserDrawings}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm ${
            hasUserDrawings
              ? 'bg-brand-600 hover:bg-brand-700 text-white border-brand-700 shadow-brand-600/20 scale-105'
              : 'bg-white text-black/30 border-black/10 opacity-60 cursor-not-allowed'
          }`}
          title="Submit your handwritten or typed answer to Novi Learn AI"
        >
          <span>Submit Whiteboard Answer</span>
        </button>
      </div>

      {/* Inline Text Tool Overlay Input */}
      {textInputPos && (
        <div
          className="absolute z-20 bg-white p-2 rounded-xl border border-slate-300 shadow-xl flex items-center gap-2"
          style={{ left: textInputPos.x * zoom, top: textInputPos.y * zoom }}
        >
          <input
            type="text"
            autoFocus
            value={textInputValue}
            onChange={(e) => setTextInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
            placeholder="Type text annotation (e.g. 3x)..."
            className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 text-slate-900"
          />
          <button
            onClick={handleAddText}
            className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold"
          >
            Add
          </button>
        </div>
      )}

      {/* Interactive Canvas Surface */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full touch-none ${
          activeTool === 'pen'
            ? 'cursor-crosshair'
            : activeTool === 'text'
            ? 'cursor-text'
            : activeTool === 'eraser'
            ? 'cursor-cell'
            : 'cursor-default'
        }`}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
    </div>
  );
};
