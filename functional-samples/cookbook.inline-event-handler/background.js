chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "inject-main-helper") {
    injectMainWorldInlineEventHelper(message, sender, sendResponse);

    // Tell the browser that we will send a response asynchronously.
    return true;
  }
});

function contentMainInlineEventHelper(uuid) {
  // Click event helper
  const clickEventName = `ExtensionEvent-click-${uuid}`;
  document.addEventListener(clickEventName, (event) => {
    console.log("(main) Triggering a click on", event.target);
    event.stopPropagation();
    event.target.click();
  }, { capture: true });

  // Helpers for other inline events are left as an exercise for the reader.

  // The return value of this function is passed back to the executeScript caller.
  return `(main) Bound event listeners for UUID "${uuid}".`;
}

async function injectMainWorldInlineEventHelper(message, sender, sendResponse) {
  const { uuid } = message;

  const result = await chrome.scripting.executeScript({
    world: "MAIN",
    target: { tabId: sender.tab.id },
    func: contentMainInlineEventHelper,
    args: [ uuid ],
  });
  const response = result[0].result;

  // Tell the isolated world content script that the main world is ready.
  sendResponse(response);
};
