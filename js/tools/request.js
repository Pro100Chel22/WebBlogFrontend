export { request };

function request(url, method, callback, data = null, userToken = null) {
    let request = {
        method,
        headers: {
            'accept': 'text/plain'
        }
    }

    if(userToken !== null) {
        request.headers['Authorization'] = "Bearer " + userToken;
    }

    if(data !== null) {
        request.headers['content-Type'] = "application/json";
        request.body = JSON.stringify(data)
    }

    let status;
    fetch(url, request)
        .then(response => {
            status = response.status;

            const contentType = response.headers.get('content-type');
            if (contentType && (contentType.includes('application/json') || contentType.includes('application/problem+json'))) {
                return response.json();
            } else {
                return null;
            }
        })
        .then(data => {
            callback({ body: data, status });
        })
        .catch(error => {
            console.error('Произошла ошибка:', error);
        });
}