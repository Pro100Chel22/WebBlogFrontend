
import { loadPageWithoutReload, loadPageFromCurrentUrl, saveInitFuncAndRun } from "../tools/loadMainContent.js";
import { userIsNotAuthorized } from "../index.js";
import { request } from "../tools/request.js";
import { changeDateTimeFormat, parseQeuryParams, buildNumerationPage } from '../tools/helpers.js';  

export { getTags, getTemp, insertText, insertElement, buildPostPage }

let tempPostSave;
let notFoundSave;
let errorQeuryParamsSave;
let urlSave;

function buildPostPage (filters, url) {
    urlSave = url;

    setPageSizeInput();
    setApplyButton(filters);
    tempPostSave = getTemp($('#templ_post_id'));
    notFoundSave = getTemp($('#not_found_id'));
    errorQeuryParamsSave = getTemp($('#error_qeury_params_id'));

    let qeuryParams = parseQeuryParams(window.location.href);
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

    getTags(filters, qeuryParams);
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

function updatePost (params) {
    let queryString = '?' + params.toString();
    window.history.pushState({}, '', window.location.pathname + queryString);
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

    request(urlSave + search, 'GET', loadPosts, null, window.myApp.tokenVerificationResult ? localStorage.getItem('JWTToken') : null);
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

    if (post.hasLike) {
        let likeIcon = cloned.find('#like_button_id').children().last();
        likeIcon.attr('fill', 'red');
        likeIcon.attr('stroke', 'red');
        cloned.find('#like_button_id').attr('liked', 'true');
    }

    if (window.myApp.tokenVerificationResult) {
        setLikeListener(cloned, '#like_button_id', post.likes, post.hasLike, post.id);
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

function setLikeListener (element, likeButtonId, likesCount, hasLike, postId) {
    const setResulteChangeLike = (context, data, isSet) => {
        if(data.status === 200) {
            changeLikeOnClient(context, isSet, likesCount, hasLike, false);
        }
        else if (data.status === 401) {
            userIsNotAuthorized();
            loadPageFromCurrentUrl();
            return;
        }
        else if (data.status !== 400) {
            changeLikeOnClient(context, !isSet, likesCount, hasLike, false);
        }
    };

    element.find(likeButtonId).on('click', function() {
        if (!$(this).attr('locked')) {
            if ($(this).attr('liked') && $(this).attr('liked') === 'true') {
                changeLikeOnClient(this, false, likesCount, hasLike);
    
                const deleteLike = (data) => {
                    console.log('like delete', data);
                    setResulteChangeLike(this, data, false); 
                    $(this).removeAttr('locked');
                };
    
                request('https://blog.kreosoft.space/api/post/' + postId + '/like', 'DELETE', deleteLike, null, localStorage.getItem('JWTToken'));
            }
            else {
                changeLikeOnClient(this, true, likesCount, hasLike);
    
                const setLike = (data) => {
                    console.log('like set', data);
                    setResulteChangeLike(this, data, true);
                    $(this).removeAttr('locked');
                };
    
                request('https://blog.kreosoft.space/api/post/' + postId + '/like', 'POST', setLike, null, localStorage.getItem('JWTToken'));
            }
    
            $(this).attr('locked', true);
        }
    });
    element.find(likeButtonId).removeAttr('id');
}

function changeLikeOnClient (context, isSet, likesCount, hasLike, waitForServer = true) {
    let likes = $(context).children().first();
    let likeIcon = $(context).children().last();

    if (isSet) {
        likes.text(likesCount + (hasLike ? 0 : 1));

        likeIcon.attr('fill', 'red');
        likeIcon.attr('stroke', 'red'); 
        $(context).attr('liked', 'true');
    }
    else {
        likes.text(likesCount - (hasLike ? 1 : 0));

        likeIcon.attr('fill', 'none');
        likeIcon.attr('stroke', 'black'); 
        $(context).attr('liked', 'false');
    }

    likeIcon.attr('opacity', waitForServer ? '0.3' : '1')
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

function getTags (filters, qeuryParams) {
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

function offInputPlaceholders (filters) {
    $('.needs-off').addClass('d-none');;
    
    Array.from(filters).forEach(inputs => {
        $(inputs.id).removeClass('d-none');
    });

    $(`#apply_button_id`).prop('disabled', false);
}

function getTemp (element) {
    let cloned = element.clone();
    cloned.removeClass('d-none');
    cloned.removeAttr('id');
    element.remove();
    return cloned;
}

function insertText (element, elementId, text) {
    let content = element.find(elementId);
    content.text(text);
    content.removeAttr('id');
    return content;
}

function insertElement (container, element) {
    container.empty();
    element.appendTo(container);
}