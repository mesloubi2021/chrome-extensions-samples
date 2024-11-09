class InlineEventHelper {
  uuid = crypto.randomUUID();

  clickEventName = `ExtensionEvent-click-${this.uuid}`;

  ready = new Promise(async (resolve, reject) => {

    console.log("(isolated) Requesting that the inline event helper be injected into the main world.");
    let response = await chrome.runtime.sendMessage({
      type: "inject-main-helper",
      uuid: this.uuid,
    });

    console.log(`(isolated) background.js responded:
    ${response}`);

    // Signal that we're ready to dispatch events.
    this.isReady = true;
    resolve();
  });

  click(element) {
    let event = new CustomEvent(this.clickEventName);
    element.dispatchEvent(event);
  }

  // Helpers for other inline events are left as an exercise for the reader.
}

let element = document.querySelector("a");

// // This will fail due to CSP errors
// console.log("(isolated) Attempting to call .click() on our link.");
// element.click();

let helper = new InlineEventHelper();
helper.ready.then(() => {
  console.log("(isolated) Main world ready. Requesting a click.");
  helper.click(element);
});

