import { changeDateTimeFormat, getTemplate } from './tools/helpers.js';
import { includeHTML, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { request } from './tools/request.js';
import { setLikeListener } from './shared/likeButtonListeners.js';

let tempComment

async function init() {
    tempComment = await getTemplate('commentTemplate');

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
        }
        
        const body = {
            "content": $('#comment_input_id').val()
        }
    
        request('https://blog.kreosoft.space/api/post/' + postId + '/comment', 'POST', postComment, body, localStorage.getItem('JWTToken'));
    });
}

function insertComment (container, comment, isAuth) {
    console.log(comment);

    let cloned = tempComment.clone();

    //   edit_comment_input_id comment_answer_id comment_answer_input_id open_subcomments_id suncomments_container_id

    insertText (cloned, '#comment_author_id', comment.author);
    insertText (cloned, '#comment_content_id', comment.content);
    insertText (cloned, '#comment_time_id', changeDateTimeFormat(comment.createTime));

    // insertText (cloned, '#1111', comment.content);
    // insertText (cloned, '#1111', comment.content);

    container.append(cloned);

// createTime
// : 
// "2023-11-29T22:36:25.5982316"
// deleteDate
// : 
// "2023-11-29T22:41:21.6197595"
// id
// : 
// "780f3877-2228-4352-e246-08dbf0ca96f9"
// modifiedDate
// : 
// "2023-11-29T22:41:21.6199721"
// subComments
// : 
// 1
}

function insertText (element, elementId, text) {
    let content = element.find(elementId);
    content.text(text);
    content.removeAttr('id');
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