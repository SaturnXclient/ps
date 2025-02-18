import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useEditorStore } from '../store/editorStore';
import Toolbar from './Toolbar';
import LayersPanel from './LayersPanel';
import PropertiesPanel from './PropertiesPanel';

export default function Editor({ imageUrl }: { imageUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setCanvas, canvas, addToHistory } = useEditorStore();
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    let fabricCanvas: fabric.Canvas | null = null;

    // Wait for the canvas element to be available in the DOM
    const initializeCanvas = () => {
      if (!canvasRef.current) return;

      // Calculate initial dimensions
      const width = window.innerWidth - 500;
      const height = window.innerHeight - 100;

      // Initialize the canvas with correct dimensions
      fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: '#2a2a2a',
        preserveObjectStacking: true,
      });

      setCanvas(fabricCanvas);
      setCanvasReady(true);

      // Handle window resize
      const handleResize = () => {
        if (!fabricCanvas) return;
        fabricCanvas.setDimensions({
          width: window.innerWidth - 500,
          height: window.innerHeight - 100,
        });
        fabricCanvas.renderAll();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (fabricCanvas) {
          fabricCanvas.dispose();
        }
      };
    };

    initializeCanvas();
  }, []);

  // Load the image after canvas is ready
  useEffect(() => {
    if (!canvas || !canvasReady) return;

    fabric.Image.fromURL(imageUrl, (img) => {
      // Scale image to fit canvas while maintaining aspect ratio
      const scale = Math.min(
        (canvas.width! - 100) / img.width!,
        (canvas.height! - 100) / img.height!
      );

      img.scale(scale);
      img.center();
      canvas.add(img);
      canvas.renderAll();
      addToHistory();
    });
  }, [canvas, canvasReady, imageUrl]);

  useEffect(() => {
    if (!canvas) return;

    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          useEditorStore.getState().undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          useEditorStore.getState().redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [canvas]);

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="flex flex-col flex-1">
        <Toolbar />
        <div className="flex-1 overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} className="max-w-full max-h-full" />
        </div>
      </div>
      <div className="w-80 border-l border-gray-700 bg-gray-800">
        <LayersPanel />
        <PropertiesPanel />
      </div>
    </div>
  );
}