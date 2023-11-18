import { loadPageFromCurrentUrl, loadPageWithoutReload } from './loadMainContent.js';

loadPageFromCurrentUrl();

$('#logo_button_id').click(() => loadPageWithoutReload("/"));
$('#main_page_button_id').click(() => loadPageWithoutReload("/"));
$('#login_page_button_id').click(() => loadPageWithoutReload("/login"));

//localStorage.setItem('JWTToken', "eyJhbGciOiIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI1ZTY4Njg4Yi00ZmU3LTQ1NjQtNmY5ZC0wOGRiZTc4ZjAyYmIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9hdXRoZW50aWNhdGlvbiI6IjMzZTgwZGMzLWZjZGQtNGI0Yi04Y2JkLWQ3NWYwYTE0ZTZkNCIsIm5iZiI6MTcwMDMzNTQ5NSwiZXhwIjoxNzAwMzM5MDk1LCJpYXQiOjE3MDAzMzU0OTUsImlzcyI6IkJsb2cuQVBJIiwiYXVkIjoiQmxvZy5BUEkifQ.wtp3xVAaxYv19NXmnoJd5xetqiVXM_6uJFx-PLL7MCI");

$(function() {
    const userToken = localStorage.getItem('JWTToken');
    if (userToken !== null) {
        fetch('https://blog.kreosoft.space/api/account/profile', {
            method: 'GET',
            headers: {
                'accept': 'text/plain',
                'Authorization': "Bearer " + userToken
            }
        })
        .then(response => {
            if(!response.ok) {
                throw new Error();
            }

            return response.json();
        })
        .then(data => {
            $('#placeholder_id').addClass('d-none');
            $('#placeholder_login_id').addClass('d-none');
            $('#placeholder_user_email_id').removeClass('d-none');

            $('#user_email_id').text(data.email);
        })
        .catch(error => {
            $('#placeholder_id').addClass('d-none');
            $('#placeholder_login_id').removeClass('d-none');
            $('#placeholder_user_email_id').addClass('d-none');
        });
    }
});
  

// localStorage.setItem('JWTToken', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI1ZTY4Njg4Yi00ZmU3LTQ1NjQtNmY5ZC0wOGRiZTc4ZjAyYmIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9hdXRoZW50aWNhdGlvbiI6ImEwN2Q3MGRhLWEwMjctNGI1OC1iMWU3LTMwMDI3MTVlNDE2NCIsIm5iZiI6MTcwMDI0MDU2MSwiZXhwIjoxNzAwMjQ0MTYxLCJpYXQiOjE3MDAyNDA1NjEsImlzcyI6IkJsb2cuQVBJIiwiYXVkIjoiQmxvZy5BUEkifQ.6TbnBOYR8LmYtNd9LhJTP1q4UoMg8jCLDO14cyII75g");
// const userToken = localStorage.getItem('JWTToken');

// if (userToken !== null) {
//   //console.log('Токен пользователя существует:', userToken);
  
//   fetch('https://blog.kreosoft.space/api/account/profile', {
//         method: 'GET',
//         headers: {
//             'accept': 'text/plain',
//             'Authorization': "Bearer " + userToken
//     }
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }

//         return response.json();
//     })
//     .then(data => {
//         console.log(data); 

//         document.getElementById('login_id').classList.add('d-none');
//         document.getElementById('placeholder_user_email_id').classList.remove('d-none');

//         document.getElementById('user_email_id').innerHTML = data.email;
//     })
//     .catch(error => {
//         console.error('There has been a problem with your fetch operation:', error);
//     });

// } else {
//     document.getElementById('login_id').classList.remove('d-none');
//     document.getElementById('placeholder_user_email_id').classList.add('d-none');
// }