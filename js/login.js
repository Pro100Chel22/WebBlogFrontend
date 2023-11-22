import { loadPageWithoutReload, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { userIsAuthorized, userIsNotAuthorized } from './index.js';
import { request } from './tools/request.js';
import { disableForm, undisableForm } from './tools/helpers.js';

function init() {
    $('#registration_page_button_id').click(() => loadPageWithoutReload("/registration"));

    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault();
            event.stopPropagation();

            $('#server_error_mess_id').addClass('d-none');
            $('#login_failed_id').addClass('d-none'); 
            disableForm('login_form_id', 'login_button_id');

            const login = (data) => {
                console.log(data);

                if (data.status === 200) {
                    localStorage.setItem('JWTToken', data.body.token);
                    userIsAuthorized($('#email_input_id').val());

                    loadPageWithoutReload("/");
                    return;
                }
                else if (data.status === 400) {
                    $('#login_failed_id').removeClass('d-none'); 
                }
                else {
                    $('#server_error_mess_id').removeClass('d-none'); 
                }

                undisableForm('login_form_id', 'login_button_id');
                userIsNotAuthorized();
            }
            
            const body = {
                "email": $('#email_input_id').val(),
                "password": $('#password_input_id').val() 
            }
    
            request('https://blog.kreosoft.space/api/account/login', 'POST', login, body);
        }, false)
    });
}

saveInitFuncAndRun(init);