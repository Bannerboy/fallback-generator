const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

var bannerboy = bannerboy || {};

// get shared globals
const shared = electron.remote.getGlobal('shared');
// get fast forward method
let fastForwardMethod = localStorage.getItem('fast-forward');
// get current bannerName
let bannerName = shared.bannerName;

// if fast forward method is callback, run immediately before onload
if (fastForwardMethod === 'callback') {
	// define fallback method to call from banner
	window.bb_fallback = () => {
		capture();
	};
	// if fallback method is not called in half a second, run seek method instead
	setTimeout(() => {
		ipcRenderer.send('log', `${bannerName}: Callback method was never called, defaulting to "Seek to end" method.`);
		captureBySeek();
	}, 500);
} else {
	window.addEventListener('load', () => {
		setTimeout(()=> {
			// get amount of seconds to wait
			let seconds = parseFloat(localStorage.getItem('seek-to-time'));
			// get top level timeline
			let rootTimeline = TimelineLite.exportRoot();
			switch (fastForwardMethod) {
				case 'fast-forward':
					// speed up banner 10x and wait for seconds / 10
					rootTimeline.timeScale(10);
					setTimeout(capture, (seconds * 1000) / 10);
					break;
				case 'seek':
					captureBySeek();
					break;
			}

			// if 10000ms has passed, there is probably something wrong. Timeout
			setTimeout(() => {
				ipcRenderer.send('log', `${bannerName}: Unknown error, timed out.`);
				ipcRenderer.send('timeout');
			}, 5000);
		}, 100);
	});
}

function captureBySeek() {
	// get top level timeline
	let rootTimeline = TimelineLite.exportRoot();
	// seek to end of timeline
	rootTimeline.seek(rootTimeline.duration());
	setTimeout(capture, 1);
	capture();
}

function capture() {
	ipcRenderer.send('capture-screen');
}
