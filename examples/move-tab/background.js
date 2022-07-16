// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function moveSelectedTab(direction) {
  chrome.tabs.getSelected((tab) => {

    let index = tab.index;

    switch (direction) {
      case 'start':  index = 0;  break;
      case 'end':    index = -1; break;
      case 'left':   index = Math.max(0, index - 1); break;
      case 'right':  index += 1; break;
    }


    chrome.tabs.move(tab.id, { index })
  })
}

chrome.commands.onCommand.addListener(function(command) {

  switch (command) {
    case 'move-tab-right': return moveSelectedTab('right');
    case 'move-tab-left':  return moveSelectedTab('left');
    case 'move-tab-start': return moveSelectedTab('start');
    case 'move-tab-end':   return moveSelectedTab('end');

  }
});
