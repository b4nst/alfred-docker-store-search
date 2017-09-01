import test from 'ava';
import alfyTest from 'alfy-test';

test(async t => {
	const alfy = alfyTest();
	const result = await alfy('nginx');

	var official = result.filter(img => {
		return img.uid === '37b1dde7-a3e7-463a-a0e3-d8be2b136292';
	});
	t.is(official.length, 1, 'Official NGinx image not found !');
	t.is(official[0].title, 'nginx');
	t.is(official[0].type, 'default');
	t.is(official[0].arg, 'https://store.docker.com/images/nginx');
	t.regex(official[0].subtitle, /^\[([0-9]|\.)+(M|K|B|T)\+\] Official build of Nginx\.$/);
});
