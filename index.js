'use strict';
const querystring = require('querystring');
const alfy = require('alfy');
const approx = require('approximate-number');

const BASE_URL = 'https://store.docker.com/';
const SEARCH_API_URL = BASE_URL + 'api/content/v1/products/search?';
const MAX_RESULTS = 9;

var searchOptions = {
	q: alfy.input,
	source: 'verified',
	page: 1,
	page_size: MAX_RESULTS // eslint-disable-line camelcase
};
var url = SEARCH_API_URL + querystring.stringify(searchOptions);
var found = [];

alfy.fetch(url, {
	transform: body => {
		return body.summaries;
	}
}).then(trustedImages => {
	if (trustedImages !== null) {
		Array.prototype.push.apply(found, trustedImages);
	}
	if (found.length < MAX_RESULTS) {
		searchOptions.source = 'community';
		searchOptions.page_size = MAX_RESULTS - found.length; // eslint-disable-line camelcase
		url = SEARCH_API_URL + querystring.stringify(searchOptions);
		return alfy.fetch(url, {
			transform: body => {
				return body.summaries;
			}
		});
	}
	return [];
}).then(communityImages => {
	if (communityImages !== null) {
		Array.prototype.push.apply(found, communityImages);
	}

	let items = found.map(image => {
		var repo = '';
		var obj = {
			uid: image.id ? image.id : image.name,
			type: 'default',
			title: image.name,
			subtitle: '[' + approx(image.popularity).toUpperCase() + '+] ' + image.short_description,
			autocomplete: image.name
		};

		// Community images
		if (image.source === 'community') {
			repo = 'community/';
			obj.icon = {
				path: 'icon_community.png'
			};
		}

		obj.arg = BASE_URL + repo + 'images/' + image.name;

		return obj;
	});

	alfy.output(items);
});
