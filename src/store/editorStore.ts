import { create } from 'zustand';
import { fabric } from 'fabric';

interface EditorState {
  canvas: fabric.Canvas | null;
  activeObject: fabric.Object | null;
  history: string[];
  historyIndex: number;
  setCanvas: (canvas: fabric.Canvas) => void;
  setActiveObject: (object: fabric.Object | null) => void;
  addToHistory: () => void;
  undo: () => void;
  redo: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  canvas: null,
  activeObject: null,
  history: [],
  historyIndex: -1,

  setCanvas: (canvas) => set({ canvas }),
  
  setActiveObject: (object) => set({ activeObject: object }),
  
  addToHistory: () => {
    const { canvas, history, historyIndex } = get();
    if (!canvas) return;

    const json = JSON.stringify(canvas.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { canvas, history, historyIndex } = get();
    if (!canvas || historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    const json = JSON.parse(history[newIndex]);
    canvas.loadFromJSON(json, () => {
      canvas.renderAll();
      set({ historyIndex: newIndex });
    });
  },

  redo: () => {
    const { canvas, history, historyIndex } = get();
    if (!canvas || historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    const json = JSON.parse(history[newIndex]);
    canvas.loadFromJSON(json, () => {
      canvas.renderAll();
      set({ historyIndex: newIndex });
    });
  },
}));