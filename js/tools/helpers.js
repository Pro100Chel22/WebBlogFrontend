import IMask from '../../node_modules/imask/esm/index.js';

export { 
    dateConvertToUTCWithSmooth, 
    disableForm, 
    undisableForm, 
    validatedDate, 
    onFocusValidate, 
    validate, 
    activateExistEmailError, 
    diactivateExistEmailError, 
    phoneMask, 
    changeDateFormat,
    changeDateTimeFormat,
    parseQeuryParams,
    buildNumerationPage,
    getTemplate
}

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

function changeDateTimeFormat (dateString) {
    let date = new Date(dateString);

    let options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false 
    };

    return date.toLocaleString('ru-RU', options).replace(',', '');
}

function parseQeuryParams (url) {
    let params = [];
    let rightParams = true;

    let searchParams = new URLSearchParams(new URL(url).search);
    searchParams.forEach(function(value, key) {
        if (value !== null && value.length > 0) {
            const param = params.find(param => param.key === key);
            if (param) {
                param.values.push(value);
            }
            else {
                params.push({ key, values: [value] });
            }
        }
        else {
            rightParams = false;
        }
    });
    
    return { rightParams, params, search: window.location.search };
}

function buildNumerationPage (pagination, sides = 2) {
    let rightPage = Math.min(pagination.current + sides, pagination.count);
    let leftPage = Math.max(pagination.current - sides, 1);

    if (rightPage - leftPage < 2 * sides && pagination.count > 2 * sides) {
        if (pagination.current + sides > rightPage) {
            leftPage -= pagination.current + sides - rightPage;
        }
        else if (pagination.current - sides < leftPage) {
            rightPage += leftPage - pagination.current + sides; 
        }
    }
    else if (pagination.count <= 2 * sides) {
        leftPage = 1;
        rightPage = pagination.count;
    }

    return { leftPage, rightPage };
}

async function getTemplate (file) {
    let xhr = new XMLHttpRequest();
    
    xhr.open('GET', "/modules/templates/" + file + '.html', false);
    xhr.send();

    return $(xhr.responseText);
}