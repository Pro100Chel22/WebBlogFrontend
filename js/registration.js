import { loadPageFromCurrentUrl, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { userIsAuthorized, userIsNotAuthorized } from './index.js';
import { request } from './tools/request.js';
import { dateConvertToUTCWithSmooth, disableForm, undisableForm, validatedDate, onFocusValidate, validate, activateExistEmailError, diactivateExistEmailError, phoneMask } from './tools/helpers.js';

function init() {
    const formsId = ['#name_input_id', '#birthd_input_id', '#phone_input_id', '#gender_input_id', '#email_input_id', '#password_input_id'];
    onFocusValidate(formsId);

    $('#birthd_input_id').on('input', () => validatedDate($('#birthd_input_id')));
    $('#email_input_id').on('focus', () => diactivateExistEmailError());
    phoneMask(document.getElementById('phone_input_id'));

    $('.needs-validation').on('submit', function(event) {
        event.preventDefault();

        $('#server_error_mess_id').addClass('d-none');
        disableForm('registration_form_id', 'registration_buttom_id');

        validate(formsId);

        registrationUser();
    });
}

function registrationUser () {
    const registration = (data) => {
        window.myApp.showLogs ? console.log("registration post", data) : '';
        
        if (data.status === 200) {
            localStorage.setItem('JWTToken', data.body.token);
            userIsAuthorized($('#email_input_id').val());
    
            loadPageFromCurrentUrl();
            return;
        }
        else if (data.status === 400) {
            if (data.body?.DuplicateUserName ?? false) {    
                let parent = $('#email_input_id').parent();
                parent.removeClass('was-validated');
    
                activateExistEmailError();
            }   
        }
        else {
            $('#server_error_mess_id').removeClass('d-none'); 
        }
    
        undisableForm('registration_form_id', 'registration_buttom_id');
        userIsNotAuthorized();
    }

    const body = {
        "fullName": $('#name_input_id').val(),
        "password": $('#password_input_id').val(),
        "email": $('#email_input_id').val(),
        "birthDate": $('#birthd_input_id').val().length !== 0 ? dateConvertToUTCWithSmooth($('#birthd_input_id').val(), 1) : null,
        "gender": $('#gender_input_id').val(),
        "phoneNumber": $('#phone_input_id').val().length !== 0 ? $('#phone_input_id').val() : null
    }

    request('https://blog.kreosoft.space/api/account/register', 'POST', registration, body);
}

saveInitFuncAndRun(init);