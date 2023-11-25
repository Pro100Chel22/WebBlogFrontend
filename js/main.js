import { loadPageWithoutReload, loadPageFromCurrentUrl, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { userIsNotAuthorized } from './index.js';
import { request } from './tools/request.js';
import { changeDateTimeFormat, parseQeuryParams, buildNumerationPage } from './tools/helpers.js';

// Осталось:
// 4) Уменьшение текста, если он большой
// 5) Ставить лайки 

let tempPostSave;
let notFoundSave;
let errorQeuryParamsSave;
let qeuryParams;

function init() {
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

    setPageSizeInput();
    setApplyButton(filers);
    tempPostSave = getTemp($('#templ_post_id'));
    notFoundSave = getTemp($('#not_found_id'));
    errorQeuryParamsSave = getTemp($('#error_qeury_params_id'));

    qeuryParams = parseQeuryParams(window.location.href);
    const size = qeuryParams.params.find(param => param.key === 'size');
    if (size) {
        $('#count_posts_on_page_id').val(size.values[0]);
    }

    if (qeuryParams.rightParams) {
        getPosts(qeuryParams.search);
    }
    else {
        insertElement($('#posts_container_id'), errorQeuryParamsSave);
    }

    getTags(filers);
}

function insertElement (container, element) {
    container.empty();
    element.appendTo(container);
}

function setPageSizeInput () {
    $('#count_posts_on_page_id').on('input', function() {
        let searchParams = new URLSearchParams(new URL(window.location.href).search);

        if (searchParams.has('page')) {
            searchParams.set('page', 1);
        }

        if (searchParams.has('size')) {
            searchParams.set('size', $('#count_posts_on_page_id').val());
        } else {
            searchParams.append('size', $('#count_posts_on_page_id').val());
        }

        updatePost(searchParams);
    });
}

function setApplyButton (filers) {
    $('#apply_button_id').on('click', function() {
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
                    Array.from(value).forEach(valueElement => {
                        params.append(filerId.param, valueElement);
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

function getTemp (element) {
    let cloned = element.clone();
    cloned.removeClass('d-none');
    cloned.removeAttr('id');
    element.remove();

    return cloned;
}

function updatePost (params) {
    let queryString = '?' + params.toString();
    window.history.pushState({}, '', '/' + queryString);
    getPosts(queryString);
}

function getPosts (search) {
    const loadPosts = (data) => {
        console.log("posts get", data);

        resetPageButtons();

        if (data.status === 200) {   
            if (data.body.posts.length > 0) {
                let postsContainer = $('#posts_container_id');
                postsContainer.empty();
                
                Array.from(data.body.posts).forEach(post => {
                    insertPost(tempPostSave, postsContainer, post);
                });

                window.scrollTo({ top: 0, behavior: 'smooth' });
                creatPageButtons(data.body.pagination);
            }
            else {
                insertElement($('#posts_container_id'), notFoundSave);
            }
        }
        else if (data.status === 401) {
            userIsNotAuthorized();
            loadPageFromCurrentUrl();
            return;
        }
        else if (data.status === 400 || data.status === 404) {
            insertElement($('#posts_container_id'), errorQeuryParamsSave);
        }
        else {
            insertElement($('#posts_container_id'), errorQeuryParamsSave);
        }
    }

    request('https://blog.kreosoft.space/api/post/' + search, 'GET', loadPosts, null, window.myApp.tokenVerificationResult ? localStorage.getItem('JWTToken') : null);
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

    if (post.description.length > 500) {
        let textContainet = insertText(cloned, '#text_post_id', post.description.slice(0, 500) + '...');
        cloned.find('#read_next_id').on('click', function() {
            textContainet.text(post.description);
            $(this).remove();
        });
        cloned.find('#read_next_id').removeAttr('id');
    }
    else {
        insertText(cloned, '#text_post_id', post.description);
        cloned.find('#read_next_id').remove();
    }

    insertText(cloned, '#post_name_id', post.title);
    insertText(cloned, '#post_author_id', post.author);
    insertText(cloned, '#post_time_id', changeDateTimeFormat(post.createTime));
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
    return postContent;
}

function creatPageButtons (pagination) {
    setListenerOnPageButton($('#start_page_id'), 1);
    setListenerOnPageButton($('#prev_page_id'), Math.max(pagination.current - 1, 1));
    setListenerOnPageButton($('#next_page_id'), Math.min(pagination.current + 1, pagination.count));
    setListenerOnPageButton($('#end_page_id'), pagination.count);

    $('#page_placeholder_id').remove();
    let numeration = buildNumerationPage(pagination);
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

function setListenerOnPageButton (element, page) {
    let searchParams = changePage(page);

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

function changePage (page) {
    let searchParams = new URLSearchParams(new URL(window.location.href).search);

    if (searchParams.has('page')) {
        searchParams.set('page', page);
    } else {
        searchParams.append('page', page);
    }
    
    return searchParams;
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