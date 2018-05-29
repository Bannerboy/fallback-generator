const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

// get element references
const loadProjectButton = document.querySelector("#button-load-project");
const generateButton = document.querySelector("#button-generate");
const projectPathText = document.querySelector("#project-path");
const destinationPathText = document.querySelector("#destination-path");
const saveInBanner = document.querySelector("#save-in-banner");
const maxSize = document.querySelector("#max-size");
const fastForwardRadios = document.querySelectorAll("input[name=fast-forward-method]");
const seekToTime = document.querySelector("#seek-to-time");

let projectLoaded = false;

document.addEventListener('drop', function (e) {
	e.preventDefault();
	e.stopPropagation();

	let folderPath = e.dataTransfer.files[0].path;
	if (folderPath) {
		ipcRenderer.send("load-project", {
			prevDirectory: localStorage.getItem("htmlDirectory"),
			directory: folderPath
		});
	}
});

document.addEventListener('dragover', function (e) {
	e.preventDefault();
	e.stopPropagation();
});

loadProjectButton.onclick = () => {
	ipcRenderer.send("load-project", {
		prevDirectory: localStorage.getItem("htmlDirectory")
	});
};

generateButton.onclick = () => {

	// save fast-forward method to localStorage
	fastForwardRadios.forEach(radio => {
		if (radio.checked) localStorage.setItem("fast-forward", radio.value);
	});

	localStorage.setItem("seek-to-time", seekToTime.value);

	ipcRenderer.send(
		"generate-fallbacks",
		{
			saveInBanner: saveInBanner.checked,
			maxSize: parseInt(maxSize.value),
			prevDirectory: localStorage.getItem("destinationDirectory"),
		}
	);
};

ipcRenderer.on("project-loaded", (event, arg) => {
	localStorage.setItem("htmlDirectory", arg);
	localStorage.setItem("destinationDirectory", arg);
	generateButton.removeAttribute("disabled");
});

ipcRenderer.on("destination-set", (event, arg) => {
	localStorage.setItem("destinationDirectory", arg);
});
