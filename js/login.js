import { loadPageWithoutReload, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { userIsAuthorized, userIsNotAuthorized } from './index.js';
import { request } from './tools/request.js';

function init() {
    $('#registration_page_button_id').click(() => loadPageWithoutReload("/registration"));

    $('#login_button_id').click(() => {
        const login = (data) => {
            if (data.status === 200) {
                localStorage.setItem('JWTToken', data.body.token);
                userIsAuthorized($('#email_input_id').val());
            }
            else {
                userIsNotAuthorized();
            }
        }
        
        const body = {
            "email": $('#email_input_id').val(), //"user4123@example.com",
            "password": $('#password_input_id').val() //"string4123"
        }

        request('https://blog.kreosoft.space/api/account/login', 'POST', login, body);
    });
}

saveInitFuncAndRun(init);