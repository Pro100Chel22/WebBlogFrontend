import IMask from '../../node_modules/imask/esm/index.js';

export { dateConvertToUTCWithSmooth, disableForm, undisableForm, validatedDate, onFocusValidate, validate, activateExistEmailError, diactivateExistEmailError, phoneMask, changeDateFormat }

function dateConvertToUTCWithSmooth(dateStr, dH = 0, dM = 0, dS = 0) {
    const date = new Date(dateStr);

    const currentDate = new Date(); 
    date.setHours(currentDate.getHours() - dH, currentDate.getMinutes() - dM, currentDate.getSeconds() - dS);

    return date.toISOString();
}

function disableForm(form_id, form_submit_id) {
    $(`#${form_id} :input`).prop('disabled', true);

    $(`#${form_submit_id}`).addClass('d-none');
    $('#placholder_buttom_id').removeClass('d-none');
}

function undisableForm(form_id, form_submit_id) {
    $(`#${form_id} :input`).prop('disabled', false);

    $(`#${form_submit_id}`).removeClass('d-none');
    $('#placholder_buttom_id').addClass('d-none');
}

function validatedDate (date) {
    const userDate = new Date($(date).val());
    const minDate = new Date('01.01.1901');
    const maxDate = new Date();
    
    if (userDate > maxDate) {
        const formattedCurrentDate = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`;

        $(date).val(formattedCurrentDate);
        
    } else if (userDate < minDate) {
        $(date).val('1901-01-01');
    }
}

function onFocusValidate (formsId) {
    Array.from(formsId).forEach(inputs => {
        $(inputs).on('focus', function() {
            let parent = $(this).parent();
            parent.addClass('was-validated');
        });
    });
}

function validate (formsId) {
    Array.from(formsId).forEach(inputs => {
        $(inputs).parent().addClass('was-validated');
        $(inputs).removeClass('is-invalid');
    });
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

function phoneMask(phoneInput) {
    return new IMask(phoneInput, {
        mask: "+{7} (000) 000-00-00"
    });
}

function changeDateFormat(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}