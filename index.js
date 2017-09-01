'use strict';
const alfy = require('alfy');
const querystring = require('querystring');

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
		var repo = image.source == "community" ? "community/": "";
		var image_url = BASE_URL + repo + "images/" + image.name;

		var obj = {
			uid: image.id ? image.id : image.name,
			type: "default",
			title: image.name,
			subtitle: image.short_description,
			arg: image_url,
			autocomplete: image.name
		};

		return obj;
	});

	alfy.output(items)
});
