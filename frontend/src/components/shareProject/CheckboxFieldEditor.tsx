import React, { useContext, useEffect, useRef, useState } from "react";
// eslint-disable-next-line import/no-named-as-default
import StarterKit from "@tiptap/starter-kit";
// eslint-disable-next-line import/no-named-as-default
import Link from "@tiptap/extension-link";
import CharacterCount from "@tiptap/extension-character-count";
import { Box, Typography } from "@mui/material";
import type { RichTextEditorRef } from "mui-tiptap";
import {
  RichTextEditor,
  MenuControlsContainer,
  MenuButtonBold,
  MenuButtonEditLink,
  LinkBubbleMenu,
  LinkBubbleMenuHandler,
} from "mui-tiptap";
import makeStyles from "@mui/styles/makeStyles";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const CHARACTER_LIMIT = 500;

// Defined outside component to avoid recreating extensions on each render
const EXTENSIONS = [
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
  LinkBubbleMenuHandler,
  CharacterCount.configure({ limit: CHARACTER_LIMIT }),
];

const useStyles = makeStyles((theme) => ({
  charCount: {
    textAlign: "right",
    padding: theme.spacing(0.5, 1.5),
    borderTop: `1px solid ${theme.palette.divider}`,
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
  const rteRef = useRef<RichTextEditorRef>(null);
  const editorDomRef = useRef<Element | null>(null);
  const [charCount, setCharCount] = useState(0);

  // Sync external description changes into the editor without affecting typing
  useEffect(() => {
    const editor = rteRef.current?.editor;
    if (editor && !editor.isFocused) {
      const currentHtml = editor.getHTML();
      const normalizedCurrent = currentHtml === "<p></p>" ? "" : currentHtml;
      if (normalizedCurrent !== (description || "")) {
        editor.commands.setContent(description || "");
      }
    }
  }, [description]);

  // Prevent link navigation inside the editor. We use a capture-phase listener on
  // document so it fires before Next.js's own capture-phase routing interceptor.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        editorDomRef.current?.contains(e.target as Node) &&
        (e.target as HTMLElement).closest("a")
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return (
    <>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {texts.registration_field_description}
      </Typography>
      <RichTextEditor
        ref={rteRef}
        immediatelyRender={false}
        extensions={EXTENSIONS}
        content={description || ""}
        onCreate={({ editor }) => {
          editorDomRef.current = editor.view.dom;
          setCharCount(editor.storage.characterCount.characters());
        }}
        onUpdate={({ editor }) => {
          const html = editor.getHTML();
          onChange(html === "<p></p>" ? "" : html);
          setCharCount(editor.storage.characterCount.characters());
        }}
        renderControls={() => (
          <MenuControlsContainer>
            <MenuButtonBold />
            <MenuButtonEditLink />
          </MenuControlsContainer>
        )}
        RichTextFieldProps={{
          footer: (
            <Box className={classes.charCount}>
              <Typography
                variant="caption"
                color={charCount >= CHARACTER_LIMIT ? "error" : "textSecondary"}
              >
                {charCount}/{CHARACTER_LIMIT}
              </Typography>
            </Box>
          ),
        }}
      >
        {/* render prop ensures LinkBubbleMenu re-renders on every editor transaction */}
        {() => <LinkBubbleMenu />}
      </RichTextEditor>
    </>
  );
}
