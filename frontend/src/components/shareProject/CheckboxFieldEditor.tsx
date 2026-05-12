import React, { useContext, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
// eslint-disable-next-line import/no-named-as-default
import StarterKit from "@tiptap/starter-kit";
// eslint-disable-next-line import/no-named-as-default
import Link from "@tiptap/extension-link";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import makeStyles from "@mui/styles/makeStyles";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  editorWrapper: {
    border: `1px solid ${theme.palette.action.disabled}`,
    borderRadius: theme.shape.borderRadius,
    "&:focus-within": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
  toolbar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(0.5),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    backgroundColor: theme.palette.action.hover,
  },
  editorContent: {
    padding: theme.spacing(1.5),
    "& .ProseMirror": {
      outline: "none",
      minHeight: 60,
      "& p": { margin: 0 },
      "& a": { color: theme.palette.primary.main },
    },
  },
  toolbarButton: {
    padding: 4,
    borderRadius: theme.shape.borderRadius,
  },
  activeButton: {
    backgroundColor: theme.palette.action.selected,
  },
}));

type Props = {
  description: string;
  onChange: (_html: string) => void;
};

export default function CheckboxFieldEditor({ description, onChange }: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale });

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        italic: false,
        strike: false,
        code: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
    ],
    content: description || "",
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  useEffect(() => {
    if (editor && !editor.isFocused) {
      const currentHtml = editor.getHTML();
      const normalizedCurrent = currentHtml === "<p></p>" ? "" : currentHtml;
      if (normalizedCurrent !== (description || "")) {
        editor.commands.setContent(description || "");
      }
    }
  }, [description, editor]);

  const handleToggleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const handleLinkButtonClick = () => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
    } else {
      setLinkUrl("");
      setLinkDialogOpen(true);
    }
  };

  const handleApplyLink = () => {
    if (linkUrl.trim() && editor) {
      const href = linkUrl.trim().startsWith("http") ? linkUrl.trim() : `https://${linkUrl.trim()}`;
      editor.chain().focus().setLink({ href }).run();
    }
    setLinkDialogOpen(false);
  };

  const handleCancelLink = () => {
    setLinkDialogOpen(false);
  };

  return (
    <>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {texts.registration_field_description}
      </Typography>
      <Box className={classes.editorWrapper}>
        <Box className={classes.toolbar}>
          <Tooltip title="Bold">
            <IconButton
              size="small"
              className={`${classes.toolbarButton} ${
                editor?.isActive("bold") ? classes.activeButton : ""
              }`}
              onClick={handleToggleBold}
              aria-label="Bold"
            >
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Link">
            <IconButton
              size="small"
              className={`${classes.toolbarButton} ${
                editor?.isActive("link") ? classes.activeButton : ""
              }`}
              onClick={handleLinkButtonClick}
              aria-label="Link"
            >
              {editor?.isActive("link") ? (
                <LinkOffIcon fontSize="small" />
              ) : (
                <LinkIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
        <Box className={classes.editorContent}>
          <EditorContent editor={editor} />
        </Box>
      </Box>
      <Dialog open={linkDialogOpen} onClose={handleCancelLink} maxWidth="xs" fullWidth>
        <DialogTitle>Insert link</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleApplyLink();
            }}
            placeholder="https://example.com"
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLink}>Cancel</Button>
          <Button onClick={handleApplyLink} variant="contained" disabled={!linkUrl.trim()}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
