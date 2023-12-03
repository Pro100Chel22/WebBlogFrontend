import { AUTHORS_PAGE } from './tools/constants.js';
import { loadPageFromCurrentUrl, loadPageWithoutReload } from './tools/loadMainContent.js';
import { request } from './tools/request.js';

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
    $('#logo_button_id').click(() => loadPageWithoutReload("/"));
    $('#main_page_button_id').click(() => loadPageWithoutReload("/"));
    $('#author_page_button_id').click(() => loadPageWithoutReload(AUTHORS_PAGE));
    $('#community_page_button_id').click(() => loadPageWithoutReload("/communities"));
    $('#login_page_button_id').click(() => loadPageWithoutReload("/login"));
    $('#profile_page_button_id').click(() => loadPageWithoutReload("/profile"));
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

// localStorage.setItem('JWTToken', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI1ZTY4Njg4Yi00ZmU3LTQ1NjQtNmY5ZC0wOGRiZTc4ZjAyYmIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9hdXRoZW50aWNhdGlvbiI6IjMzYzBlNmIzLTNmNWEtNDcwNC1hYjRjLTU2MjhhYjlkNjdjYyIsIm5iZiI6MTcwMDQwMjQ2OCwiZXhwIjoxNzAwNDA2MDY4LCJpYXQiOjE3MDA0MDI0NjgsImlzcyI6IkJsb2cuQVBJIiwiYXVkIjoiQmxvZy5BUEkifQ.lvw50fr4MuAvEU2KN0kmYPPi-sANQtk2sfF-apxW4W0");