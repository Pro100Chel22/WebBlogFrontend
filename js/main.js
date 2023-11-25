import { loadPageWithoutReload, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { userIsAuthorized, userIsNotAuthorized } from './index.js';
import { request } from './tools/request.js';
import { disableForm, undisableForm } from './tools/helpers.js';

// При одновлении парсим url если параметры верные, отправляем с ними запрос
// Если пришел 400 или 404, то говорим, что неправильные параметры

// После того, как пришли тэги, то берем распаршенные параметры и вставляем их в фильтры
// Если типы параметров неверные, игнорируем их

// При нажитии на кнопку применить берем параметры из фильтров и преобразуем в qeury и отправляем с ними запрос


// Осталось:
// 1) Создать модельку для отображения неправильного url
// 2) Создать модельку для отображения того, что ничего не найдено
// 3) Добавить Пагинацию ...
// 4) Уменьшение текста, если он большой
// 5) Ставить лайки 

let tempPostSave = null;
let qeuryParams;

function init() {
    tempPostSave = null;

    if (window.myApp.tokenVerificationResult) {
        $('#write_post_button_id').removeClass('d-none'); 

        let parent = $(('#write_post_button_id')).parent();
        parent.addClass('mb-xxl-3');
    }

    const filers = [
        { id: '#author_input_id', param: 'author' },
        { id: '#tag_input_id', param: 'tags' }, 
        { id: '#type_sort_input_id', param: 'sorting' }, 
        { id: '#reading_time_from_input_id', param: 'min' }, 
        { id: '#reading_time_to_input_id', param: 'max' }, 
        { id: '#only_my_groups_checkbox_id', param: 'onlyMyCommunities' },
    ];

    setApplyButton(filers);
    getTempPost();

    qeuryParams = parseQeuryParams();

    const size = qeuryParams.params.find(param => param.key === 'size');
    if (size) {
        $('#count_posts_on_page_id').val(size.values[0]);
    }

    if (qeuryParams.rightParams) {
        getPosts(qeuryParams.search);
    }
    else {
        $('#posts_container_id').text('неправильные параметры');
    }

    getTags(filers);
}

function setApplyButton (filers) {
    $('#apply_button_id').on('click', function(event) {
        let params = new URLSearchParams();

        Array.from(filers).forEach(filerId => {
            if (filerId.id === '#only_my_groups_checkbox_id') {
                let value = $('#only_my_groups_input_id').is(':checked');
                params.append(filerId.param, value);
            }
            else {
                let value = $(filerId.id).val();
                if (value.length > 0 && !Array.isArray(value)) {
                    params.append(filerId.param, value);
                }
                else if (value.length > 0) {
                    Array.from(value).forEach(v => {
                        params.append(filerId.param, v);
                    });
                }
            }
        });

        let value = $('#count_posts_on_page_id').val();
        if (value !== '5') {
            params.append('size', value);
        }

        updatePost(params);
    });
}

function updatePost (params) {
    let queryString = '?' + params.toString();
    window.history.replaceState({}, '', '/' + queryString);
    getPosts(queryString);
}

function parseQeuryParams () {
    let params = [];
    let rightParams = true;

    let searchParams = new URLSearchParams(new URL(window.location.href).search);
    searchParams.forEach(function(value, key) {
        if (value !== null && value.length > 0) {
            const param = params.find(param => param.key === key);
            if (param) {
                param.values.push(value);
            }
            else {
                params.push({ key, values: [value] });
            }

            if (key !== 'tags' && params.values.length > 1) {
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

        resetPageButtons();

        if (data.status === 200) {
            $('#post_placeholder_id').addClass('d-none');
            
            let tempPost = getTempPost();
            
            let postsContainer = $('#posts_container_id');
            postsContainer.empty();
            Array.from(data.body.posts).forEach(post => {
                insertPost(tempPost, postsContainer, post);
            });

            creatPageButtons (data.body.pagination);
        }
        else if (data.status === 401) {
            userIsNotAuthorized();
            loadPageFromCurrentUrl();
            return;
        }
        else if (data.status === 400 || data.status === 404) {
            $('#posts_container_id').text('неправильные параметры');
        }
        else {
            $('#posts_container_id').text('неизвестная ошибка');
        }
    }

    request('https://blog.kreosoft.space/api/post/' + search, 'GET', loadPosts, null, window.myApp.tokenVerificationResult ? localStorage.getItem('JWTToken') : null);
}

function creatPageButtons (pagination) {
    setListenerOnPageButton($('#start_page_id'), 1);
    setListenerOnPageButton($('#prev_page_id'), Math.max(pagination.current - 1, 1));
    setListenerOnPageButton($('#next_page_id'), Math.min(pagination.current + 1, pagination.count));
    setListenerOnPageButton($('#end_page_id'), pagination.count);

    $('#page_placeholder_id').remove();
    let numeration = buildNumeration(pagination);
    for(let i = numeration.rightPage; i >= numeration.leftPage; i--) {
        let listItem = $('<li>', {
            'class': 'page-item reset' + (i === pagination.current? ' active' : ''),
            html: $('<a>', {
                'class': 'page-link',
                text:  i 
            })
        });

        setListenerOnPageButton(listItem.children().first(), i);

        listItem.insertAfter($('#insert_after_id'));
    }
}

function buildNumeration (pagination) {
    let sides = 2;

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

function setListenerOnPageButton (element, page) {
    let searchParams = moveToPage(page);

    element.attr('href', '?' + searchParams);
    element.on('click', function(event) {
        event.preventDefault();

        updatePost(searchParams);
    });
}

function resetPageButtons () {
    const arrowButtonId = ['#start_page_id', '#prev_page_id' , '#next_page_id', '#end_page_id'];

    Array.from(arrowButtonId).forEach(buttonId => {
        $(buttonId).removeAttr('href');
        $(buttonId).off();
    });

    $('#page_1_id').children().first().removeAttr('href');
    $('#page_1_id').children().first().off();

    $('.reset').remove();
}

function moveToPage (page) {
    let searchParams = new URLSearchParams(new URL(window.location.href).search);

    if (searchParams.has('page')) {
        searchParams.set('page', page);
    } else {
        searchParams.append('page', page);
    }
    
    return searchParams;
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

function getTags (filters) {
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
        else if (data.status === 401) {
            userIsNotAuthorized();
            loadPageFromCurrentUrl();
            return;
        }
        
        Array.from(qeuryParams.params).forEach(param => {
            const elementId = filters.find(filter => filter.param === param.key)?.id;
            if (elementId) {
                if (elementId === '#only_my_groups_checkbox_id') {
                    $('#only_my_groups_input_id').prop('checked', param.values[0] === 'true');
                }
                else {
                    $(elementId).val(param.values);
                }
            }
        });

        offInputPlaceholders(filters); 
    }

    request('https://blog.kreosoft.space/api/tag', 'GET', loadTags);
}

function offInputPlaceholders (filers) {
    $('.needs-off').addClass('d-none');;
    
    Array.from(filers).forEach(inputs => {
        $(inputs.id).removeClass('d-none');
    });

    $(`#apply_button_id`).prop('disabled', false);
}

saveInitFuncAndRun(init);