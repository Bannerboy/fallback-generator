const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

var bannerboy = bannerboy || {};

console.log("PRELOAD SCRIPT");

let fastForwardMethod = localStorage.getItem("fast-forward");

// if fast forward method is callback, run immediately before onload
if (fastForwardMethod === "callback") {
	window.fallback = function(callback) {
		callback();
		capture();
	};
} else {
	window.addEventListener("load", () => {
		setTimeout(()=> {
			let seconds = localStorage.getItem("seek-to-time");
			switch (fastForwardMethod) {
				case "fast-forward":
					var rootTimeline = TimelineLite.exportRoot();
					rootTimeline.timeScale(10);
					setTimeout(capture, (seconds * 1000) * 0.1);
					break;
				case "seek":
					var rootTimeline = TimelineLite.exportRoot();
					rootTimeline.seek(rootTimeline.duration());
					setTimeout(capture, 1);
					break;
			}

			// if 3000ms has passed, there is probably something wrong. Timeout
			// setTimeout(() => {
			// 	ipcRenderer.send("timeout");
			// }, 10000);
		}, 100);
	});
}

function capture() {
	ipcRenderer.send("capture-screen");
}

