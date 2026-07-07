import getTexts from "../../../public/texts/texts";
import type { CcLocale } from "../../types";

/**
 * Labels consumed by mui-tiptap's <LinkBubbleMenu /> (EditLinkMenuContent and
 * ViewLinkMenuContent). Keeping them in one place lets every rich-text editor
 * localize the link modal consistently without duplicating strings.
 */
export type LinkBubbleMenuLabels = {
  editLinkAddTitle: string;
  editLinkEditTitle: string;
  editLinkTextInputLabel: string;
  editLinkHrefInputLabel: string;
  editLinkCancelButtonLabel: string;
  editLinkSaveButtonLabel: string;
  viewLinkEditButtonLabel: string;
  viewLinkRemoveButtonLabel: string;
};

/**
 * Returns the localized labels for mui-tiptap's <LinkBubbleMenu /> for the given
 * locale. The strings live in general_texts (merged into every page), so this
 * works regardless of which page/editor calls it.
 */
export function getLinkBubbleMenuLabels(locale: CcLocale): LinkBubbleMenuLabels {
  const t = getTexts({ page: "general", locale });
  return {
    editLinkAddTitle: t.edit_link_add_title,
    editLinkEditTitle: t.edit_link_edit_title,
    editLinkTextInputLabel: t.edit_link_text_input_label,
    editLinkHrefInputLabel: t.edit_link_href_input_label,
    editLinkCancelButtonLabel: t.edit_link_cancel_button_label,
    editLinkSaveButtonLabel: t.edit_link_save_button_label,
    viewLinkEditButtonLabel: t.view_link_edit_button_label,
    viewLinkRemoveButtonLabel: t.view_link_remove_button_label,
  };
}

/**
 * Labels consumed by mui-tiptap's <TableMenuControls />. Centralizing them here
 * lets every rich-text editor that supports tables localize the table controls
 * consistently.
 */
export type TableMenuControlLabels = {
  insertColumnBefore: string;
  insertColumnAfter: string;
  deleteColumn: string;
  insertRowAbove: string;
  insertRowBelow: string;
  deleteRow: string;
  mergeCells: string;
  splitCell: string;
  toggleHeaderRow: string;
  toggleHeaderColumn: string;
  toggleHeaderCell: string;
  deleteTable: string;
};

/**
 * Returns the localized labels for mui-tiptap's <TableMenuControls /> for the
 * given locale. The strings live in general_texts (merged into every page).
 */
export function getTableMenuControlLabels(locale: CcLocale): TableMenuControlLabels {
  const t = getTexts({ page: "general", locale });
  return {
    insertColumnBefore: t.table_insert_column_before,
    insertColumnAfter: t.table_insert_column_after,
    deleteColumn: t.table_delete_column,
    insertRowAbove: t.table_insert_row_above,
    insertRowBelow: t.table_insert_row_below,
    deleteRow: t.table_delete_row,
    mergeCells: t.table_merge_cells,
    splitCell: t.table_split_cell,
    toggleHeaderRow: t.table_toggle_header_row,
    toggleHeaderColumn: t.table_toggle_header_column,
    toggleHeaderCell: t.table_toggle_header_cell,
    deleteTable: t.table_delete_table,
  };
}
