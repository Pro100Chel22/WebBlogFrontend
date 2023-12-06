import { changeDateFormat, getTemplate, setLink } from './tools/helpers.js';
import { includeHTML, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { request } from './tools/request.js';

let tempAuthor;

async function init() {
    tempAuthor = await getTemplate('authorTemplate');

    getAuthors();
}

function getAuthors () {
    const loadAuthors = (data) => {
        console.log("authors get", data);

        if (data.status === 200) {
            let сopyAuthors = data.body.slice();

            сopyAuthors.sort((a, b) => {
                if (a.posts !== b.posts) return b.posts - a.posts;
                else return b.likes - a.likes;
            }); 
            сopyAuthors.forEach((author, index) => {
                author.place = index + 1; 
            });

            data.body.forEach((author, index)=> {
                insertAuthor(author, index !== data.body.length - 1, author.place);
            });
        }
        else {
            includeHTML('internalServerError.html');
        }
    }

    request('https://blog.kreosoft.space/api/author/list', 'GET', loadAuthors);
}

function insertAuthor (author, drawBorder, place) {
    let cloned = tempAuthor.clone();

    insertText(cloned, '#author_name_id', author.fullName);
    insertText(cloned, '#birth_date_id', author.birthDate ? changeDateFormat(new Date(author.birthDate), '.') : 'не указана'); 
    insertText(cloned, '#creat_time_id', changeDateFormat(new Date(author.created), '.')); 
    insertText(cloned, '#posts_count_id', author.posts); 
    insertText(cloned, '#likes_count_id', author.likes); 

    if (author.gender === 'Male') {
        cloned.find('#author_image_id').attr('src', '/img/man.png');
    }
    else {
        cloned.find('#author_image_id').attr('src', '/img/female.png');
    }
    cloned.find('#author_image_id').removeAttr('id');

    setTopImage(cloned, place);

    if (drawBorder) {
        cloned.children().first().addClass('border-bottom');
    }

    setLink(cloned, '/?author=' + author.fullName);
    cloned.removeAttr('id'); 

    $('#authors_container_id').append(cloned);
}

function setTopImage (element, place) {
    if (place === 1) {
        element.find('#top_image_id').attr('src', '/img/first.png');
    }
    else if (place === 2) {
        element.find('#top_image_id').attr('src', '/img/second.png');
    }
    else if (place === 3) {
        element.find('#top_image_id').attr('src', '/img/third.png');
    }
    else {
        element.find('#top_image_id').remove();
    }
}

function insertText (element, elementId, text) {
    let content = element.find(elementId);
    content.text(text);
    content.removeAttr('id');
    return content;
}

saveInitFuncAndRun(init);