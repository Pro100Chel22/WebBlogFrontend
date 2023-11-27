export { Router }

let Router = {
    // если tokenVerificationResultRequired == false, то на страницу можно попасть только неавторизованным, если true, то только авторизованным, если null, то и так и так 
    routes: { 
        "/": { filePath: "main.html", tokenVerificationResultRequired: null }, // :id
        "/login": { filePath: "login.html", tokenVerificationResultRequired: false }, 
        "/registration": { filePath: "registration.html", tokenVerificationResultRequired: false },
        "/profile": { filePath: "profile.html", tokenVerificationResultRequired: true },
        "/communities": { filePath: "communities.html", tokenVerificationResultRequired: null },
        "/communities/:id": { filePath: "community.html", tokenVerificationResultRequired: null }
    },

    init: function() {
        this._routes = [];

        for(let route in this.routes) {
            this._routes.push({
                pattern: new RegExp('^' + route.replace(/:\w+/g,'((\\w|\\-)+)') + '$'), // (\\w|\\-)+
                filePath: this.routes[route].filePath,
                tokenVerificationResultRequired: this.routes[route].tokenVerificationResultRequired
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