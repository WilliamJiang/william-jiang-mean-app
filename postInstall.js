// postInstall.js
var bower = require('bower');

if (process.env.SKIP_BOWER) {
    console.log('Skipping bower');
}
else {

    bower.commands
	.install()
	.on('end', function (installed) {
	    console.log(installed);
	});
}
