const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

var bannerboy = bannerboy || {};

console.log("PRELOAD SCRIPT");

window.addEventListener("load", () => {

	setTimeout(()=> {
		function capture() {
			ipcRenderer.send("capture-screen");
		}

		let seconds = localStorage.getItem("seek-to-time");
		switch (localStorage.getItem("fast-forward")) {
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

			case "callback":
				window.fallback = function(callback) {
					callback();
					capture();
				};
				break;
		}

		// if 3000ms has passed, there is probably something wrong. Timeout
		// setTimeout(() => {
		// 	ipcRenderer.send("timeout");
		// }, 10000);
	}, 100);
});
