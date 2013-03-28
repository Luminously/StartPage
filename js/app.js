/*
	StartPage
	http://github.com/abstractOwl
*/

(function () { // Wrap strict scope
	'use strict';

	// Set default links
	var defaultData = {
		hello: {
			facebook: "http://www.facebook.com",
			google: "http://www.google.com"
		},
		goodbye: {
			test: 'http://b.com'
		}
	}

	// Represent URL category
	function Category(name) {
		this.children	=	{};
		this.name		=	name;
		this.count		=	0;
	}
	// Mold it into any shape you want! Perfect gift for any childNode.
	Category.prototype.htmlDoh		=
		'<li class="category"><div><span>{{name}}</span></div>'
		+ '<ul>{{links}}<li><a class="add-link" href="#">Add Link</a></li>'
		+ '</ul></li>';
	Category.prototype.stringDoh	= '{ name: {{name}}, links: [{{links}}] }';
	// Add a Link object to this Category
	Category.prototype.add = function (name, url) {
		this.children[this.count] = new Link(name, url, this.count);
		this.count++;
	};
	// Given an id, remove Link associated with that id
	Category.prototype.remove = function (id) {
		delete this.children[id];
	};
	// Get element representation of this Category instance
	Category.prototype.toElement = function () {
		return magic(this.html());
	};
	// Get HTML representation of this Category instance
	Category.prototype.html = function () {
		var s = '';

		for (var p in this.children) {
			s += this.children[p].html();
		}

		return (
			compile(this.htmlDoh, {
				name: this.name,
				links: s
			})
		);
	};
	// Get JSON string representation of thie Category instance
	Category.prototype.toJSON = function () {
		var s = '';

		for (var p in this.children) {
			if (this.children.hasOwnProperty(p)) {
				s += this.children[p].toJSON();
			}
		}

		return (
			compile(this.stringDoh, {
				name: this.name,
				links: s
			})
		);
	};

	// Represent Link object
	function Link(name, url, id) {
		this.name	=	name;
		this.url	=	url;
		this.id		=	id;
	}
	// Mold it into any shape you want! Perfect gift for any childNode.
	Link.prototype.htmlDoh		=	'<li data-id="{{id}}">'
		+ '<a href="{{url}}">{{name}}</a></li>';
	Link.prototype.stringDoh	=	'{ name: {{name}}, url: {{url}} }';
	// Get element representation of this Link instance
	Link.prototype.toElement = function () {
		return magic(this.html());
	};
	// Get HTML representation of this Link instance
	Link.prototype.html = function () {
		return (
			compile(this.htmlDoh, {
				id: this.id,
				name: this.name,
				url: this.url
			})
		);
	};
	// Get JSON string representation of this Link instance
	Link.prototype.toJSON = function () {
		return compile(this.stringDoh, { name: this.name, url: this.url });
	};

	// Singleton object representing StartPage application
	var StartPage = (function () {
		var	instance,
			categories,
			element,
			storage,
			storageImplementations;

		//
		//	Storage Strategies: (cookie|dom|none)
		//		Each storage strategy implements the following functions:
		//			- init(): Initializes storage strategy
		//			- get(k): Retrieves item from storage
		//			- set(k, v): Puts item into storage
		//			- supported(): Check whether browser supports strategy
		//
		storageImplementations = {
			cookie: {
				init: function () {},
				get: function (k) {
					return
						unescape(document.cookie.replace(
							new RegExp("(?:^|.*;\\s*)"
								+ escape(sKey).replace(/[\-\.\+\*]/g, "\\$&")
								+ "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"),
								"$1"
							)
						);
				},
				set: function (k, v) {
					// Only stores one item. Which is all we need, for now
					document.cookie = escape(k) + '=' + escape(v) + '; '
						+ 'expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/';
				},
				supported: function () {
					return navigator.cookieEnabled;
				}
			},
			dom: {
				init: function () {},
				get: function (k) {
					return window.localStorage.getItem(k);
				},
				set: function (k, v) {
					window.localStorage.setItem(k, v);
				},
				supported: function () {
					return !!window.localStorage;
				}
			},
			none: {
				init: function () {
					window.alert('DOM and Cookie storage are not supported by '
						+ 'your browser. Your session will not be saved.');
				},
				get: function (k) {},
				set: function (k, v) {},
				supported: function () {
					return true;
				}
			}
		};

		function addCategory() {
			var title = prompt ('Name your shiny new category!');
			categories.push(new Category(title));
		}

		function addLink() {
			var title	=	prompt ('What will you name this link?'),
				url		=	prompt ('What is the link\'s URL?', 'http://');

		// Get current category
		// Category.add(title, url);
		}

		var VK = {
			UP:		38,
			DOWN:	40,
			LEFT:	37,
			RIGHT:	39,
			ENTER:	13,
			DELETE:	46
		};
		function handleKey(key) {
			switch (key) {
			case VK.UP :
				console.log('up');
				break;
			case VK.DOWN:
				console.log('down');
				break;
			case VK.LEFT:
				console.log('left');
				break;
			case VK.RIGHT:
				console.log('right');
				break;
			case VK.ENTER:
				console.log('enter');
				break;
			case VK.DELETE:
				console.log('delete');
				break;
			}
		}

		function init() {
			// Initialize this object
			categories	=	[];

			if (storageImplementations.dom.supported()) {
				storage = storageImplementations.dom;
			} else if (storageImplementations.cookie.supported()) {
				storage = storageImplementations.cookie;
			} else {
				storage = storageImplementations.none;
			}

			window.onkeydown = function (e) {
				var key = e.which ? e.which : e.keyCode;
				handleKey(key);
			};

			return {
				// Load settings or defaults
				loadSettings: function () {
					if (!storage.get('links')) {
						this.fromJSON(JSON.stringify(defaultData));
					} else {
						this.fromJSON(storage.get('links'));
					}

					render();
				},
				// Public functions
				toElement: function () {
					return element;
				},
				// Load JSON string into StartPage
				fromJSON: function (s) {
					var tmp = JSON.parse(s);
					categories = [];

					// Unwrap JSON object
					for (var m in tmp) {
						if (tmp.hasOwnProperty(m)) {
							var c = new Category(m);

							for (var n in tmp[m]) {
								if (tmp[m].hasOwnProperty(n)) {
									c.add(n, tmp[m][n]);
								}
							}

							categories.push(c);
						}
					}
				},
				// Get JSON string representation of StartPage data
				toJSON: function () {
					var s = '';

					for (var i = 0, j = categories.length; i < j; i++) {
						s += categories[i].toJSON();
					}

					return '[' + s + ']';
				}
			}
		}
		function render() {
			console.log('render');
			// Definitely not most efficient way of rendering har har
			var clearfix = document.createElement('div');
			clearfix.className = 'clearfix';

			element = document.createElement('ul');
			element.className = 'container main';

			// Build interface
			for (var i = 0, j = categories.length; i < j; i++) {
				element.appendChild(categories[i].toElement());
			}
			element.appendChild(clearfix);

			document.body.innerHTML = ''; // Clear body
			document.body.appendChild(element);

			var addLinks = document.getElementsByClassName('add-link');
			for (var i = 0, j = addLinks.length; i < j; i++) {
				addLinks[i].onclick = function () {
					console.log('hey');
					addLink();
				}
			}
		}

		return {
			getInstance: function () {
				if (!instance) {
					instance = init();
				}

				return instance;
			}
		}
	}) ();

	// Utility functions

	// Fill in template strings
	function compile(a, b) {
		var s = a;

		for (var p in b) {
			if (b.hasOwnProperty(p)) {
				s = s.replace('{{' + p + '}}', b[p]);
			}
		}

		return s;
	}

	// Bringin' text to life in the DOM world
	function magic(s) {
		var t = document.createElement('div');
		t.innerHTML = s;
		return t.firstChild;
	}

	window.onload = function () {
		StartPage.getInstance().loadSettings();
	};

}) ();

