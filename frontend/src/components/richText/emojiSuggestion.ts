import { emojis as EMOJI_DATA } from "@tiptap/extension-emoji";

function renderItems(
  container: HTMLDivElement,
  items: any[],
  activeIndex: number,
  command: (_item: any) => void
) {
  container.innerHTML = "";
  if (!items.length) {
    container.style.display = "none";
    return;
  }
  container.style.display = "";
  items.forEach((item, i) => {
    const btn = document.createElement("div");
    btn.className = "emoji-item";
    btn.style.cssText = `padding:4px 8px;cursor:pointer;border-radius:4px;display:flex;align-items:center;gap:8px;font-size:18px;${
      i === activeIndex ? "background:#e3f2fd;" : ""
    }`;
    const shortcode = item.shortcodes?.[0] ? `:${item.shortcodes[0]}:` : "";
    btn.textContent = `${item.emoji ?? ""}  ${shortcode}`;
    btn.title = item.name ?? "";
    btn.onmouseenter = () => {
      container.querySelectorAll<HTMLElement>(".emoji-item").forEach((el, j) => {
        el.style.background = j === i ? "#e3f2fd" : "";
      });
    };
    btn.onclick = () => command(item);
    container.appendChild(btn);
  });
}

export function emojiItems({ editor, query }: { editor: any; query: string }) {
  return (editor.storage.emoji?.emojis ?? EMOJI_DATA)
    .filter((e: any) => {
      if (!e.group || e.group === "components") return false;
      const q = query.toLowerCase();
      return (
        e.shortcodes?.some((s: string) => s.startsWith(q)) ||
        e.tags?.some((t: string) => t.startsWith(q))
      );
    })
    .slice(0, 20);
}

export function emojiRender() {
  let popup: HTMLDivElement | null = null;
  let currentItems: any[] = [];
  let selectedIndex = 0;
  let currentCommand: (_item: any) => void = () => {};

  return {
    onStart(props: any) {
      popup = document.createElement("div");
      popup.className = "emoji-suggestion-popup";
      popup.style.cssText =
        "position:fixed;z-index:9999;background:white;border:1px solid #ddd;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);max-height:220px;overflow-y:auto;padding:4px;min-width:200px;";
      currentItems = props.items;
      currentCommand = props.command;
      selectedIndex = 0;
      renderItems(popup, currentItems, 0, currentCommand);

      const rect = props.clientRect?.();
      if (rect) {
        popup.style.left = `${rect.left}px`;
        popup.style.top = `${rect.bottom + 4}px`;
      }
      document.body.appendChild(popup);
    },
    onUpdate(props: any) {
      if (!popup) return;
      currentItems = props.items;
      currentCommand = props.command;
      selectedIndex = 0;
      renderItems(popup, currentItems, 0, currentCommand);
      const rect = props.clientRect?.();
      if (rect) {
        popup.style.left = `${rect.left}px`;
        popup.style.top = `${rect.bottom + 4}px`;
      }
    },
    onKeyDown(props: any) {
      if (!popup) return false;
      if (props.event.key === "ArrowDown") {
        props.event.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, currentItems.length - 1);
        renderItems(popup, currentItems, selectedIndex, currentCommand);
        return true;
      }
      if (props.event.key === "ArrowUp") {
        props.event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        renderItems(popup, currentItems, selectedIndex, currentCommand);
        return true;
      }
      if (props.event.key === "Enter") {
        props.event.preventDefault();
        if (currentItems[selectedIndex]) {
          currentCommand(currentItems[selectedIndex]);
        }
        return true;
      }
      return false;
    },
    onExit() {
      popup?.remove();
      popup = null;
    },
  };
}
