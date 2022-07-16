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
  console.log('findNextWindowId');
  console.log(currentTab?.windowId);
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

  // console.log('\n');
  // console.log('currentWindow');
  // console.log(currentWindow);

  if (
    // base check:
    allWindows.length > 1 &&
    // is last tab of current window:
    currentTab?.index === currentWindow?.tabs?.length - 1
  ) {
    targetWindowId =
      allWindows[(currentWindowIndex + 1) % allWindows.length]?.id;

    // console.log('\n');
    // console.log('targetWindowId');
    // console.log(targetWindowId);
  }
  return targetWindowId;
}

async function moveCurrentTab(direction) {
  const currentTab = await getCurrentTab();

  console.log('\n');
  console.log('db 2, currentTab');
  console.log(currentTab?.id);
  console.log(currentTab?.index);
  console.log('\n');
  console.log('db 3, all windows');
  // const currentWindow = await chrome.windows.getCurrent({
  //   populate: true,
  //   windowTypes: ['normal'],
  // });
  // console.log(currentWindow?.tabs?.length);
  // console.log(currentWindow?.tabs?.slice(-1)?.id);
  const allWindows = await chrome.windows.getAll({
    populate: true,
    windowTypes: ['normal'],
  });
  console.log(allWindows?.length);
  console.log(allWindows?.filter((w) => w.id !== currentTab.windowId)?.length);

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
        // index = -1;

        // console.log('END');
        // console.log(currentTab?.windowId);
        const targetWindowId = await findNextWindowId(currentTab);
        const shouldMoveToNextWindow = targetWindowId !== currentTab?.windowId;
        return chrome.tabs.move(currentTab.id, {
          index: shouldMoveToNextWindow ? 0 : -1,
          windowId: targetWindowId,
        });

        return 'WIP';

        // move to next window if is already at end of window
        const allWindows = await chrome.windows.getAll({
          populate: true,
          windowTypes: ['normal'],
        });
        let currentWindowPos = null;
        const currentWindow = allWindows.find((windows, index) => {
          if (windows.id === currentTab?.windowId) {
            currentWindowPos = index;
            return true;
          } else {
            return false;
          }
        });
        console.log('\n');
        console.log('currentWindow');
        console.log(currentWindow);
        if (
          allWindows.length > 1 &&
          currentTab.index === currentWindow.tabs.length - 1 // is last tab of current window
        ) {
          const targetWindowId =
            allWindows[(currentWindowPos + 1) % allWindows.length]?.id;

          console.log('\n');
          console.log('targetWindowId');
          console.log(targetWindowId);

          return chrome.tabs.move(currentTab.id, {
            index: 0,
            windowId: targetWindowId,
          });
        }
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
