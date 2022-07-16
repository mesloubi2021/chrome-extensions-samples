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
        // TODO move to next window if is already at end of window
        index = -1;
        break;
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
