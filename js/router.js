export { Router }

let Router = {
    routes: {
        "/login": "login.html",
        "/registration": "registration.html"
    },

    init: function() {
        this._routes = [];

        for(let route in this.routes) {
            this._routes.push({
                pattern: new RegExp('^' + route.replace(/:\w+/g,'(\\w+)') + '$'),

                filePath: this.routes[route]
            });
        }
    },

    findFilePath: function(filePath) {
        var i = this._routes.length;
       
        while(i--) {
            var args = filePath.match(this._routes[i].pattern);
           
            if(args) {
                return this._routes[i];
            }
        }

        return false;
    },
}

Router.init();