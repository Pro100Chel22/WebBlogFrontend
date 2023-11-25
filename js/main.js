import { loadPageWithoutReload, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { userIsAuthorized, userIsNotAuthorized } from './index.js';
import { request } from './tools/request.js';
import { disableForm, undisableForm } from './tools/helpers.js';

// если параметры не соответсвуют типу то не учитываем их

// При обновлении берем qeury из url и отправляем с ним запрос, 
// если неправильный нормер страницы то выводим об это сообщение, что такой страницы не сущуствуетp
// если ввели несуществующий тэг то говорим что его нет

// берем qeury парсим параметры, если есть одинарные параметры, которые встречаются несколько раз, то говорим что неправильные параметры

let tempPostSave = null;
let qeuryParams;

function init() {
    tempPostSave = null;

    if (window.myApp.tokenVerificationResult) {
        $('#write_post_button_id').removeClass('d-none'); 

        let parent = $(('#write_post_button_id')).parent();
        parent.addClass('mb-xxl-3');
    }

    const filersId = ['#author_input_id', '#tag_input_id', '#type_sort_input_id', '#reading_time_from_input_id', '#reading_time_to_input_id', '#only_my_groups_checkbox_id'];

    // При одновлении парсим url если параметры верные, отправляем с ними запрос
    // Если пришел 400 или 404, то говорим, что неправильные параметры
    
    // После того, как пришли тэги, то берем распаршенные параметры и вставляем их в фильтры
    // Если типы параметров неверные, игнорируем их
    
    // При нажитии на кнопку применить берем параметры из фильтров и преобразуем в qeury и отправляем с ними запрос


    qeuryParams = parseQeuryParams();
    console.log(qeuryParams);

    if (qeuryParams.rightParams) {
        getPosts(qeuryParams.search);
    }
    else {
        $('#posts_container_id').text('неправильные параметры');
    }

    getTags(filersId);
}

function parseQeuryParams () {
    // let nameParams = [
    //     { name: 'tags', multy: true }, 
    //     { name: 'author', multy: false }, 
    //     { name: 'min', multy: false }, 
    //     { name: 'max', multy: false }, 
    //     { name: 'sorting', multy: false }, 
    //     { name: 'onlyMyCommunities', multy: false },  
    //     { name: 'page', multy: false },  
    //     { name: 'size', multy: false }
    // ]

    let params = {};
    let rightParams = true;

    let searchParams = new URLSearchParams(new URL(window.location.href).search);
    searchParams.forEach(function(value, key) {
        if (value !== null && value.length > 0) {
            console.log(key, value);
            params[key] = params[key] || [];
            params[key].push(value);

            if (key !== 'tags' && params[key].length > 1) {
                rightParams = false;
            }
        }
        else {
            rightParams = false;
        }
    });

    return { rightParams, params, search: window.location.search };
}

function getPosts (search) {
    const loadPosts = (data) => {
        console.log("posts get", data);

        if (data.status === 200) {
            $('#post_placeholder_id').addClass('d-none');
            
            let tempPost = getTempPost();
            
            let postsContainer = $('#posts_container_id');
            Array.from(data.body.posts).forEach(post => {
                insertPost(tempPost, postsContainer, post);
            });
        }
    }

    request('https://blog.kreosoft.space/api/post/' + search, 'GET', loadPosts);
}

function getTempPost () {
    if (tempPostSave === null) {
        let tempPost = $('#templ_post_id');
        tempPostSave = tempPost.clone();
        tempPostSave.removeClass('d-none');
        tempPostSave.removeAttr('id');
        tempPost.remove();
    }

    return tempPostSave;
}

function insertPost (tempPost, postsContainer, post) {
    let cloned = tempPost.clone();

    if (post.communityName !== null) {
        insertText(cloned, '#community_name_id', post.communityName);
    }
    else {
        cloned.find('#comments_text_id').remove();
    }

    if (post.image !== null) {
        let image = cloned.find('#image_id');
        image.attr('src', post.image);

        cloned.find('#image_container_id').removeAttr('id');
    }
    else {
        cloned.find('#image_container_id').remove();
    }

    insertText(cloned, '#post_name_id', post.title);
    insertText(cloned, '#text_post_id', post.description);
    insertText(cloned, '#post_author_id', post.author);
    insertText(cloned, '#post_time_id', changeDateFormat(post.createTime));
    insertText(cloned, '#read_time_id', post.readingTime);
    insertText(cloned, '#comments_count_id', post.commentsCount);
    insertText(cloned, '#likes_count_id', post.likes);
    insertTags(cloned, '#tags_id', post.tags);
    
    cloned.appendTo(postsContainer);
}

function insertTags (element, tagsContainerId, tags) {
    let postContent = element.find(tagsContainerId);

    Array.from(tags).forEach(tag => {
        let spanElement = $('<span>', {
            'class': 'me-2', 
            'text': '#' + tag.name
        });
          
        postContent.append(spanElement);
    });
}

function insertText (element, elementId, text) {
    let postContent = element.find(elementId);
    postContent.text(text);
    postContent.removeAttr('id');
}

function changeDateFormat (dateString) {
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

function getTags (filersId) {
    const loadTags = (data) => {
        console.log("tags get", data);

        if (data.status === 200) {
            Array.from(data.body).forEach(tag => {
                $('#tag_input_id').append($('<option>', {
                    value: tag.id,
                    text: tag.name
                }));
            });
        }

        offInputPlaceholders(filersId); 
    }

    request('https://blog.kreosoft.space/api/tag', 'GET', loadTags);
}

function offInputPlaceholders (filersId) {
    $('.needs-off').addClass('d-none');;
    
    Array.from(filersId).forEach(inputs => {
        $(inputs).removeClass('d-none');
    });

    $(`#apply_button_id`).prop('disabled', false);
}

saveInitFuncAndRun(init);