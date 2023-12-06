import { AUTHORS_PAGE } from './tools/constants.js';
import { loadPageFromCurrentUrl } from './tools/loadMainContent.js';
import { request } from './tools/request.js';
import { setLink } from './tools/helpers.js'

export { userIsAuthorized, userIsNotAuthorized };

window.myApp = window.myApp || {};
window.myApp.tokenVerificationResult = window.myApp.tokenVerificationResult || false;

// loadPageFromCurrentUrl();

$(function() {
    const userToken = localStorage.getItem('JWTToken');
    if (userToken !== null) {
        const loadEmail = (data) => {
            console.log("index profile get", data);
            if (data.status === 200) {
                userIsAuthorized(data.body.email);
            }
            else {
                userIsNotAuthorized();
            }

            loadPageFromCurrentUrl();
            init();
        }

        request('https://blog.kreosoft.space/api/account/profile', 'GET', loadEmail, null, userToken);
    }
    else {
        userIsNotAuthorized();
        loadPageFromCurrentUrl();
        init();
    }
});

function userIsAuthorized (email) {
    $('#placeholder_id').addClass('d-none');
    $('#placeholder_login_id').addClass('d-none');
    $('#placeholder_user_email_id').removeClass('d-none');

    $('#user_email_id').text(email);

    window.myApp.tokenVerificationResult = true;
}

function userIsNotAuthorized () {
    $('#placeholder_id').addClass('d-none');
    $('#placeholder_login_id').removeClass('d-none');
    $('#placeholder_user_email_id').addClass('d-none');

    window.myApp.tokenVerificationResult = false;
}

function init() {
    setLink($('#logo_button_id'), '/');
    setLink($('#main_page_button_id'), '/');
    setLink($('#author_page_button_id'), AUTHORS_PAGE);
    setLink($('#community_page_button_id'), "/communities");
    setLink($('#login_page_button_id'), "/login");
    setLink($('#profile_page_button_id'), "/profile");

    // $('#logo_button_id').click(() => loadPageWithoutReload("/"));
    // $('#main_page_button_id').click(() => loadPageWithoutReload("/"));
    // $('#author_page_button_id').click(() => loadPageWithoutReload(AUTHORS_PAGE));
    // $('#community_page_button_id').click(() => loadPageWithoutReload("/communities"));
    //$('#login_page_button_id').click(() => loadPageWithoutReload("/login"));
    //$('#profile_page_button_id').click(() => loadPageWithoutReload("/profile"));
    $('#logout_button_id').click(() => {
        const userToken = localStorage.getItem('JWTToken');
        const logout = (data) => {
            console.log(data);
            if (data.status === 200) {
                userIsNotAuthorized();
            }
    
            loadPageFromCurrentUrl();
        }
    
        request('https://blog.kreosoft.space/api/account/logout', 'POST', logout, null, userToken);
    });
}