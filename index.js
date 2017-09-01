'use strict';
const alfy = require('alfy');
const querystring = require('querystring');
const approx = require('approximate-number');


const BASE_URL = "https://store.docker.com/"
const SEARCH_API_URL = BASE_URL + "api/content/v1/products/search?"
const MAX_RESULTS = 9

var search_options = {
	q: alfy.input,
	source: "verified",
	page: 1,
	page_size: MAX_RESULTS
};
var url = SEARCH_API_URL + querystring.stringify(search_options);
var found = [];

alfy.fetch(url, {
	transform: body => {
		return body.summaries;
	}
}).then(trusted_images => {
	if (trusted_images != null) {
		Array.prototype.push.apply(found, trusted_images);
	}
	if (found.length < MAX_RESULTS) {
		search_options.source = "community";
		search_options.page_size = MAX_RESULTS - found.length;
		url = SEARCH_API_URL + querystring.stringify(search_options);
		return alfy.fetch(url, {
			transform: body => {
				return body.summaries;
			}
		})
	} else {
		return [];
	}
}).then(community_images => {
	if (community_images != null) {
		Array.prototype.push.apply(found, community_images);
	}

	let items = found.map(image => {
		var repo = "";
		var obj = {
			uid: image.id ? image.id : image.name,
			type: "default",
			title: image.name,
			subtitle: "[" + approx(image.popularity).toUpperCase() + "+] " + image.short_description,
			autocomplete: image.name
		};

		// Community images
		if (image.source==="community") {
			repo = "community/"
			obj.icon = {
				path: "icon_community.png"
			}
		}

		obj.arg = BASE_URL + repo + "images/" + image.name;		

		return obj;
	});

	alfy.output(items)
});
