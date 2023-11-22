import { loadPageWithoutReload, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { userIsAuthorized, userIsNotAuthorized } from './index.js';
import { request } from './tools/request.js';

function init() {
    $('#registration_page_button_id').click(() => loadPageWithoutReload("/registration"));

    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault();
            event.stopPropagation();

            $('#server_error_mess_id').addClass('d-none');
            $('#login_failed_id').addClass('d-none'); 
            disableForm();

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

                undisableForm();
                userIsNotAuthorized();
            }
            
            const body = {
                "email": $('#email_input_id').val(), //"user4123@example.com",
                "password": $('#password_input_id').val() //"string4123"
            }
    
            request('https://blog.kreosoft.space/api/account/login', 'POST', login, body);
        }, false)
    });
}

function disableForm() {
    $('#login_form_id :input').prop('disabled', true);

    $('#login_button_id').addClass('d-none');
    $('#placholder_buttom_id').removeClass('d-none');
}

function undisableForm() {
    $('#login_form_id :input').prop('disabled', false);

    $('#login_button_id').removeClass('d-none');
    $('#placholder_buttom_id').addClass('d-none');
}

saveInitFuncAndRun(init);

// $('#login_button_id').click(() => {
        // const login = (data) => {
        //     if (data.status === 200) {
        //         localStorage.setItem('JWTToken', data.body.token);
        //         userIsAuthorized($('#email_input_id').val());
        //     }
        //     else {
        //         userIsNotAuthorized();
        //     }
        // }
        
        // const body = {
        //     "email": $('#email_input_id').val(), //"user4123@example.com",
        //     "password": $('#password_input_id').val() //"string4123"
        // }

        // request('https://blog.kreosoft.space/api/account/login', 'POST', login, body);
    // });