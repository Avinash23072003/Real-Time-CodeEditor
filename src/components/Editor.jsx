import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css"; // Default styles
import "codemirror/theme/dracula.css"; // Dracula theme
import "codemirror/mode/javascript/javascript"; // JavaScript mode
import "codemirror/addon/selection/active-line"; // Active line addon
import "codemirror/addon/edit/matchbrackets"; // Match brackets addon
import "codemirror/addon/edit/closebrackets"; // Close brackets addon
import { ACTION } from "../Constants/ACTION";

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) return;
    async function init() {
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

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTION.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    }

    init();

    // Cleanup function to destroy the editor instance when the component unmounts
    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea(); // Optionally, you might also need to destroy it properly if available
        editorRef.current = null;
        console.log("Editor destroyed");
      }
    };
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTION.CODE_CHANGE, ({ code }) => {
        console.log("Receiving", code);
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    // return () => {
    //   socketRef.current.off(ACTION.CODE_CHANGE);
    // };
  }, [socketRef.current]);

  return <textarea id="realTimeEditor" defaultValue="// Your code Here" />;
};

export default Editor;
