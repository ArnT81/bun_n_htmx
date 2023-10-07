const PORT = 4000
const onServer = !import.meta.url.includes('Desktop');
let status;

const queryStringToObject = url => [...new URLSearchParams(url.split('?')[1])].reduce((a, [k, v]) => ((a[k] = v), a), {});


//PATHS
const notFound = () => {
	status = 404;
	return Bun.file("pages/404.html")
};

const language = (req) => JSON.stringify({
	'Python': { library: ['Django', 'Flask', 'FastApi'] },
	'Ruby': { library: ['Rails', 'Sinatra'] },
	'JavaScript': { library: ['Express', 'Hapi', 'Bun'] }
}[req.query.language]);

const stooges = () => JSON.stringify({
	"stooges": [
		{ "name": "Moe" },
		{ "name": "Larry" },
		{ "name": "Curly" }
	]
});


//HANDLEREQUESTS
const handleRequests = (request) => {
	const req = new URL(request.url);
	req.method = request.method;
	status = 200;

	//By ID
	for (const part of req.pathname.split("/")) {
		if (part && !isNaN(part)) {
			req.id = part;
			req.pathname = req.pathname.replace(part, ':id');
		};
	}

	//Queries
	if (req.search) {
		//Only first query (if several) is used as selector in the return statement below
		req.query = queryStringToObject(request.url);
		req.pathname = `${req.pathname}/${Object.keys(req.query)[0]}`;
	}

	//Web application (bun has built in support for most requirements)
	return {
		"/image": () => Bun.file("media/me.png"),
		"/frameworks/language": language,
		"/stooges": stooges,
	}[req.pathname]?.(req) || notFound();
};


//BUN SERVER
const htmxHeaders = "hx-target,hx-current-url,hx-request,hx-trigger-name";
const server = Bun.serve({
	port: PORT,
	tls: {
		key: onServer ? Bun.file(SSL_KEY) : null,
		cert: onServer ? Bun.file(SSL_CERT) : null,
	},
	fetch: (req) => new Response(handleRequests(req), {
		status: status,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': htmxHeaders,
			'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
		}
	}),
	error: (error) => new Response(`<pre>${error}\n${error.stack}</pre>`, {
		headers: { "Content-Type": "text/html" }
	})

});
console.log(`Bun server listening on http://localhost:${server.port}`);