const addTagToResponse = (tag, response) => JSON.stringify({ [tag]: JSON.parse(response) });


$(() => {
	//LOGS ALL HTMX EVENTS
	/* htmx.logger = function (elt, e, data) {
		console.log(e, elt, data);
	} */

	//Needed for external API:n not customized for HTMX (missing tags)
	$('body').on('htmx:beforeSwap', (e) => {
		const { serverResponse, requestConfig: { path }, xhr: { status } } = e.detail;
		if (status === 404) alert("Error: Could not find the resource, please check the URL");
		if (path.includes('jsonplaceholder.typicode.com/users/')) e.detail.serverResponse = addTagToResponse("users", serverResponse);
	});

	//extensions client-side-template: support for client side template processign of JSON response
});