import { changeDateTimeFormat, getTemplate, getUserId } from './tools/helpers.js';
import { includeHTML, loadPageFromCurrentUrl, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { RequestInfo, multipleRequest, request } from './tools/request.js';
import { setLikeListener } from './shared/likeButtonListeners.js';
import { userIsNotAuthorized } from './index.js';

let tempComment;
let tempCommentsNotFound;
let openedSubcomments;

async function init() {
    tempComment = await getTemplate('commentTemplate');
    tempCommentsNotFound = await getTemplate('commentNotFoundTemplate');
    openedSubcomments = null;

    getPost();
}

function getPost () {
    let postId = window.location.pathname.split('/').pop();

    const loadPost = (data) => {
        console.log("post get", data);

        if (data.status === 200) {
            insertPost(data.body);
        }
        else if (data.status === 401) {
            includeHTML('unauthorized.html');
        }
        else if (data.status === 403) {
            includeHTML('forbidden.html');
        }
        else if (data.status === 404) {
            includeHTML('notFound.html');
        }
        else {
            includeHTML('internalServerError.html');
        }
    }

    request('https://blog.kreosoft.space/api/post/' + postId, 'GET', loadPost, null, window.myApp.tokenVerificationResult ? localStorage.getItem('JWTToken') : null);
}

async function insertPost (post) {
    if (post.communityName !== null) {
        $('#community_name_id').text(post.communityName);
    }
    else {
        $('#comments_text_id').remove();
    }

    if (post.image !== null) {
        $('#image_id').attr('src', post.image);
    }
    else {
        $('#image_container_id').remove();
    }

    if (post.hasLike) {
        let likeIcon = $('#like_button_id').children().last();
        likeIcon.attr('fill', 'red');
        likeIcon.attr('stroke', 'red');
        $('#like_button_id').attr('liked', 'true');
    }

    if (post.addressId) {
        const loadAddress = (data) => {
            console.log("address get", data);
    
            let str = "";
            data.body.forEach(addr => {
                str += addr.text + ', ';
            });
    
            $('#address_id').text(str.slice(0, str.length - 2));
        }
    
        await request('https://blog.kreosoft.space/api/address/chain?objectGuid=' + post.addressId, 'GET', loadAddress);
    }
    else {
        $('#address_container_id').remove();
    }
    
    $('#text_post_id').text(post.description);
    $('#post_name_id').text(post.title);
    $('#post_author_id').text(post.author);
    $('#post_time_id').text(changeDateTimeFormat(post.createTime));
    $('#read_time_id').text(post.readingTime);
    $('#comments_count_id').text(post.commentsCount);
    $('#likes_count_id').text(post.likes);
    insertTags($('#tags_id'), post.tags);

    let userId = null;
    if (window.myApp.tokenVerificationResult) {
        setLikeListener($('#like_button_id'), post.likes, post.hasLike, post.id);
        userId = getUserId(localStorage.getItem('JWTToken'));   
    }

    if (post.comments.length > 0) {
        post.comments.forEach(comment => {
            insertComment($('#comments_container_id'), comment, post.id, userId, false);
        })
    }
    else {
        $('#comments_container_id').append(tempCommentsNotFound.clone());
    }

    if (window.myApp.tokenVerificationResult) {
        setCommentListener(post.id);
    }
    else {
        $('#write_post_comment_id').remove();
    }

    $('#post_container_id').removeClass('d-none');

    const hash = window.location.hash;
    if (hash && hash === '#comments') {
        const targetElement = $('#comments_id');
        if (targetElement) {
            $('html, body').animate({
                scrollTop: targetElement.offset().top + 300
            }, 1000); 
        }
    }
}

function setCommentListener (postId) {
    $('#comment_input_id').on('focus', function() {
        $(this).removeClass('is-invalid');
    });

    $('.needs-validation').on('submit', function(event) {
        event.preventDefault();

        if (!$('#comment_input_id').val() || $('#comment_input_id').val().length < 0 || $('#comment_input_id').val().length > 1000) {
            $('#comment_input_id').addClass('is-invalid');
            return;
        }

        const postComment = (data) => {
            console.log("comment post", data);

            if (data.status === 200) {
                $('#comment_input_id').val('');

                updateComments();
            }
            else if (data.status === 401) {
                userIsNotAuthorized();
                loadPageFromCurrentUrl();
                return;
            }
            else {
                $('#server_error_mess_id').removeClass('d-none');
            }

            $('#save_button_id').removeClass('d-none');
            $('#placholder_buttom_id').addClass('d-none');
        }
        
        const body = {
            "content": $('#comment_input_id').val()
        }

        $('#save_button_id').addClass('d-none');
        $('#placholder_buttom_id').removeClass('d-none');

        request('https://blog.kreosoft.space/api/post/' + postId + '/comment', 'POST', postComment, body, localStorage.getItem('JWTToken'));
    });

    $('#comment_input_id').on('focus', function () {
        $('#comment_input_id').removeClass('is-invalid');
        $('#server_error_mess_id').addClass('d-none');
    });
}

function insertComment (container, comment, postId, userId = null, isSubcomment = true) {
    let cloned = tempComment.clone();

    if (userId) {
        if (userId === comment.authorId) {
            if (!comment.deleteDate) {
                setEditButton(
                    cloned.find('.edit'), 
                    cloned.find('.delete'), 
                    cloned.find('#comment_content_id'), 
                    cloned.find('#edit_comment_id'), 
                    cloned.find('#edit_comment_input_id'),
                    cloned.find('#edit_button_id'),
                    cloned.find('#placholder_edit_id'),
                    cloned.find('#server_error_submess_id'), 
                    comment.id
                    ); 
            }
            else {
                cloned.find('.edit').remove();
            }
            
            setDeleteButton(cloned.find('.delete'), cloned.find('#server_error_delete_id'), comment.id); 
        }
        
        setAnswerButton(
            cloned.find('#comment_answer_id'),
            cloned.find('#write_comment_id'), 
            cloned.find('#comment_answer_input_id'), 
            cloned.find('#buttom_post_comment_id'), 
            cloned.find('#placholder_id'),
            cloned.find('#server_error_submess_id'),
            postId,
            comment.id,
            isSubcomment
        );
    }
    else {
        cloned.find('#comment_answer_id').remove();
    }

    if (comment.deleteDate) {
        let deleteDate = 'Удален ' + changeDateTimeFormat(comment.deleteDate);
        insertText (cloned, '#comment_author_id', '[Комментарий удален]', deleteDate);
        insertText (cloned, '#comment_content_id', '[Комментарий удален]', deleteDate);
    }
    else {
        insertText (cloned, '#comment_author_id', comment.author);
        insertText (cloned, '#comment_content_id', comment.content);
    }
    insertText(cloned, '#comment_time_id', changeDateTimeFormat(comment.createTime));

    if (comment.modifiedDate && comment.deleteDate === null) {
        let modifiedDate = 'Изменен ' + changeDateTimeFormat(comment.modifiedDate);
        cloned.find('#changed_id').removeClass('d-none');
        cloned.find('#changed_id').attr('title', modifiedDate);
        cloned.find('#changed_id').removeAttr('id');
    }
    else {
        cloned.find('#changed_id').remove();
    }
    
    if (comment.subComments > 0) {
        setOpenSubcommentsListener(cloned.find('#open_subcomments_id'), cloned.find('#suncomments_container_id'), comment.id, postId, userId);
    }
    else {
        cloned.find('#open_subcomments_id').remove();
        cloned.find('#suncomments_container_id').remove();
    }

    container.append(cloned);

    return cloned;
}

function setEditButton (editElement, deleteElement, content, edit, editInput, editButton, placeholder, serverError, commentId) {
    editElement.removeClass('d-none');

    editElement.on('click', function () {
        editElement.addClass('d-none');
        deleteElement.addClass('d-none');

        content.addClass('d-none');
        edit.removeClass('d-none');

        editInput.attr('value', content.text());
    });

    edit.on('submit', function (event) {
        event.preventDefault();

        if (!editInput.val() || editInput.val().length < 0 || editInput.val().length > 1000) {
            editInput.addClass('is-invalid');
            return;
        }

        editButton.addClass('d-none');
        placeholder.removeClass('d-none');
        editInput.prop('disabled', true);

        let editComment = (data) => {
            console.log('comment edit', data);

            if (data.status === 200) {
                updateComments();
            }
            else if (data.status === 401) {
                userIsNotAuthorized();
                loadPageFromCurrentUrl();
                return;
            }
            else {
                editButton.removeClass('d-none');
                placeholder.addClass('d-none');
                editInput.prop('disabled', false);

                serverError.removeClass('d-none');
            }
        }

        const body = {
            "content": editInput.val()
        }

        request('https://blog.kreosoft.space/api/comment/' + commentId, 'PUT', editComment, body, localStorage.getItem('JWTToken'));
    });

    editInput.on('focus', function () {
        editInput.removeClass('is-invalid');
        serverError.addClass('d-none');
    });
}

function setDeleteButton (element, serverError, commentId) {
    element.removeClass('d-none');

    element.on('click', function () {
        if (element.attr('locked')) {
            return;
        }

        element.attr('locked', true);

        let deleteComment = (data) => {
            console.log('comment delete', data);
            
            if (data.status === 200) {
                if (openedSubcomments && commentId === openedSubcomments.commentId && 
                    (!openedSubcomments.container || openedSubcomments.container.children().length < 1)) {
                    openedSubcomments = null;
                }

                updateComments();
                return;
            }
            else if (data.status === 401) {
                userIsNotAuthorized();
                loadPageFromCurrentUrl();
                return;
            }
            else {
                serverError.removeClass('d-none');
            }

            element.removeAttr('locked');
        }

        request('https://blog.kreosoft.space/api/comment/' + commentId, 'DELETE', deleteComment, null, localStorage.getItem('JWTToken'));
    });
}

function setAnswerButton (button, container, input, postButton, placeholderButton, serverError, postId, parentId, isSubcomment = true) {
    button.removeAttr('id');
    container.removeAttr('id');
    input.removeAttr('id');
    postButton.removeAttr('id');
    placeholderButton.removeAttr('id');
    serverError.removeAttr('id');

    button.on('click', function () {
        button.addClass('d-none');
        container.removeClass('d-none');
    });

    container.on('submit', function (event) {
        event.preventDefault();

        if (!input.val() || input.val().length < 0 || input.val().length > 1000) {
            input.addClass('is-invalid');
            return;
        }

        input.prop('disabled', true);
        postButton.addClass('d-none');
        placeholderButton.removeClass('d-none');

        const postComment = (data) => {
            console.log("comment post", data);

            if (data.status === 200) {
                if (!isSubcomment) {
                    openedSubcomments = { element: null, container: null, commentId: parentId };
                }

                updateComments();
            }
            else if (data.status === 401) {
                userIsNotAuthorized();
                loadPageFromCurrentUrl();
                return;
            }
            else {
                input.prop('disabled', false);
                postButton.removeClass('d-none');
                placeholderButton.addClass('d-none');

                serverError.removeClass('d-none');
            }
        }
        
        const body = {
            "content": input.val(),
            "parentId": parentId
        }

        request('https://blog.kreosoft.space/api/post/' + postId + '/comment', 'POST', postComment, body, localStorage.getItem('JWTToken'));
    });

    input.on('focus', function () {
        input.removeClass('is-invalid');
        serverError.addClass('d-none');
    });
}

function setOpenSubcommentsListener (element, container, commentId, postId, userId = null) {
    element.removeAttr('id');
    container.removeAttr('id');

    element.on('click', function () {
        if (element.attr('off')) {
            return;
        }

        if (openedSubcomments) {
            openedSubcomments.container.empty();
            openedSubcomments.element.removeClass('d-none');
        }

        element.attr('off', true);

        const getSubcomments = (data) => {
            console.log("subcomments get", data);

            if (data.status === 200) {
                $(element).addClass('d-none');

                data.body.forEach(comment => {
                    comment.subComments = 0;
                    insertComment(container, comment, postId, userId);
                })


                openedSubcomments = { element, container, commentId };
            }

            element.removeAttr('off');
        }
        
        request('https://blog.kreosoft.space/api/comment/' + commentId + '/tree', 'GET', getSubcomments);
    });
}

function updateComments () {
    let postId = window.location.pathname.split('/').pop();
    let userId = getUserId(localStorage.getItem('JWTToken'));

    if (openedSubcomments) {
        const loadComments = (data) => {
            console.log("subcomment get", data);

            if (data.status[0] === 401) {
                userIsNotAuthorized();
                loadPageFromCurrentUrl();
                return;
            }

            if (data.status[0] === 200) {
                $('#comments_container_id').empty();

                if (data.body[0].comments.length > 0) {
                    data.body[0].comments.forEach(comment => {
                        let commentObj = insertComment($('#comments_container_id'), comment, postId, userId, false);
                        
                        if (comment.id === openedSubcomments.commentId) {
                            openedSubcomments.element = $(commentObj.find('.openSubcomment')[0]);
                            openedSubcomments.container = $(commentObj.find('.subcommentContainer')[0]);
                        }
                    }); 
                }
                else {
                    $('#comments_container_id').append(tempCommentsNotFound.clone());
                }
                
                $('#comments_count_id').text(data.body[0].commentsCount);
            }

            if (data.status[0] === 200 && data.status[1] === 200) {
                openedSubcomments.element.addClass('d-none');

                data.body[1].forEach(comment => {
                    comment.subComments = 0;
                    insertComment(openedSubcomments.container, comment, postId, userId);
                })
            }
        }
        
        multipleRequest( 
            new RequestInfo('https://blog.kreosoft.space/api/post/' + postId, 'GET', null, localStorage.getItem('JWTToken')), 
            new RequestInfo('https://blog.kreosoft.space/api/comment/' + openedSubcomments.commentId + '/tree', 'GET'), 
            loadComments
        );
    }
    else {
        const loadComments = (data) => {
            console.log("comment get", data);
    
            if (data.status === 200) {
                $('#comments_container_id').empty();

                if (data.body.comments.length > 0) {
                    data.body.comments.forEach(comment => {
                        insertComment($('#comments_container_id'), comment, postId, userId, false);
                    })
                }
                else {
                    $('#comments_container_id').append(tempCommentsNotFound.clone());
                }

                $('#comments_count_id').text(data.body.commentsCount);

                openedSubcomments = null;
            }
            else if (data.status === 401) {
                userIsNotAuthorized();
                loadPageFromCurrentUrl();
                return;
            }
        }
    
        request('https://blog.kreosoft.space/api/post/' + postId, 'GET', loadComments, null, localStorage.getItem('JWTToken'));
    }
}

function insertText (element, elementId, text, title = null) {
    let content = element.find(elementId);
    content.text(text);
    content.removeAttr('id');

    if (title) {
        content.attr('title', title);
    }

    return content;
}

function insertTags (tagsContainer, tags) {
    Array.from(tags).forEach(tag => {
        let spanElement = $('<span>', {
            'class': 'me-2', 
            'text': '#' + tag.name
        });
          
        tagsContainer.append(spanElement);
    });
}

saveInitFuncAndRun(init);