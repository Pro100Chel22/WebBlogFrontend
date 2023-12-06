import { loadPageWithoutReload, saveInitFuncAndRun, includeHTML } from './tools/loadMainContent.js';
import { RequestInfo, request, multipleRequest } from './tools/request.js';
import { getTemplate } from './tools/helpers.js';  
import { setSubscripbeListeners } from './shared/SubscripbeButtonListeners.js';
import { ADMINISTRATOR, CREAT_POST_PAGE, INTERNAL_SERVER_ERROR, NOT_FOUND_ERROR, SUBSCRIBER } from './tools/constants.js';
import { buildPostPage, insertText } from './shared/posts.js';

let tempAdminInfo;

async function init () {
    const filters = [
        { id: '#tag_input_id', param: 'tags' }, 
        { id: '#type_sort_input_id', param: 'sorting' }, 
    ];

    tempAdminInfo = await getTemplate('adminInfoTemplate');
    loadCommunity(filters);
}

function loadCommunity (filters) {
    let communityId = window.location.pathname.split('/').pop();

    if (window.myApp.tokenVerificationResult) {
        const loadCommunityInfo = (data) => {
            console.log("community get", data);
    
            if (data.status[0] === 200) {
                setCommunityInfo(data.body[0], true, data.body[1]);

                buildCommunityPage(data.body[0].isClosed && data.body[1] === null, data.body[0].id, filters);
    
                $('#community_page_id').removeClass('d-none');
            }
            else if (data.status[0] === 404) {
                includeHTML(NOT_FOUND_ERROR);
            }
            else {
                includeHTML(INTERNAL_SERVER_ERROR);
            }
        }
    
        multipleRequest(
            new RequestInfo('https://blog.kreosoft.space/api/community/' + communityId, 'GET'), 
            new RequestInfo('https://blog.kreosoft.space/api/community/' + communityId + '/role', 'GET', null, localStorage.getItem('JWTToken')), 
            loadCommunityInfo
        );
    }
    else {
        const loadCommunityInfo = (data) => {
            console.log('community get', data);
    
            if (data.status === 200) {
                setCommunityInfo(data.body);

                buildCommunityPage(data.body.isClosed, data.body.id, filters);
    
                $('#community_page_id').removeClass('d-none');
            }
            else if (data.status === 404) {
                includeHTML(NOT_FOUND_ERROR);
            }
            else {
                includeHTML(INTERNAL_SERVER_ERROR);
            }
        }
    
        request('https://blog.kreosoft.space/api/community/' + communityId, 'GET', loadCommunityInfo);
    }
}

function buildCommunityPage (isClosed, communityId, filters) {
    if (isClosed) {
        $('#community_posts_id').addClass('d-none');
        $('#pagination_footer_id').addClass('d-none');
        $('#close_group_id').removeClass('d-none');
    }
    else {
        $('#community_posts_id').removeClass('d-none');
        $('#pagination_footer_id').removeClass('d-none');
        $('#close_group_id').addClass('d-none');

        buildPostPage(filters, 'https://blog.kreosoft.space/api/community/' + communityId + '/post'); 
    }
}

function setCommunityInfo (communityInfo, isAuth = false, role = null) {
    $('#community_name_id').text(communityInfo.name);
    $('#subscribers_count_id').text(communityInfo.subscribersCount);
    $(communityInfo.isClosed ? '#community_close_id' : '#community_open_id').removeClass('d-none');

    if (communityInfo.description) {
        $('#description_text_id').text(communityInfo.description);
    }
    else {
        $('#description_conrainer_id').remove();
    }

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

        if (isAuth) {
            let writePostButton = $('#write_post_button_id');
            let subscripbeButton = $('#subscribe_button_id');
            let unsubscripbeButton = $('#unsubscribe_button_id');

            setSubscripbeListeners(subscripbeButton, unsubscripbeButton, communityInfo.id, true);

            if (role === null) {
                subscripbeButton.removeClass('d-none');
            }
            else if (role === SUBSCRIBER) {
                unsubscripbeButton.removeClass('d-none');
            }
            else if (role === ADMINISTRATOR) {
                writePostButton.removeClass('d-none');
                writePostButton.on('click', () => {
                    loadPageWithoutReload(CREAT_POST_PAGE + `?communityId=${communityInfo.id}`)
                });
            }
        }

        tempAdminInfoCloned.appendTo(adminsContainer);
    }); 
}

saveInitFuncAndRun(init);