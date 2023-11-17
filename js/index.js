let Router = {
    routes: {
        "/login": "/modules/login.html",
        "/registration": "/modules/registration.html"
    },

    init: function() {
        this._routes = [];

        for(let route in this.routes) {
            this._routes.push({
                pattern: new RegExp('^' + route.replace(/:\w+/g,'(\\w+)') + '$'),

                path: this.routes[route]
            });
        }
    },

    dispatch: function(path) {
        var i = this._routes.length;
       
        while(i--) {
            var args = path.match(this._routes[i].pattern);
           
            if(args) {
                return this._routes[i];
            }
        }

        return false;
    },
}

function includeHTML(file) {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', file, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById('main_container').innerHTML = xhr.responseText;
        }
    };

    xhr.send();
}

Router.init();

let filePath = Router.dispatch(window.location.pathname);
if(filePath) {
    includeHTML(filePath.path);
} 
else {
    includeHTML("/modules/error.html");
}

