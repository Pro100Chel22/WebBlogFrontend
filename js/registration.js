import { loadPageWithoutReload, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { userIsAuthorized, userIsNotAuthorized } from './index.js';
import { request } from './tools/request.js';
import IMask from '../node_modules/imask/esm/index.js';

function init() {
    new IMask(document.getElementById('phone_input_id'), {
        mask: "+{7} (000) 000-00-00"
    });

    const formsId = ['#name_input_id', '#birthd_input_id', '#phone_input_id', '#gender_input_id', '#email_input_id', '#password_input_id'];

    Array.from(formsId).forEach(inputs => {
        $(inputs).on('focus', function() {
            let parent = $(this).parent();
            parent.addClass('was-validated');
        });
    });

    $('#birthd_input_id').on('input', function() {
        const userDate = new Date($('#birthd_input_id').val());
        const minDate = new Date('01.01.1901');
        const maxDate = new Date();

        if (userDate > maxDate) {
            const formattedCurrentDate = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`;

            $('#birthd_input_id').val(formattedCurrentDate);
            
        } else if (userDate < minDate) {
            $('#birthd_input_id').val('1901-01-01');
        }
    });

    $('#email_input_id').on('focus', () => diactivateExistEmailError());

    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault();
            event.stopPropagation();

            $('#server_error_mess_id').addClass('d-none');
            disableForm();

            Array.from(formsId).forEach(inputs => {
                $(inputs).parent().addClass('was-validated');
                $(inputs).removeClass('is-invalid');
            });

            const body = {
                "fullName": $('#name_input_id').val(),
                "password": $('#password_input_id').val(),
                "email": $('#email_input_id').val(),
                "birthDate": $('#birthd_input_id').val().length !== 0 ? dateConvertToUTCWithSmooth($('#birthd_input_id').val(), 1) : null,
                "gender": $('#gender_input_id').val(),
                "phoneNumber": $('#phone_input_id').val().length !== 0 ? $('#phone_input_id').val() : null
            }

            request('https://blog.kreosoft.space/api/account/register', 'POST', login, body);
            
        }, false)
    });
}

function login (data) {
    console.log(data);
    if (data.status === 200) {
        localStorage.setItem('JWTToken', data.body.token);
        userIsAuthorized($('#email_input_id').val());

        loadPageWithoutReload("/");
        return;
    }
    else if (data.status === 400) {
        if (data.body?.DuplicateUserName ?? false) {
            console.log(data.body.DuplicateUserName);

            let parent = $('#email_input_id').parent();
            parent.removeClass('was-validated');

            activateExistEmailError();
        }   
    }
    else {
        $('#server_error_mess_id').removeClass('d-none'); 
    }

    undisableForm();
    userIsNotAuthorized();
}

function activateExistEmailError() {
    $('#email_input_id').addClass('is-invalid');
    $('#email_incorrect_id').addClass('d-none');
    $('#email_exist_id').removeClass('d-none'); 
}

function diactivateExistEmailError() {
    $('#email_input_id').removeClass('is-invalid');
    $('#email_incorrect_id').removeClass('d-none');
    $('#email_exist_id').addClass('d-none');
}

function disableForm() {
    $('#registration_form_id :input').prop('disabled', true);

    $('#registration_buttom_id').addClass('d-none');
    $('#placholder_buttom_id').removeClass('d-none');
}

function undisableForm() {
    $('#registration_form_id :input').prop('disabled', false);

    $('#registration_buttom_id').removeClass('d-none');
    $('#placholder_buttom_id').addClass('d-none');
}

function dateConvertToUTCWithSmooth(dateStr, dH = 0, dM = 0, dS = 0) {
    const date = new Date(dateStr);

    const currentDate = new Date(); 
    date.setHours(currentDate.getHours() - dH, currentDate.getMinutes() - dM, currentDate.getSeconds() - dS);

    return date.toISOString();
}

saveInitFuncAndRun(init);