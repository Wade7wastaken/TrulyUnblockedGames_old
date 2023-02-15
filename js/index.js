// page loading stuff
console.log("Advanced features:");
console.log(
	'Set local storage "origin" to "0" to run the emulator hosted on this domain, and "1" to run it from GitHub.',
);
console.log('Set session storage "emuWidth" and "emuHeight" to set a custom size for EmulatorJS.');

// set coretoggle to what is currently in localStorage (defaults to inactive)
getId("coretoggle").className += " " + (localStorage.oldCores == "1" ? "active" : "inactive");

// set emulatortoggle to what is currently in localStorage (defaults to EmulatorJS)
switch (localStorage.emu) {
	case "EJS":
		getId("emulatortoggle").textContent = "EmulatorJS";
		break;
	case "NJS":
		getId("emulatortoggle").textContent = "NeptunJS";
		getId("coretoggle").style.display = "none";
		break;
	default:
		getId("emulatortoggle").textContent = "EmulatorJS";
		break;
}

loadEmuGames();

// Global variables
const linknames = links.names; // a mapping from internal site names to display names
const linknamelist = Object.keys(links.names).sort(); // an array of the internal site names
let page = 0; // the current page of links
let games = []; // the main array of games
let matches = [];
let filteredsites = [];
const linksperpage = 100; // 100 seems to be the max without causeing slowdowns on older computers

delete links.names; // delete this so we can iterate through the object without this being there

addSiteSelectors();

getLocalStorage();

updateTabs(localStorage.openTab);

const domain = document.createElement("a");
for (const site in links) {
	let sitelist = links[site];
	for (const game of sitelist) {
		domain.href = game[1];
		games.push([game[0], game[1], site, domain.hostname]);
	}
}
games.sort();

sortLinks();

renderLinks();

// essential functions
function getId(id) {
	return document.getElementById(id);
}

function getClass(className) {
	return document.getElementsByClassName(className);
}

function remove(arr, value) {
	var index = arr.indexOf(value);
	if (index > -1) {
		arr.splice(index, 1);
	}
	return arr;
}

function quickAppend(type, container, text) {
	const el = document.createElement(type);
	el.textContent = text;
	container.append(el);
}

// major functions
function getLocalStorage() {
	if (!localStorage.openTab) localStorage.openTab = "NES";
}

function addSiteSelectors() {
	let main = document.getElementById("siteselector");
	let btn = document.createElement("button");
	btn.className = "buttonslim";
	btn.setAttribute("onclick", "togglesites(event);");
	linknamelist.forEach((element) => {
		btn.textContent = linknames[element];
		btn.setAttribute("data", element);
		main.appendChild(btn.cloneNode(true));
	});
}

function loadEmuGames() {
	const buttonParent = getId("buttonparent");

	const button = document.createElement("button");

	let li = document.createElement("li");
	let link = document.createElement("a");

	li.append(link);

	for (const system in emugames) {
		// Generate buttons
		let data = emugames[system];

		button.textContent = data.name;
		button.className = "tabbuttons " + system;
		button.setAttribute("onclick", `updateTabs("${system}")`);

		buttonParent.append(button.cloneNode(true));

		//Generate content
		const container = getId(system);

		quickAppend("h2", container, data.name);

		for (const title in data.games) {
			const gamedata = data.games[title];

			quickAppend("h3", container, title);

			for (const a in gamedata) {
				category = gamedata[a];

				if (a != "main") {
					quickAppend("h4", container, a);
				}

				let ul = document.createElement("ul");

				for (const game of category) {
					link.textContent = game.name;
					link.href = `game.html?ver=${data.consolename}&game=${game.rom}`;
					ul.append(li.cloneNode(true));
				}

				container.append(ul);
			}
		}
	}

	let web = document.createElement("button");
	web.textContent = "Web";
	web.className = "tabbuttons Web";
	web.setAttribute("onclick", 'updateTabs("Web")');
	buttonParent.append(web);
}

function updateTabs(tab) {
	// updates the tabs and buttons
	sessionStorage.openTab = tab;
	let tabcontent = getClass("tabcontent");
	for (let i = 0; i < tabcontent.length; i++) {
		// hides all tabs
		tabcontent[i].style.display = "none";
	}
	getId(tab).style.display = "block"; // shows the correct tab
	let tabbuttons = getClass("tabbuttons");
	for (let i = 0; i < tabbuttons.length; i++) {
		// clears the active class from all tabs and adds the active class to the correct tab
		tabbuttons[i].className = tabbuttons[i].className.replace(" active", "");
		if (tabbuttons[i].className.includes(tab)) {
			tabbuttons[i].className += " active";
		}
	}
	let hidden = getClass("webhidden");
	let disp = tab == "Web" ? "none" : "inline";

	for (let el of hidden) {
		el.style.display = disp;
	}
}

function togglesites(event) {
	const el = event.currentTarget;

	let classes = el.className.split(" ");

	if (classes.includes("active")) {
		classes = remove(classes, "active");
		filteredsites = remove(filteredsites, el.attributes["data"].nodeValue);
	} else {
		classes.push("active");
		filteredsites.push(el.attributes["data"].nodeValue);
	}

	el.className = classes.join(" ");

	onSearchInput();
}

function toggleoldcores() {
	let toggle = getId("coretoggle");
	let classes = toggle.className.split(" ");

	if (classes.includes("active")) {
		classes = remove(classes, "active");
		localStorage.oldCores = "0";
	} else {
		localStorage.oldCores = "1";
		classes.push("active");
	}

	toggle.className = classes.join(" ");
}

function toggleEmulator() {
	let main = getId("emulatortoggle");

	if (main.textContent == "EmulatorJS") {
		localStorage.emu = "NJS";
		main.textContent = "NeptunJS";
		getId("coretoggle").style.display = "none";
	} else {
		localStorage.emu = "EJS";
		main.textContent = "EmulatorJS";
		getId("coretoggle").style.display = "inline-block";
	}
}

function sortLinks() {
	matches = [];

	for (const game of games) {
		if (
			game[0].toLowerCase().includes(getId("websearch").value.toLowerCase()) &&
			!filteredsites.includes(game[2])
		) {
			matches.push(game);
		}
	}
}

function renderLinks() {
	main = getId("webgames");
	main.innerHTML = "";

	const div = document.createElement("div");
	div.className = "webcontent";
	const a = document.createElement("a");
	a.className = "weblinks";
	a.setAttribute("target", "_blank");
	const p = document.createElement("p");
	p.className = "domainname";

	div.appendChild(a);
	div.appendChild(p);

	const startvalue = page * linksperpage;

	for (const game of matches.slice(startvalue, startvalue + linksperpage)) {
		a.textContent = game[0] + " - " + linknames[game[2]];
		a.href = game[1];
		a.style.color =
			"hsl(" + (360 / linknamelist.length) * linknamelist.indexOf(game[2]) + ", 100%, 90%)";

		p.textContent = "(" + game[3] + ")";

		main.appendChild(div.cloneNode(true));
	}

	const disp = getClass("pagedisplay");

	Array.from(disp).forEach((element) => {
		element.textContent = `Page ${page + 1} of ${Math.floor(matches.length / linksperpage) + 1}`;
	});
}

function nextPage() {
	if (page != Math.floor(matches.length / linksperpage)) {
		page += 1;
		renderLinks();
	}
}

function prevPage() {
	if (page != 0) {
		page -= 1;
		renderLinks();
	}
}

function onSearchInput() {
	console.log("running search input");
	page = 0;
	sortLinks();
	renderLinks();
}
