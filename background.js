/* 
  Copyright 2018. Jefferson "jscher2000" Scher. License: MPL-2.0.
  v0.1 - initial design
*/

// TODO Persist the log array, currently it initializes when the extension is enabled
let arrLog = [];

// TODO opt out of editing headers, i.e., let user choose log-only mode
let logonly = false;
if (logonly){ // Non-blocking, read-only
	browser.webRequest.onBeforeSendHeaders.addListener(
		checkHeaders,
		{
			urls: ["<all_urls>"]
		},
		["requestHeaders"]
	);
} else { // Default
	browser.webRequest.onBeforeSendHeaders.addListener(
		checkHeaders,
		{
			urls: ["<all_urls>"]
		},
		["blocking", "requestHeaders"]
	);
}

function checkHeaders(details) {
	// Disregard requests for URLs other than http:// and https://
	if (details.url === undefined || details.url.toLowerCase().indexOf('http') !== 0){
		if (logonly) return;
		else return { requestHeaders: details.requestHeaders };
	}
	// Check for Origin and Referer headers
	var headerlog = '';
	for (let header of details.requestHeaders) {
		if (header.name.toLowerCase() === 'origin' || header.name.toLowerCase() === 'referer') {
			if (header.value.toLowerCase().indexOf('moz-extension') === 0){
				headerlog += '||' + header.name + ': ' + header.value
				if (!logonly){
					header.value = 'moz-extension://' + uuidv4();
					headerlog += '| == Randomized to ==> |' + header.name + ': ' + header.value;
				}
			}
		}
	}
	// Log any action taken
	if (headerlog != ''){
		arrLog.push({
			time: Date.now(),
			url: details.url,
			headers: headerlog.substr(2)
		});		
	}
	
	// Dispatch headers, we're done
	if (logonly) return;
	else return { requestHeaders: details.requestHeaders };
}

// https://stackoverflow.com/a/2117523
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

/**** TOOLBAR BUTTON ****/

// Listen for button click and switch to previous tab
browser.browserAction.onClicked.addListener((currTab) => {
	browser.runtime.openOptionsPage()
});

/**** MESSAGING ****/

function handleMessage(request, sender, sendResponse) {
	if ("want" in request) {
		if (request.want == "log") {
			sendResponse({
				logarray: arrLog
			});
			return true;
		}
	}
}
browser.runtime.onMessage.addListener(handleMessage);
