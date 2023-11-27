import { loadPageWithoutReload, loadPageFromCurrentUrl,  saveInitFuncAndRun, includeHTML } from './tools/loadMainContent.js';
import { userIsNotAuthorized } from './index.js';
import { RequestInfo, request, multipleRequest } from './tools/request.js';
import { changeDateTimeFormat, parseQeuryParams, buildNumerationPage } from './tools/helpers.js';  

let tempAdminInfo;

function init () {
    tempAdminInfo = getTemp($('#temp_admin_id'));

    loadCommunity();
}

function getTemp (element) {
    let cloned = element.clone();
    cloned.removeClass('d-none');
    cloned.removeAttr('id');
    element.remove();
    return cloned;
}

function loadCommunity () {
    let communityId = window.location.pathname.split('/').pop();

    

    if (window.myApp.tokenVerificationResult) {
        // const loadCommunityInfo = (data) => {
        //     console.log("community get", data);
    
        //     if (data.status[0] === 200) {
        //         setCommunityInfo(data.body[0]);
    
        //         $('#community_page_id').removeClass('d-none');
        //     }
        //     else {
        //         includeHTML("error.html");
        //     }
        // }
    
        // multipleRequest(
        //     new RequestInfo('https://blog.kreosoft.space/api/community/' + communityId, 'GET'), 
        //     new RequestInfo('https://blog.kreosoft.space/api/community/' + communityId + '/role', 'GET', null, localStorage.getItem('JWTToken')), 
        //     loadCommunityInfo
        // );
    }
    else {
        const loadCommunityInfo = (data) => {
            console.log('community get', data);
    
            if (data.status === 200) {
                setCommunityInfo(data.body);

                buildCommunityPage(data.body.isClosed);
    
                $('#community_page_id').removeClass('d-none');
            }
            else {
                includeHTML("error.html");
            }
        }
    
        request('https://blog.kreosoft.space/api/community/' + communityId, 'GET', loadCommunityInfo);
    }
}

function buildCommunityPage (isClosed) {
    if (isClosed) {
        $('#community_posts_id').addClass('d-none');
        $('#pagination_footer_id').addClass('d-none');
        $('#close_group_id').removeClass('d-none');
    }
    else {
        $('#community_posts_id').removeClass('d-none');
        $('#pagination_footer_id').removeClass('d-none');
        $('#close_group_id').addClass('d-none');
    }
}

function setCommunityInfo (communityInfo) {
    $('#community_name_id').text(communityInfo.name);
    $('#subscribers_count_id').text(communityInfo.subscribersCount);
    $(communityInfo.isClosed ? '#community_close_id' : '#community_open_id').removeClass('d-none');

    let adminsContainer = $('#admins_container_id');
    Array.from(communityInfo.administrators).forEach((administrator, index) => {
        let tempAdminInfoCloned = tempAdminInfo.clone();

        insertText(tempAdminInfoCloned, '#admin_name_id', administrator.fullName);
        let image = tempAdminInfoCloned.find('#admin_image_id');
        image.attr('src', administrator.gender === 'Male' ? '/img/man.png' : '/img/female.png');
        image.removeAttr('id');

        if (index > 0) {
            let border = $('<hr>', {
                'class': 'my-2'
            });

            border.appendTo(adminsContainer);
        }

        tempAdminInfoCloned.appendTo(adminsContainer);
    }); 
}

function insertText (element, elementId, text) {
    let content = element.find(elementId);
    content.text(text);
    content.removeAttr('id');
    return content;
}

saveInitFuncAndRun(init);