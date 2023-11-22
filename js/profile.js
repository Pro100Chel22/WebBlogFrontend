import { loadPageFromCurrentUrl, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { userIsNotAuthorized } from './index.js';
import { request } from './tools/request.js';
import { dateConvertToUTCWithSmooth, disableForm, undisableForm, validatedDate, onFocusValidate, validate, activateExistEmailError, diactivateExistEmailError, phoneMask, changeDateFormat } from './tools/helpers.js';

function init() {
    const formsId = ['#name_input_id', '#birthd_input_id', '#phone_input_id', '#gender_input_id', '#email_input_id'];
    onFocusValidate(formsId);

    $('#birthd_input_id').on('input', () => validatedDate($('#birthd_input_id')));
    $('#email_input_id').on('focus', () => diactivateExistEmailError());
    let mask = phoneMask(document.getElementById('phone_input_id'));

    putDataToForm();
    mask.updateValue();

    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault();

            $('#server_error_mess_id').addClass('d-none');
            disableForm('profile_form_id', 'save_button_id');

            validate(formsId);

            const body = {
                "email": $('#email_input_id').val(),
                "fullName": $('#name_input_id').val(),
                "birthDate": $('#birthd_input_id').val().length !== 0 ? dateConvertToUTCWithSmooth($('#birthd_input_id').val(), 1) : null,
                "gender": $('#gender_input_id').val(),
                "phoneNumber": $('#phone_input_id').val().length !== 0 ? $('#phone_input_id').val() : null
            }

            const userToken = localStorage.getItem('JWTToken');
            request('https://blog.kreosoft.space/api/account/profile', 'PUT', saveProfile, body, userToken);
            
        }, false)
    });
}

function saveProfile (data) {
    console.log(data);
    if (data.status === 200) {
        saveDataToApp();
    }
    else if (data.status === 400) {
        if (data.body?.errors?.Email ?? false) {
            console.log(ddata.body.errors.Email);

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

function putDataToForm () {
    let userModel = window.myApp.userModel;
    const formattedCurrentDate = (userModel.birthDate ? changeDateFormat(new Date(userModel.birthDate)) : "");
    $('#email_input_id').val(userModel.email);
    $('#name_input_id').val(userModel.fullName);
    $('#phone_input_id').val(userModel?.phoneNumber ?? "");
    $('#gender_input_id').val(userModel.gender);
    $('#birthd_input_id').val(formattedCurrentDate);
}

function saveDataToApp () {
    let userModel = window.myApp.userModel;

    userModel.email = $('#email_input_id').val();
    userModel.fullName = $('#name_input_id').val();
    userModel.phoneNumber = $('#phone_input_id').val();
    userModel.gender = $('#gender_input_id').val();
    userModel.birthDate = $('#birthd_input_id').val();
}

saveInitFuncAndRun(init);