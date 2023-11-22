import { loadPageFromCurrentUrl, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { userIsNotAuthorized } from './index.js';
import { request } from './tools/request.js';
import { dateConvertToUTCWithSmooth } from './tools/helpers.js';
import IMask from '../node_modules/imask/esm/index.js';

function init() {
    let mask = new IMask(document.getElementById('phone_input_id'), {
        mask: "+{7} (000) 000-00-00"
    });

    const formsId = ['#name_input_id', '#birthd_input_id', '#phone_input_id', '#gender_input_id', '#email_input_id'];

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

    let userModel = window.myApp.userModel;
    const date = new Date(userModel?.birthDate);
    const formattedCurrentDate = (userModel.birthDate ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : "");
    $('#email_input_id').val(userModel.email);
    $('#name_input_id').val(userModel.fullName);
    $('#phone_input_id').val(userModel?.phoneNumber ?? "");
    $('#gender_input_id').val(userModel.gender);
    $('#birthd_input_id').val(formattedCurrentDate);
    mask.updateValue();

    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault();

            $('#server_error_mess_id').addClass('d-none');
            disableForm();

            Array.from(formsId).forEach(inputs => {
                $(inputs).parent().addClass('was-validated');
                $(inputs).removeClass('is-invalid');
            });

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
        let userModel = window.myApp.userModel;

        userModel.email = $('#email_input_id').val();
        userModel.fullName = $('#name_input_id').val();
        userModel.phoneNumber = $('#phone_input_id').val();
        userModel.gender = $('#gender_input_id').val();
        userModel.birthDate = $('#birthd_input_id').val();
    }
    else if (data.status === 400) {
        if (data.body?.errors.Email ?? false) {
            console.log(data.body.DuplicateUserName);

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

    undisableForm();
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
    $('#profile_form_id :input').prop('disabled', true);

    $('#save_button_id').addClass('d-none');
    $('#placholder_buttom_id').removeClass('d-none');
}

function undisableForm() {
    $('#profile_form_id :input').prop('disabled', false);

    $('#save_button_id').removeClass('d-none');
    $('#placholder_buttom_id').addClass('d-none');
}

saveInitFuncAndRun(init);