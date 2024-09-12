import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css"; // Default styles
import "codemirror/theme/dracula.css"; // Dracula theme
import "codemirror/mode/javascript/javascript"; // JavaScript mode
import "codemirror/addon/selection/active-line"; // Active line addon
import "codemirror/addon/edit/matchbrackets"; // Match brackets addon
import "codemirror/addon/edit/closebrackets"; // Close brackets addon

const Editor = () => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) return; // If editor is already initialized, do nothing

    editorRef.current = CodeMirror.fromTextArea(
      document.getElementById("realTimeEditor"),
      {
        mode: "javascript",
        theme: "dracula",
        lineNumbers: true,
        styleActiveLine: true,
        matchBrackets: true,
        autoCloseBrackets: true,
      }
    );

    console.log("Editor initialized");

    // Cleanup function to destroy the editor instance when the component unmounts
    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea(); // Optionally, you might also need to destroy it properly if available
        editorRef.current = null;
        console.log("Editor destroyed");
      }
    };
  }, []);

  return <textarea id="realTimeEditor" defaultValue="// Your code Here" />;
};

export default Editor;
