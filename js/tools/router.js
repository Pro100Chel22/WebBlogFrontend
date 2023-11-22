export { Router }

let Router = {
    routes: {
        "/login": { filePath: "login.html", beforeLoad: () => console.log("redir")},
        "/registration": { filePath: "registration.html", beforeLoad: null},
        "/profile": { filePath: "profile.html", beforeLoad: null}
    },

    init: function() {
        this._routes = [];

        for(let route in this.routes) {
            this._routes.push({
                pattern: new RegExp('^' + route.replace(/:\w+/g,'(\\w+)') + '$'),
                filePath: this.routes[route].filePath,
                beforeLoad: this.routes[route].beforeLoad
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