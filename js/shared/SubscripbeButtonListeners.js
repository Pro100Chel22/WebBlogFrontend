import { userIsNotAuthorized } from '../index.js';
import { loadPageFromCurrentUrl } from '../tools/loadMainContent.js';
import { request } from '../tools/request.js';

export { setSubscripbeListeners }

function setSubscripbeListeners (subscripbeButton, unsubscripbeButton, communityId, withReload = false) {
    subscripbeButton.on('click', function () {
        $(this).prop('disabled', true);
        changeSubscripbe(subscripbeButton, unsubscripbeButton, communityId, true, withReload);
    });

    unsubscripbeButton.on('click', function () {
        $(this).prop('disabled', true);
        changeSubscripbe(subscripbeButton, unsubscripbeButton, communityId, false, withReload);
    });
}

function changeSubscripbe (subscripbeButton, unsubscripbeButton, communityId, isSubscripbe, withReload) {
    let token = localStorage.getItem('JWTToken');

    const changeSub = (data, isSet) => {
        window.myApp.showLogs ? console.log("Subscripbe change, isSet:", isSet, data) : '';
        
        if (data.status === 200) {
            swapSubscripbeButton(subscripbeButton, unsubscripbeButton, isSet);

            if (withReload) {
                loadPageFromCurrentUrl();
            }
        }
        else if (data.status === 401) {
            userIsNotAuthorized();
            loadPageFromCurrentUrl();
            return;
        }
        else {
            bootstrap.Toast.getOrCreateInstance($('#liveToast')).show();
        }
        
        $(subscripbeButton).prop('disabled', false);
        $(unsubscripbeButton).prop('disabled', false);
    }
    
    if (isSubscripbe) {
        request('https://blog.kreosoft.space/api/community/' + communityId + '/subscribe', 'POST', (data) => changeSub(data, true), null, token);
    }
    else {
        request('https://blog.kreosoft.space/api/community/' + communityId + '/unsubscribe', 'DELETE', (data) => changeSub(data, false), null, token);
    }
}

function swapSubscripbeButton (subscripbeButton, unsubscripbeButton, wasSet) {
    if (wasSet) {
        $(subscripbeButton).addClass('d-none');
        $(unsubscripbeButton).removeClass('d-none');
    }
    else {
        $(subscripbeButton).removeClass('d-none');
        $(unsubscripbeButton).addClass('d-none');
    }
}