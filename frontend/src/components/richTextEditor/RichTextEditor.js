import React, { useCallback, useEffect, useRef, useState } from "react";
import { convertFromRaw, Editor, EditorState, RichUtils } from "draft-js";
import FormatBoldIcon from "@material-ui/icons/FormatBold";
import FormatItalicIcon from "@material-ui/icons/FormatItalic";
import FormatUnderlinedIcon from "@material-ui/icons/FormatUnderlined";
import FormatListBulletedIcon from "@material-ui/icons/FormatListBulleted";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import FormatQuoteIcon from "@material-ui/icons/FormatQuote";
import { Button, makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: (props) => ({
    borderRadius: theme.spacing(0.5),
    border: props.focusingEditor
      ? `2px solid ${theme.palette.primary.main}`
      : props.hoveringEditor
      ? "1px solid black"
      : "1px solid rgb(184, 184, 184)",
    fontSize: "14px",
  }),
  editorControlsBackground: (props) => ({
    background: "F2F2F2F2",
    border: props.focusingEditor ? "2px solid rgb(0, 0, 0, 0)" : "1px solid rgb(0, 0, 0, 0)",
    borderTopLeftRadius: theme.spacing(0.5),
    borderTopRightRadius: theme.spacing(0.5),
    backgroundClip: "padding-box",
    margin: props.focusingEditor ? "-2px" : "-1px",
  }),
  editorConrols: {
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(0.5),
    borderBottom: "1px solid rgb(184, 184, 184)",
  },
  controlButton: {
    padding: theme.spacing(0.5),
    margin: theme.spacing(0.5),
    position: "relative",
  },
  activeButton: {
    background: theme.palette.primary.main,
    color: "white",
    "&:hover": {
      background: theme.palette.primary.light,
    },
  },
  inactiveButton: {
    color: theme.palette.grey[700],
    "&:hover": {
      background: theme.palette.primary.light,
    },
  },
  headingLabel: {
    fontWeight: "bold",
  },
  blockquote: {
    borderLeft: "5px solid #ccc",
    color: "#666",
    fontStyle: "italic",
    margin: "16px 0",
    padding: "10px 20px",
  },
  editor: {
    borderRadius: theme.spacing(0.5),
    background: "#F8F8F8",
    minHeight: 450,
    padding: theme.spacing(2),
  },
}));

export default function RichTextEditor({ content }) {
  const [hoveringEditor, setHoveringEditor] = useState(false);
  const [focusingEditor, setFocusingEditor] = useState(false);
  const classes = useStyles({ focusingEditor: focusingEditor, hoveringEditor: hoveringEditor });

  const [editorState, setEditorState] = useState(
    content
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(content)))
      : EditorState.createEmpty()
  );
  const editorRef = useRef(null);
  const handleKeyCommand = useCallback((editorState, command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  });

  //Managing block type control buttons
  const [currentBlockType, setCurrentBlockType] = useState("unstyled");
  const BLOCK_TYPES = [
    {
      label: <Typography className={classes.headingLabel}>H1</Typography>,
      type: "header-two",
      active: currentBlockType === "header-two",
    },
    {
      label: <Typography className={classes.headingLabel}>H2</Typography>,
      type: "header-three",
      active: currentBlockType === "header-three",
    },
    {
      label: <FormatQuoteIcon />,
      type: "blockquote",
      active: currentBlockType === "blockquote",
    },
    {
      label: <FormatListBulletedIcon />,
      type: "unordered-list-item",
      active: currentBlockType === "unordered-list-item",
    },
    {
      label: <FormatListNumberedIcon />,
      type: "ordered-list-item",
      active: currentBlockType === "ordered-list-item",
    },
  ];
  const toggleBlockType = (e, type) => {
    e.preventDefault();
    setEditorState(RichUtils.toggleBlockType(editorState, type));
  };
  const getBlockStyleClass = (block) => {
    if (block.getType() === "blockquote") {
      return classes.blockquote;
    }
    return null;
  };

  // Managing inline style control buttons
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  var INLINE_STYLES = [
    { label: <FormatBoldIcon />, style: "BOLD", active: isBold },
    { label: <FormatItalicIcon />, style: "ITALIC", active: isItalic },
    {
      label: <FormatUnderlinedIcon />,
      style: "UNDERLINE",
      active: isUnderline,
    },
  ];
  const toggleInlineStyle = (e, style) => {
    e.preventDefault();
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  useEffect(() => {
    //focus editor when control-button is clicked
    hoveringEditor && editorRef.current.focus();

    const currentSelection = editorState.getSelection();
    //get and set inline styles of selection
    const inlineStyle = editorState.getCurrentInlineStyle(currentSelection);
    setIsBold(inlineStyle.has("BOLD"));
    setIsItalic(inlineStyle.has("ITALIC"));
    setIsUnderline(inlineStyle.has("UNDERLINE"));
    //get and set block type at cursor position
    const currentKey = currentSelection.getStartKey();
    setCurrentBlockType(editorState.getCurrentContent().getBlockForKey(currentKey).getType());
  }, [editorState]);

  return (
    <div
      className={classes.root}
      onMouseEnter={() => setHoveringEditor(true)}
      onMouseLeave={() => setHoveringEditor(false)}
    >
      <div className={classes.editorControlsBackground}>
        <div className={classes.editorConrols}>
          <div>
            {BLOCK_TYPES.map((blockTypeEl) => (
              <ControlButton
                key={blockTypeEl.type}
                controlEl={blockTypeEl}
                onToggleButton={(e) => toggleBlockType(e, blockTypeEl.type)}
              />
            ))}
            {INLINE_STYLES.map((inlineStyleEl) => (
              <ControlButton
                key={inlineStyleEl.style}
                controlEl={inlineStyleEl}
                onToggleButton={(e) => toggleInlineStyle(e, inlineStyleEl.style)}
              />
            ))}
          </div>
          <div>
            {
              // Space for image-, link- & mentions
            }
          </div>
        </div>
      </div>
      {
        // div is needed because the Editor component takes no className prop
      }
      <div className={classes.editor}>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          onFocus={() => setFocusingEditor(true)}
          onBlur={() => setFocusingEditor(false)}
          handleKeyCommand={handleKeyCommand}
          ref={editorRef}
          blockStyleFn={getBlockStyleClass}
        />
      </div>
    </div>
  );
}

function ControlButton({ controlEl, onToggleButton }) {
  const classes = useStyles();

  return (
    <Button
      className={`${classes.controlButton} ${
        controlEl.active ? classes.activeButton : classes.inactiveButton
      }`}
      onMouseDown={(e) => onToggleButton(e, controlEl)}
    >
      {controlEl.label}
    </Button>
  );
}
