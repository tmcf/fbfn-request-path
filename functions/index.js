/**
 * Test Firebase functions to check the request paths visible to functions
 * in the emulator vs live deployment.
 */


const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

console.log("Process env for cloud functions:")
const env = process.env;
Object.keys(env).forEach(function(key) {
	console.log('env ' + key + '="' + env[key] +'"');
});

/**
 * Simple handler that logs its name and request details to the console
 * and returns the same as the response body
 * 
 * @param {*} handlerName , The expected request path visible after hosting rewrite
 */
const logUrlHandler = (handlerName, parentPath) => {
    return functions.https.onRequest((req,resp) => {
		const reqInfo = {
			handler: handlerName,
			expectedPath: `${parentPath}/${handlerName}`,
			requestUrl: req.url
		}
		resp.send(reqInfo);
    });
}

/**
 * Export a set of firebase cloud function "api" handlers as an api tree.
 * The handler pathNames correspond to the rewrite rules provided in firebase.json
 * 
 * Firebase translates nested handler such as A.B.C to a handler identified as A-B-C.
 * So the below will generate several cloud functions such as:
 *     api-v1-alpha
 *     api.epsilon
 *     api-v1-A-zeta
 *     api-v2-alpha...
 */
exports.api = {
	v1: {
		alpha: logUrlHandler('alpha', '/api/v1'),
		beta: logUrlHandler('beta', '/api/v1'),
		not_a_handler: "If its not a fn?, its skipped",
		A: {
			zeta: logUrlHandler('zeta','/api/v1/A')
		}
	},
	v2: {
		alpha: logUrlHandler('gamma','/api/v2'),
		beta: logUrlHandler('delta', '/api/v2'),		
	},
	epsilon: logUrlHandler('epsilon', '/api')
}
