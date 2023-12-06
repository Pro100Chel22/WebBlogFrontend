import { Router } from './router.js';

export { loadPageWithoutReload, loadPageFromCurrentUrl, includeHTML, saveInitFuncAndRun };

window.myApp = window.myApp || {};
window.myApp.listInitFuncs = window.myApp.listInitFuncs || {};

function includeHTML(file) {
    let xhr = new XMLHttpRequest();
    
    xhr.open('GET', "/modules/" + file, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $('#main_container').html(xhr.responseText);
            
            $('#main_container').find("script").each(function(index, script) {
                let filePath = $(script).attr('src');

                let init = window.myApp.listInitFuncs[filePath];
                if(init) {
                    init();
                }
            })
        }
    };

    xhr.send();
}

function loadPageWithoutReload(file, usePush = true) {
    if (usePush) {
        window.history.pushState({}, "", file);
    }
    else {
        window.history.replaceState({}, "", file);
    }

    let route = Router.findFilePath(window.location.pathname); 
    loadPageContent(route);
}

function loadPageFromCurrentUrl() {
    let route = Router.findFilePath(window.location.pathname);
    loadPageContent(route);
}

function loadPageContent(route) {
    if (route) {
        let requirement = route.tokenVerificationResultRequired;

        if (requirement !== null && window.myApp.tokenVerificationResult !== requirement) {
            if (requirement) {
                loadPageWithoutReload('/login', false);
            }
            else {
                loadPageWithoutReload('/', false);
            }
        }
        else {
            includeHTML(route.filePath);
        }
    } 
    else {
        includeHTML('notFound.html');
    }
}

function saveInitFuncAndRun(initFunc) {
    $('#main_container').find('script').each(function(index, script) {
        let filePath = $(script).attr('src');
    
        window.myApp.listInitFuncs[filePath] = initFunc;
    })
    initFunc();
}

window.onpopstate = function(event) {
    loadPageFromCurrentUrl();
};