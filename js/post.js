import { changeDateTimeFormat, getTemplate } from './tools/helpers.js';
import { includeHTML, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { request } from './tools/request.js';
import { setLikeListener } from './shared/likeButtonListeners.js';

let tempComment;
let openedSubcomments;

async function init() {
    tempComment = await getTemplate('commentTemplate');
    openedSubcomments = null;

    getPost();
}

function getPost () {
    let postId = window.location.pathname.split('/').pop();

    const loadPost = (data) => {
        console.log("post get", data);

        if (data.status === 200) {
            buildPostPage(data.body)
            $('#post_container_id').removeClass('d-none');
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

function buildPostPage (data) {
    insertPost(data);
}

function insertPost (post) {
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

    if (window.myApp.tokenVerificationResult) {
        setLikeListener($('#like_button_id'), post.likes, post.hasLike, post.id);
    }

    $('#text_post_id').text(post.description);
    $('#post_name_id').text(post.title);
    $('#post_author_id').text(post.author);
    $('#post_time_id').text(changeDateTimeFormat(post.createTime));
    $('#read_time_id').text(post.readingTime);
    $('#comments_count_id').text(post.commentsCount);
    $('#likes_count_id').text(post.likes);
    insertTags($('#tags_id'), post.tags);

    if (post.comments.length > 0) {
        $('#zero_comment_id').remove();
        post.comments.forEach(comment => {
            insertComment($('#comments_container_id'), comment, window.myApp.tokenVerificationResult);
        })
    }

    if (window.myApp.tokenVerificationResult) {
        setCommentListener(post.id);
    }
    else {
        $('#write_comment_id').remove();
    }
}

function setCommentListener (postId) {
    $('#comment_input_id').on('focus', function() {
        $(this).removeClass('is-invalid');
    });

    $('.needs-validation').on('submit', function(event) {
        event.preventDefault();

        const postComment = (data) => {
            console.log("comment post", data);

            if (data.status === 200) {
                $('#comment_input_id').val('');

                updateComments();
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
}

function insertComment (container, comment, isAuth) {
    console.log(comment);

    let cloned = tempComment.clone();

    if (comment.deleteDate) {
        let deleteDate = 'Удален ' + changeDateTimeFormat(comment.deleteDate);
        insertText (cloned, '#comment_author_id', '[Комментарий удален]', deleteDate);
        insertText (cloned, '#comment_content_id', '[Комментарий удален]', deleteDate);
    }
    else {
        insertText (cloned, '#comment_author_id', comment.author);
        insertText (cloned, '#comment_content_id', comment.content);
    }
    insertText (cloned, '#comment_time_id', changeDateTimeFormat(comment.createTime));

    if (comment.modifiedDate) {
        let modifiedDate = 'Изменен ' + changeDateTimeFormat(comment.modifiedDate);
        cloned.find('#changed_id').removeClass('d-none');
        cloned.find('#changed_id').attr('title', modifiedDate);
        cloned.find('#changed_id').removeAttr('id');
    }
    else {
        cloned.find('#changed_id').remove();
    }
    
    if (comment.subComments > 0) {
        cloned.find('#subcomments_count_id').text(comment.subComments);
        cloned.find('#subcomments_count_id').removeAttr('id');
        setOpenSubcommentsListener(cloned.find('#open_subcomments_id'), cloned.find('#suncomments_container_id'), comment.id);
    }
    else {
        cloned.find('#open_subcomments_id').remove();
        cloned.find('#suncomments_container_id').remove();
    }

    if (isAuth) {

    }
    else {
        cloned.find('#comment_answer_id').remove();
    }

    container.append(cloned);
}

function setOpenSubcommentsListener (element, container, commentId, idAuth) {
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
                    insertComment(container, comment, idAuth);
                })

                openedSubcomments = { element, container, commentId };
            }

            element.removeAttr('off');
        }
        
        request('https://blog.kreosoft.space/api/comment/' + commentId + '/tree', 'GET', getSubcomments);
    });
}

function updateComments () {
    // insertComment($('#comments_container_id'), comment, window.myApp.tokenVerificationResult);

    let postId = window.location.pathname.split('/').pop();

    if (openedSubcomments) {

    }
    else {
        const loadPost = (data) => {
            console.log("post get", data);
    
            if (data.status === 200) {
                
            }
        }
    
        request('https://blog.kreosoft.space/api/post/' + postId, 'GET', loadPost, null, localStorage.getItem('JWTToken'));
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