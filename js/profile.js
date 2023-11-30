import { loadPageFromCurrentUrl, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { userIsAuthorized, userIsNotAuthorized } from './index.js';
import { request } from './tools/request.js';
import { dateConvertToUTCWithSmooth, disableForm, undisableForm, validatedDate, onFocusValidate, validate, activateExistEmailError, diactivateExistEmailError, phoneMask, changeDateFormat } from './tools/helpers.js';

function init() {
    const formsId = ['#name_input_id', '#birthd_input_id', '#phone_input_id', '#gender_input_id', '#email_input_id'];
    onFocusValidate(formsId);

    $('#birthd_input_id').on('input', () => validatedDate($('#birthd_input_id')));
    $('#email_input_id').on('focus', () => diactivateExistEmailError());
    let mask = phoneMask(document.getElementById('phone_input_id'));

    putDataToForm(mask, formsId);

    $('.needs-validation').on('submit', function(event) {
        event.preventDefault();

        $('#server_error_mess_id').addClass('d-none');
        disableForm('profile_form_id', 'save_button_id');

        validate(formsId);

        putDataToServer();
    });
}

function putDataToServer () {
    const saveProfile = (data) => {
        console.log("profile put", data);
        if (data.status === 200) {
            userIsAuthorized($('#email_input_id').val());
        }
        else if (data.status === 400) {
            if (data.body?.errors?.Email ?? false) {
                let parent = $('#email_input_id').parent();
                parent.removeClass('was-validated');
    
                activateExistEmailError();
            }
        }
        else if (data.status === 401) {
            userIsNotAuthorized();
            loadPageFromCurrentUrl();
            return;
        }
        else {
            $('#server_error_mess_id').removeClass('d-none');
        }
    
        undisableForm('profile_form_id', 'save_button_id');
    }

    const body = {
        "email": $('#email_input_id').val(),
        "fullName": $('#name_input_id').val(),
        "birthDate": $('#birthd_input_id').val().length !== 0 ? dateConvertToUTCWithSmooth($('#birthd_input_id').val(), 1) : null,
        "gender": $('#gender_input_id').val(),
        "phoneNumber": $('#phone_input_id').val().length !== 0 ? $('#phone_input_id').val() : null
    }

    const userToken = localStorage.getItem('JWTToken');
    request('https://blog.kreosoft.space/api/account/profile', 'PUT', saveProfile, body, userToken);
}

function putDataToForm (mask, formsId) {
    const userToken = localStorage.getItem('JWTToken');
    const loadProfile = (data) => {
        console.log("profile get", data);
        if (data.status === 200) {
            let userModel = data.body;
            $('#email_input_id').val(userModel.email);
            $('#name_input_id').val(userModel.fullName);
            $('#phone_input_id').val(userModel?.phoneNumber ?? "");
            $('#gender_input_id').val(userModel.gender);
            $('#birthd_input_id').val(userModel.birthDate ? changeDateFormat(new Date(userModel.birthDate)) : "");
            mask.updateValue();

            offInputPlaceholders(formsId);
        }
        else if (data.status === 401) {
            userIsNotAuthorized();
            loadPageFromCurrentUrl();
        }
    }

    request('https://blog.kreosoft.space/api/account/profile', 'GET', loadProfile, null, userToken);
}

function offInputPlaceholders (formsId) {
    $('.needs-off').addClass('d-none');
    
    Array.from(formsId).forEach(inputs => {
        $(inputs).removeClass('d-none');
    });

    $(`#save_button_id`).prop('disabled', false);
}

saveInitFuncAndRun(init);