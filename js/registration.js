import { loadPageWithoutReload, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { userIsAuthorized, userIsNotAuthorized } from './index.js';
import { request } from './tools/request.js';
import IMask from '../node_modules/imask/esm/index.js';
//import 'air-datepicker';
//import AirDatepicker from 'air-datepicker'
import AirDatepicker from '../node_modules/air-datepicker/index.es.js';
//import '../node_modules/air-datepicker/air-datepicker.css';

function init() {
    new IMask(document.getElementById('phone_input_id'), {
        mask: "+{7} (000) 000-00-00"
    });

    // $('#birthd_input_id').datepicker({
    //     // настройки
    //   });

    //new AirDatepicker('#birthd_input_id');

    const formsId = ['#name_input_id', '#birthd_input_id', '#phone_input_id', '#gender_input_id', '#email_input_id', '#password_input_id'];

    Array.from(formsId).forEach(inputs => {
        $(inputs).on('focus', function() {
            let parent = $(this).parent();
            parent.addClass('was-validated');
        });
    });

    $('#birthd_input_id').on('keydown input', function() {
        let birthd = $(this).val();
        if (birthd.length !== 0) {
            let parent = $(this).parent();
            parent.removeClass('was-validated');

            // $(this).addClass('is-invalid');
            // $(this).removeClass('is-valid');
        }
        else {
            let parent = $(this).parent();
            parent.addClass('was-validated');
            $(this).removeClass('is-invalid');
            $(this).removeClass('is-valid');
        }
    });

    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault();
            event.stopPropagation();

            Array.from(formsId).forEach(inputs => {
                $(inputs).parent().addClass('was-validated');
            });

            // console.log($(birthd_input_id).val().length === 0);

            const login = (data) => {
                console.log(data);
                if (data.status === 200) {
                    localStorage.setItem('JWTToken', data.body.token);
                    userIsAuthorized($('#email_input_id').val());
                }
                else {
                    userIsNotAuthorized();
                }
            }

            const body = {
                "fullName": $('#name_input_id').val(),
                "password": $('#password_input_id').val(),
                "email": $('#email_input_id').val(),
                "birthDate": null,
                "gender": $('#gender_input_id').val(),
                "phoneNumber": $('#phone_input_id').val().length !== 0 ? $('#phone_input_id').val() : null
            }
    
            request('https://blog.kreosoft.space/api/account/register', 'POST', login, body);
            
        }, false)
    });
}

saveInitFuncAndRun(init);

// повесть на Input слушатель и проверять корректность
// сохранить эти валидации
// когда нажал на дату она стала was-validted
// когда нажали на submit идет проверка всех валидаци
// если пришел отват, что неправльная дата снять с нее was-validted и поставиить is-invalid, при фокусировки снять is-invalid и поставить was-validted

// $('#birthd_input_id').on('input invalid keydown', function(event) {
        
        
        
    //     var inputValue = $(this).val();
    //     console.log(inputValue);


    
    //     var currentDate = event.target.value;
    //     console.log("Текущая дата:", event);
    //     // if(inputValue.length < 3) {
    //     //     $(this).addClass('is-invalid');
    //     //     $(this).removeClass('is-valid');
    //     // } 
    //     // else {
    //     //     $(this).removeClass('is-invalid');
    //     //     $(this).addClass('is-valid');
    //     // }
    // });


    //console.log(form);

            // if (form.checkValidity()) {
            //     // var passwordValue = $('#password_input_id').val();

            //     // if(passwordValue !== "123456") {
            //     //     $('#password_input_id').addClass('is-invalid');
            //     // }

            //     //form.classList.remove('was-validated');
            // }
            // else {
            //     console.log()
            //     //form.classList.add('was-validated');
            // }



    // $('#name_input_id').on('input focus', function() {
    //     var parent = $(this).parent();
    //     parent.addClass('was-validated');
    // });
 
    // $('#birthd_input_id').on('focus', function() {
    //     var parent = $(this).parent();
    //     parent.addClass('was-validated');
    // });

    // $('#phone_input_id').on('focus', function() {
    //     var parent = $(this).parent();
    //     parent.addClass('was-validated');
    // });

    // $('#gender_input_id').on('focus', function() {
    //     var parent = $(this).parent();
    //     parent.addClass('was-validated');
    // });
    
    // $('#email_input_id').on('focus', function() {
    //     var parent = $(this).parent();
    //     parent.addClass('was-validated');
    // });
    
    // $('#password_input_id').on('focus', function() {
    //     var parent = $(this).parent();
    //     parent.addClass('was-validated');
    // });