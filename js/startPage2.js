/* ------------------------------------------------------------------------
    StartPage v2.1.0
     http://cs.ucsb.edu/~andrewlo

	By: Andrew Lo
    License: Creative Commons Attribution-ShareAlike 3.0 Unported
	                <http://creativecommons.org/licenses/by/3.0/>
 ------------------------------------------------------------------------ */
var StartPage = {
	data: {
		topLinks: [],
		mainData: {
			hello: {
				facebook: "http://www.facebook.com",
				google: "http://www.google.com"
			}
		},
		currNum: 0,
		currLink: -1,
		currPage: -1
	},
	el: {
		dataStorage: null,
		head: null,
		jsonWindow: null,
		links: null,
		overlay: null,
		statusBar: null
	},
	initialize: function () {
		if (!window.localStorage) {
			window.alert("Please note that your browser does not support localStorage and your settings will not be saved when you leave the page.");
		}

		StartPage.el.dataStorage = $("dataContainer");
		StartPage.el.head = $("headContainer");
		StartPage.el.links = $("linksContainer");

		if (window.localStorage) {
			var sData = window.localStorage.getItem("savedData");
			if (sData) {
				StartPage.data.mainData = JSON.decode(sData);
			}
		}

		var divAddTopLink = new Element("div.toplink", {
			id: "addTopLink",
			events: {
				"click": StartPage.addTopLink
			}
		});
		divAddTopLink.adopt(new Element("h1", {text: "+"}));
		StartPage.el.head.adopt(divAddTopLink);

		var divAddLink = new Element("li#addLink", { styles: { visibility: "hidden" } }),
			divAddLinkInner = new Element("a", {
				events: {
					click: function () {
						StartPage.addLink();
					}
				},
				href: "javascript:void(0);",
				text: "add link..."
			});
		divAddLink.adopt(divAddLinkInner);
		$("linkContainer").adopt(divAddLink);

		StartPage.el.statusBar = new Element("div#statusBar");
		document.body.adopt(StartPage.el.statusBar);
		StartPage.setStatus();

		var aboutLink = new Element("a#linkAbout", {
			events: {
				click: function () {
					window.alert("StartPage v2.1.0\n" +
						"by:" +
						"\tAndrew Lo\n" +
						"\thttp://cs.ucsb.edu/~andrewlo/\n" +
						"\tsince January 2012");
				}
			},
			href: "javascript:void(0)",
			text: "?"
		});
		document.body.adopt(aboutLink);

		var	jsonMenu = new Element("span#jsonMenu"),
			importJSON = new Element("a", {
				events: {
					click: StartPage.showJSONImport
				},
				href: "javascript:void(0)",
				text: "in"
			});
		jsonMenu.adopt(importJSON);

		jsonMenu.adopt(new Element("span", {styles: {margin: "0 5px"}, text: "|"}));

		var exportJSON = new Element("a", {
			events: {
				click: StartPage.showJSONExport
			},
			href: "javascript:void(0)",
			text: "out"
		});
		jsonMenu.adopt(exportJSON);

		document.body.adopt(jsonMenu);

		StartPage.loadTopLinks();

		if (Object.keys(StartPage).length > 0) {
			StartPage.loadLinks(0);
		}

		window.addEvent("keydown", StartPage.keyNav);
		window.focus();
	},
	addLink: function () {
		if ($("link-input") || StartPage.data.currPage === -1) {
			return;
		}

		var divInput = new Element("li#link-input");

		var linkTitle = new Element("input#link-input-title", {
			autocomplete: "off",
			events: {
				blur: function (e) {
					if (this.get("value") === "") {
						this.set("value", "name");
						this.setStyle("color", "#888");
					}
				},
				focus: function (e) {
					if (this.get("value") === "name") {
						this.set("value", "");
						this.setStyle("color", "#000");
					}
				}
			},
			styles: { color: "#888" },
			type: "text",
			value: "name"
		});
		divInput.adopt(linkTitle);

		var linkUrl = new Element("input#link-input-url", {
			autocomplete: "off",
			events: {
				blur: function (e) {
					if (this.get("value") === "" || this.get("value") === "http://") {
						this.set("value", "url");
						this.setStyle("color", "#888");
					}
				},
				focus: function (e) {
					if (this.get("value") === "url") {
						this.set("value", "http://");
						this.setStyle("color", "#000");
					}
				}
			},
			styles: { color: "#888" },
			type: "text",
			value: "url"
		});
		divInput.adopt(linkUrl);

		var btnAdd = new Element("span.link-input-button", {
			events: {
				click: StartPage.saveLink
			},
			text: "+"
		});
		divInput.adopt(btnAdd);

		var linkSep = new Element("span", {
			styles: {
				margin: "0 10px"
			},
			text: "|"
		});
		divInput.adopt(linkSep);

		var btnRemove = new Element("span.link-input-button", {
			events: {
				click: function (e) {
					this.getParent().destroy();
				}
			},
			text: "x"
		});
		divInput.adopt(btnRemove);

		divInput.inject($("addLink"), "before");

		linkTitle.focus();

		window.addEvent("keydown", function (e) {
			if ($("link-input")) {
				if (e.key === "enter") {
					StartPage.saveLink();
					StartPage.keyNav();
				} else if (e.key === "esc" || e.key === "up") {
					StartPage.stopLinkPolling();
					--StartPage.data.currLink;
					StartPage.keyNav();
				}
			}
		});
	},
	addTopLink: function () {
		if ($("toplink-input")) {
			return;
		}

		StartPage.stopLinkPolling();

		var divInput = new Element("div.toplink", {id: "toplink-input"});

		var divNum = new Element("h1", {text: "0" + StartPage.data.currNum});
		divInput.adopt(divNum);

		var divTitle = new Element("input", {
			autocomplete: "off",
			events: {
				blur: StartPage.saveTopLink,
				focus: function (e) {
					this.set("value", "");
				}
			},
			styles: {
				width: "7em"
			},
			type: "text",
			value: "section"
		});
		divInput.adopt(divTitle);

		divInput.inject($("addTopLink"), "before");
		divTitle.focus();

		window.addEvent("keydown", function (e) {
			if ($("toplink-input")) {
				if (e.key === "enter") {
					StartPage.saveTopLink();
				} else if (e.key === "esc") {
					$("toplink-input").destroy();
					window.removeEvents("keydown");
					window.addEvent("keydown", StartPage.keyNav);
				}
			}
		});
	},
	constructLink: function (sTitle, sUrl) {
		var liWrap = new Element("li");
		var aLink = new Element("a", {
			href: sUrl,
			text: sTitle
		});
		liWrap.adopt(aLink);
		var spanClose = new Element("span.link-remove", {
			events: {
				click: StartPage.removeLink
			},
			styles: {
				marginLeft: "10px"
			},
			text: "x"
		});
		liWrap.adopt(spanClose);

		return liWrap;
	},
	constructTopLink: function (sTitle) {
		var divWrap = new Element("div.toplink", {
			events: {
				click: function (e) {
					StartPage.loadLinks(parseInt(this.getElements("h1")[0].get("text"), 10));
				}
			}
		});

		var divRemove = new Element("div.toplink-remove", {
			events: {
				click: StartPage.removeTopLink
			},
			text: "x"
		});
		divWrap.adopt(divRemove);

		var divNum = new Element("h1", {
			text: "0" + StartPage.data.currNum
		});
		divWrap.adopt(divNum);

		var divTitle = new Element("span.label", {text: sTitle});
		divWrap.adopt(divTitle);

		return divWrap;
	},
	clearLinks: function () {
		var i, listItems = StartPage.el.links.getElements("li");
		for (i = listItems.length - 1; i >= 0; i--) {
			if (listItems[i].id !== "addLink") {
				listItems[i].destroy();
			}
		}
	},
	clearTopLinks: function () {
		var i, divs = StartPage.el.head.getElements("div");
		for (i = divs.length - 1; i >= 0; i--) {
			if (divs[i].id !== "addTopLink") {
				divs[i].destroy();
			}
		}
	},
	keyNav: function (e) {
		if (e && !($("toplink-input") || $("link-input"))) {
			if (e.key === "left" && StartPage.data.currPage > 0) {
				StartPage.loadLinks(--StartPage.data.currPage);
			} else if (e.key === "right" && StartPage.data.currPage < StartPage.data.topLinks.length - 1) {
				StartPage.loadLinks(++StartPage.data.currPage);
			} else if (e.key === "right" && StartPage.data.currPage >= StartPage.data.topLinks.length - 1 && StartPage.data.topLinks.length < 5) {
				StartPage.addTopLink();
			} else if (e.key === "down" && StartPage.data.currLink < $$("#linkContainer a").length - 2) {
				++StartPage.data.currLink;
			} else if (e.key === "down" && StartPage.data.currLink >= $$("#linkContainer a").length - 2) {
				++StartPage.data.currLink;
				StartPage.addLink();
			} else if (e.key === "up" && StartPage.data.currLink >= 0) {
				--StartPage.data.currLink;
			} else if (e.key === "enter") {
				var sUrl = $$("#linkContainer a")[StartPage.data.currLink].get("href");
				location.href = sUrl;
			} else if (e.key === "delete") {
				if (StartPage.data.currLink === -1) {
					$$(".toplink-remove")[StartPage.data.currPage].fireEvent("click");
				} else {
					$$(".link-remove")[StartPage.data.currLink].fireEvent("click");
				}
			}
		}

		StartPage.setStatus();

		var i, pageLinks = $$("#linkContainer a");
		// Refresh link display
		for (i = 0; i < pageLinks.length; i++) {
			if (i === StartPage.data.currLink) {
				$$("#linkContainer li")[i].setStyle("backgroundColor", "#EEE");
				if ($$("#linkContainer a")[i].get("href") === "javascript:void(0);") {
					StartPage.setStatus();
				} else {
					StartPage.setStatus($$("#linkContainer a")[i].get("href"));
				}
			} else {
				$$("#linkContainer li")[i].setStyle("backgroundColor", "transparent");
			}
		}
	},
	loadLinks: function (sNum) {
		StartPage.clearLinks();
		StartPage.data.currPage = sNum;
		StartPage.data.currLink = -1;

		if (StartPage.data.topLinks.length > 0) {
			var sortArray = [];
			var objLinks = Object.values(StartPage.data.mainData)[sNum];

			Object.each(objLinks, function (v, k) {
				sortArray.push([k, v]);
			});

			sortArray.sort();

			var i;
			for (i = 0; i < sortArray.length; i++) {
				var liNewLink = StartPage.constructLink(sortArray[i][0], sortArray[i][1]);
				liNewLink.inject($("addLink"), "before");
			}

			if ($("toplink-active")) {
				$("toplink-active").erase("id");
			}
			$$(".toplink")[parseInt(sNum, 10)].set("id", "toplink-active");

			$("addLink").setStyle("visibility", "visible");
		} else {
			$("addLink").setStyle("visibility", "hidden");
		}
	},
	loadTopLinks: function () {
		var i, keys = Object.keys(StartPage.data.mainData);

		StartPage.data.currLink = -1;
		StartPage.clearTopLinks();
		for (i = 0; i < keys.length; i++) {
			var divNewTopLink = StartPage.constructTopLink(keys[i]);
			StartPage.data.topLinks.push(divNewTopLink);
			divNewTopLink.inject($("addTopLink"), "before");
			StartPage.data.currNum++;
		}
		if (keys.length > 4) {
			$("addTopLink").setStyle("display", "none");
		}
	},
	removeLink: function (e) {
		var sTitle = this.getParent().getElements("a")[0].get("text");
		var titles = [];

		--StartPage.data.currLink;
		$$("div.toplink span").each(function (i) {
			titles.push(i.get("text"));
		});

		delete StartPage.data.mainData[titles[StartPage.data.currPage]][sTitle];
		this.getParent().destroy();
		StartPage.saveJSON();
	},
	removeTopLink: function (e) {
		var sTitle = this.getParent().getElements("span")[0].get("text");
		if (sTitle === Object.keys(StartPage.data.mainData)[StartPage.data.currPage]) {
			StartPage.data.currLink = -1;
			if (StartPage.data.topLinks.length < 2) {
				StartPage.data.currPage = -1;
				StartPage.clearLinks();
				$("addLink").setStyle("visibility", "hidden");
			} else {
				if (StartPage.data.currPage > 0) {
					--StartPage.data.currPage;
				}
			}
		}
		StartPage.data.topLinks.erase(this.getParent());
		delete StartPage.data.mainData[sTitle];
		$("addTopLink").setStyle("display", "block");
		this.getParent().destroy();
		StartPage.data.currNum--;

		var i;
		for (i = 0; i < StartPage.data.topLinks.length; i++) { // Reset numbering
			if (StartPage.data.topLinks[i].id !== "addTopLink") {
				StartPage.data.topLinks[i].getElements("h1")[0].set("text", "0" + i);
			}
		}

		if (StartPage.data.currPage !== -1) {
			StartPage.loadLinks(StartPage.data.currPage);
		}

		StartPage.saveJSON();
	},
	saveLink: function () {
		var	i,
			links,
			sTitle = $("link-input-title").get("value"),
			sUrl = $("link-input-url").get("value"),
			titles = [];

		$$("div.toplink span").each(function (i) {
			titles.push(i.get("text"));
		});

		if (typeof StartPage.data.mainData[titles[StartPage.data.currPage]][sTitle] !== "undefined") {
			window.alert("Link name already exists.");
			return;
		} else if (sTitle !== "" && sUrl !== "") {
			var liNewLink = StartPage.constructLink(sTitle, sUrl);
			liNewLink.inject($("addLink"), "before");
			StartPage.data.mainData[titles[StartPage.data.currPage]][sTitle] = sUrl;
			StartPage.stopLinkPolling();
		} else {
			window.alert("One or more fields are empty.");
			return;
		}
		StartPage.loadLinks(StartPage.data.currPage);
		StartPage.saveJSON();
		
		links = $$("#linkContainer a");
		for (i = 0; i < links.length; i++) {
			if (links[i].get("text") === sTitle) {
				StartPage.data.currLink = i;
				return;
			}
		}
		StartPage.keyNav();
	},
	saveTopLink: function () {
		var	i,
			sTitle = $("toplink-input").getElements("input")[0].get("value"),
			titles = $$(".toplink span");

		$("toplink-input").destroy();

		for (i = 0; i < titles.length; i++) {
			if (titles[i].get("text") === sTitle) {
				window.alert("Name already exists.");
				$("toplink-input").getElements("input")[0].focus();
				return;
			}
		}

		if (sTitle !== "") {
			var divNewTopLink = StartPage.constructTopLink(sTitle);
			divNewTopLink.inject($("addTopLink"), "before");
			StartPage.data.topLinks.push(divNewTopLink);

			StartPage.data.mainData[sTitle] = {};
			StartPage.loadLinks(StartPage.data.currNum);

			StartPage.data.currNum++;
			if (StartPage.data.topLinks.length > 4) {
				$("addTopLink").setStyle("display", "none");
			}
		}

		StartPage.saveJSON();
	},
	saveJSON: function () {
		if (window.localStorage) {
			var sJSON = JSON.encode(StartPage.data.mainData);
			window.localStorage.setItem("savedData", sJSON);
		}
	},
	setStatus: function (sStatus) {
		if (typeof sStatus === "undefined") {
			StartPage.el.statusBar.set("text", "");
			StartPage.el.statusBar.setStyle("display", "none");
		} else {
			StartPage.el.statusBar.set("text", sStatus);
			StartPage.el.statusBar.setStyle("display", "block");
			StartPage.el.statusBar.setStyle("left", (window.getCoordinates().width / 2 - StartPage.el.statusBar.getCoordinates().width / 2) + "px");
		}
	},
	showJSONExport: function () {
		window.prompt("Export JSON string:", JSON.encode(StartPage.data.mainData));
	},
	showJSONImport: function () {
		var	jsonString = window.prompt("Import JSON string:"),
			jsonObj = JSON.decode(jsonString, true);
		if (!jsonString) {
			return;
		}
		if (!jsonObj) {
			window.alert("Please check your JSON string and try again.");
		} else {
			window.localStorage.setItem("savedData", jsonString);
			location.reload();
		}
	},
	stopLinkPolling: function () {
		if ($("link-input")) {
			$("link-input").destroy();
		}
		window.removeEvents("keydown");
		window.addEvent("keydown", StartPage.keyNav);
	}
};