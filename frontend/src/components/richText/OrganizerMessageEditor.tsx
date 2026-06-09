import React, { useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
// eslint-disable-next-line import/no-named-as-default
import StarterKit from "@tiptap/starter-kit";
import CharacterCount from "@tiptap/extension-character-count";
// eslint-disable-next-line import/no-named-as-default
import TextAlign from "@tiptap/extension-text-align";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
// eslint-disable-next-line import/no-named-as-default
import Emoji from "@tiptap/extension-emoji";
import type { RichTextEditorRef } from "mui-tiptap";
import {
  RichTextEditor,
  MenuControlsContainer,
  MenuDivider,
  MenuButtonBold,
  MenuButtonItalic,
  MenuButtonBulletedList,
  MenuButtonOrderedList,
  MenuButtonAlignLeft,
  MenuButtonAlignCenter,
  MenuButtonAlignRight,
  MenuButtonEditLink,
  MenuButtonAddTable,
  LinkBubbleMenu,
  LinkBubbleMenuHandler,
  TableMenuControls,
} from "mui-tiptap";

import { emojiItems, emojiRender } from "./emojiSuggestion";

const CHARACTER_LIMIT = 5000;

const TABLE_HEADER_STYLE = "background-color: #f0f0f0;";

const EXTENSIONS = [
  StarterKit.configure({
    italic: true,
    strike: false,
    code: false,
    codeBlock: false,
    heading: false,
    horizontalRule: false,
    blockquote: false,
    bulletList: true,
    orderedList: true,
    listItem: true,
    link: {
      openOnClick: false,
      HTMLAttributes: { rel: "noopener noreferrer" },
    },
  }),
  TextAlign.configure({
    types: ["paragraph", "tableCell", "tableHeader"],
  }),
  Table.configure({ resizable: false }),
  TableRow,
  TableCell,
  TableHeader.configure({
    HTMLAttributes: {
      style: TABLE_HEADER_STYLE,
    },
  }),
  Emoji.configure({
    suggestion: {
      items: emojiItems,
      render: emojiRender,
    },
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
  errorText: {
    color: theme.palette.error.main,
    fontSize: "0.875rem",
    marginTop: theme.spacing(0.5),
  },
  errorBorder: {
    border: `1px solid ${theme.palette.error.main}`,
    borderRadius: theme.shape.borderRadius,
  },
}));

type TooltipLabels = {
  bold: string;
  italic: string;
  bulletList: string;
  orderedList: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  editLink: string;
  addTable: string;
};

type Props = {
  content: string;
  onChange: (_html: string) => void;
  editable?: boolean;
  error?: string;
  showCharCount?: boolean;
  ariaLabel?: string;
  tooltipLabels?: TooltipLabels;
};

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim();

export default function OrganizerMessageEditor({
  content,
  onChange,
  editable = true,
  error,
  showCharCount = true,
  ariaLabel,
  tooltipLabels,
}: Props) {
  const classes = useStyles();
  const rteRef = useRef<RichTextEditorRef>(null);
  const [charCount, setCharCount] = useState(0);

  const t = tooltipLabels;

  return (
    <div className={error ? classes.errorBorder : undefined}>
      <RichTextEditor
        ref={rteRef}
        immediatelyRender={false}
        extensions={EXTENSIONS}
        content={content || ""}
        editable={editable}
        onCreate={({ editor }) => {
          setCharCount(editor.storage.characterCount.characters());
        }}
        onUpdate={({ editor }) => {
          const html = editor.getHTML();
          onChange(html === "<p></p>" ? "" : html);
          setCharCount(editor.storage.characterCount.characters());
        }}
        editorProps={{
          attributes: ariaLabel ? { "aria-label": ariaLabel } : undefined,
        }}
        renderControls={() => (
          <MenuControlsContainer>
            <MenuButtonBold tooltipLabel={t?.bold ?? "Bold"} />
            <MenuButtonItalic tooltipLabel={t?.italic ?? "Italic"} />
            <MenuDivider />
            <MenuButtonBulletedList tooltipLabel={t?.bulletList ?? "Bullet list"} />
            <MenuButtonOrderedList tooltipLabel={t?.orderedList ?? "Ordered list"} />
            <MenuDivider />
            <MenuButtonAlignLeft tooltipLabel={t?.alignLeft ?? "Align left"} />
            <MenuButtonAlignCenter tooltipLabel={t?.alignCenter ?? "Align center"} />
            <MenuButtonAlignRight tooltipLabel={t?.alignRight ?? "Align right"} />
            <MenuDivider />
            <MenuButtonEditLink tooltipLabel={t?.editLink ?? "Edit link"} />
            <MenuButtonAddTable tooltipLabel={t?.addTable ?? "Add table"} />
            <TableMenuControls />
          </MenuControlsContainer>
        )}
        RichTextFieldProps={{
          footer: showCharCount ? (
            <Box className={classes.charCount}>
              <Typography
                variant="caption"
                color={charCount >= CHARACTER_LIMIT ? "error" : "textSecondary"}
              >
                {charCount}/{CHARACTER_LIMIT}
              </Typography>
            </Box>
          ) : undefined,
        }}
      >
        {() => <LinkBubbleMenu />}
      </RichTextEditor>
      {error && <Typography className={classes.errorText}>{error}</Typography>}
    </div>
  );
}

export { CHARACTER_LIMIT, stripHtml };
