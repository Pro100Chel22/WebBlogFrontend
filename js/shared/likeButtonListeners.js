import { userIsNotAuthorized } from "../index.js";
import { loadPageFromCurrentUrl } from "../tools/loadMainContent.js";
import { request } from "../tools/request.js";

export { setLikeListener }

function setLikeListener (element, likesCount, hasLike, postId) {
    const setResulteChangeLike = (context, data, isSet) => {
        if(data.status === 200) {
            changeLikeOnClient(context, isSet, likesCount, hasLike, false);
        }
        else if (data.status === 401) {
            userIsNotAuthorized();
            loadPageFromCurrentUrl();
            return;
        }
        else {
            changeLikeOnClient(context, !isSet, likesCount, hasLike, false);
            bootstrap.Toast.getOrCreateInstance($('#liveToast')).show();
        }
    };

    element.on('click', function() {
        if (!$(this).attr('locked')) {
            if ($(this).attr('liked') && $(this).attr('liked') === 'true') {
                changeLikeOnClient(this, false, likesCount, hasLike);
    
                const deleteLike = (data) => {
                    window.myApp.showLogs ? console.log('like delete', data) : '';
                    setResulteChangeLike(this, data, false); 
                    $(this).removeAttr('locked');
                };
    
                request('https://blog.kreosoft.space/api/post/' + postId + '/like', 'DELETE', deleteLike, null, localStorage.getItem('JWTToken'));
            }
            else {
                changeLikeOnClient(this, true, likesCount, hasLike);
    
                const setLike = (data) => {
                    window.myApp.showLogs ? console.log('like set', data) : '';
                    setResulteChangeLike(this, data, true);
                    $(this).removeAttr('locked');
                };
    
                request('https://blog.kreosoft.space/api/post/' + postId + '/like', 'POST', setLike, null, localStorage.getItem('JWTToken'));
            }
    
            $(this).attr('locked', true);
        }
    });
    element.removeAttr('id');
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