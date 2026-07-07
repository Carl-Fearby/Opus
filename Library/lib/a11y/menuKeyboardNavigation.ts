export function getMenuItems(menu: HTMLElement) {
  return Array.from(
    menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])'),
  );
}

export function focusMenuItem(items: HTMLElement[], index: number) {
  const item = items[index];
  if (item) {
    item.focus();
  }
}

export function handleMenuKeyDown(
  event: KeyboardEvent,
  menu: HTMLElement,
  onEscape?: () => void,
) {
  const items = getMenuItems(menu);
  if (items.length === 0) {
    return;
  }

  const currentIndex = items.indexOf(document.activeElement as HTMLElement);

  if (event.key === "Escape") {
    event.preventDefault();
    onEscape?.();
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
    focusMenuItem(items, nextIndex);
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    const nextIndex =
      currentIndex < 0 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length;
    focusMenuItem(items, nextIndex);
    return;
  }

  if (event.key === "Home") {
    event.preventDefault();
    focusMenuItem(items, 0);
    return;
  }

  if (event.key === "End") {
    event.preventDefault();
    focusMenuItem(items, items.length - 1);
  }
}
