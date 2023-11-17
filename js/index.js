import { Router } from './router.js';

function includeHTML(file) {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', file, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById('main_container').innerHTML = xhr.responseText;
        }
    };

    xhr.send();
}

let route = Router.findFilePath(window.location.pathname);
if(route) {
    includeHTML(route.filePath);
} 
else {
    includeHTML("/modules/error.html");
}

localStorage.setItem('JWTToken', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI1ZTY4Njg4Yi00ZmU3LTQ1NjQtNmY5ZC0wOGRiZTc4ZjAyYmIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9hdXRoZW50aWNhdGlvbiI6ImEwN2Q3MGRhLWEwMjctNGI1OC1iMWU3LTMwMDI3MTVlNDE2NCIsIm5iZiI6MTcwMDI0MDU2MSwiZXhwIjoxNzAwMjQ0MTYxLCJpYXQiOjE3MDAyNDA1NjEsImlzcyI6IkJsb2cuQVBJIiwiYXVkIjoiQmxvZy5BUEkifQ.6TbnBOYR8LmYtNd9LhJTP1q4UoMg8jCLDO14cyII75g");
const userToken = localStorage.getItem('JWTToken');

if (userToken !== null) {
  console.log('Токен пользователя существует:', userToken);
  
  fetch('https://blog.kreosoft.space/api/account/profile', {
        method: 'GET',
        headers: {
            'accept': 'text/plain',
            'Authorization': "Bearer " + userToken
    }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    })
    .then(data => {
        console.log(data); 

        document.getElementById('login_id').classList.add('d-none');
        document.getElementById('placeholder_user_email_id').classList.remove('d-none');

        document.getElementById('user_email_id').innerHTML = data.email;
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });

} else {
    document.getElementById('login_id').classList.remove('d-none');
    document.getElementById('placeholder_user_email_id').classList.add('d-none');
}

