const RIGHT = 'right';
const LEFT = 'left';
const START = 'start';
const END = 'end';

// https://developer.chrome.com/docs/extensions/reference/tabs/#get-the-current-tab
async function getCurrentTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tabs?.[0];
}

// if active tab is last one of current window
// then, find next target window id for navigation with better UX
// otherwise, return current window id
async function findNextWindowId(currentTab) {
  const allWindows = await chrome.windows.getAll({
    populate: true,
    windowTypes: ['normal'],
  });
  let currentWindowIndex = 0;
  let targetWindowId = currentTab?.windowId;

  // find current window and index
  const currentWindow = allWindows.find((windows, index) => {
    if (windows.id === currentTab?.windowId) {
      currentWindowIndex = index;
      return true;
    } else {
      return false;
    }
  });

  if (
    // base check:
    allWindows.length > 1 &&
    // is last tab of current window:
    currentTab?.index === currentWindow?.tabs?.length - 1
  ) {
    targetWindowId =
      allWindows[(currentWindowIndex + 1) % allWindows.length]?.id;
  }
  return targetWindowId;
}

async function moveCurrentTab(direction) {
  const currentTab = await getCurrentTab();

  if (currentTab?.id && typeof currentTab?.index === 'number') {
    let index = currentTab.index;
    switch (direction) {
      case RIGHT:
        index += 1;
        break;
      case LEFT:
        index = Math.max(0, index - 1);
        break;
      case START:
        index = 0;
        break;
      case END:
        const targetWindowId = await findNextWindowId(currentTab);
        const moveTabToNextWindow = currentTab?.windowId !== targetWindowId;
        return chrome.tabs.move(currentTab.id, {
          index: moveTabToNextWindow
            ? 0 // beginning of next window
            : -1, // end of current window
          windowId: targetWindowId,
        });
    }
    return chrome.tabs.move(currentTab.id, { index });
  }
}

chrome.commands.onCommand.addListener(async function (command) {
  switch (command) {
    case 'move-tab-right':
      return moveCurrentTab(RIGHT);
    case 'move-tab-left':
      return moveCurrentTab(LEFT);
    case 'move-tab-start':
      return moveCurrentTab(START);
    case 'move-tab-end':
      return moveCurrentTab(END);
  }
});
