export { RequestInfo, request, multipleRequest };

class RequestInfo {
    constructor(url, method, data = null, userToken = null) {
        this.url = url;
        this.data = data;
        this.userToken = userToken;

        this.request = {
            method,
            headers: {
                'accept': 'text/plain'
            }
        }

        if(userToken !== null) {
            this.request.headers['Authorization'] = "Bearer " + userToken;
        }
    
        if(data !== null) {
            this.request.headers['content-Type'] = "application/json";
            this.request.body = JSON.stringify(data)
        }
    }
}

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

function multipleRequest (requestInfoFirst, requestInfoSecond, callback) {
    let fetchFirst = fetch(requestInfoFirst.url, requestInfoFirst.request);
    let fetchSecond = fetch(requestInfoSecond.url, requestInfoSecond.request);

    let status = [];
    Promise.all([fetchFirst, fetchSecond])
        .then(responses => {
            return Promise.all(responses.map(function (response) {
                status.push(response.status);

                const contentType = response.headers.get('content-type');
                if (contentType && (contentType.includes('application/json') || contentType.includes('application/problem+json'))) {
                    return response.json();
                } else {
                    return null;
                }
            }));
        })
        .then(data => {
            callback({ body: data, status });
        })
        .catch(error => {
            console.error('Произошла ошибка:', error);
        });
}