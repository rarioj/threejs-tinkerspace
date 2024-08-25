# ThreeJS Tinkerspace

> Personal ThreeJS experimentation and learning space.

This space requires minimal setup without additional JavaScript building and packaging tools (no `node_modules`). The `index.html` file must be served under *HTTP* as some features will not work using the *FILE* protocol. Thus, a **web server** is needed.

The quickest way to run a web server is by installing the `live-server` **npm** package (global installation) and running it in the project root directory.

	# install live-server
	npm install -g live-server

Then run the `live-server` command.

	# run live-server from the project root directory
	live-server

There are other methods to install a web server. Here is a quick list of HTTP static server methods: [Big list of http static server one-liners](https://gist.github.com/willurd/5720255)