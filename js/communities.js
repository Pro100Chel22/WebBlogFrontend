import { loadPageWithoutReload, loadPageFromCurrentUrl, saveInitFuncAndRun, includeHTML } from './tools/loadMainContent.js';
import { userIsNotAuthorized } from './index.js';
import { RequestInfo, request, multipleRequest } from './tools/request.js';
import { INTERNAL_SERVER_ERROR, SUBSCRIBER } from './tools/constants.js';
import { setSubscripbeListeners } from './shared/SubscripbeButtonListeners.js';
import { getTemplate } from './tools/helpers.js';

let tempCommunity;
let tempCommunityNotFound;

async function init() {
    tempCommunity = await getTemplate('communityTemplate');
    tempCommunityNotFound = await getTemplate('communityNotFound');
    
    getCommunities(); 
}

function getCommunities () {
    let container = $('#communities_container_id');

    if (window.myApp.tokenVerificationResult) {
        const loadCommunities = (data) => {
            window.myApp.showLogs ? console.log("communities get auth", data) : '';
    
            container.empty();
            if (data.status[0] === 200 && data.status[1] === 200) {
                insertCommunities(container, data.body[0], data.body[1]);
            }
            else if (data.status[1] === 401) {
                userIsNotAuthorized();
                loadPageFromCurrentUrl();
                return;
            }
            else {
                includeHTML(INTERNAL_SERVER_ERROR);
            }
        }
    
        multipleRequest(
            new RequestInfo('https://blog.kreosoft.space/api/community', 'GET'), 
            new RequestInfo('https://blog.kreosoft.space/api/community/my', 'GET', null, localStorage.getItem('JWTToken')), 
            loadCommunities
        );
    }
    else {
        const loadCommunities = (data) => {
            window.myApp.showLogs ? console.log("communities get", data) : '';
            
            container.empty();
            if (data.status === 200) {
                insertCommunities(container, data.body);
            }
            else {
                includeHTML(INTERNAL_SERVER_ERROR);
            }
        }
    
        request('https://blog.kreosoft.space/api/community', 'GET', loadCommunities);
    }
}

function insertCommunities (container, communities, subscripbes = null) {
    if (communities.length <= 0) {
        tempCommunityNotFound.appendTo(container);
    }

    Array.from(communities).forEach(community => {
        let tempCommunityCloned = tempCommunity.clone();

        let communityLinkPage = '/communities/' + community.id
        let communityRef = $('<h3>', {
            html: $('<a>', {
                'class': 'communityRef',
                'href': communityLinkPage,
                text:  community.name 
            })
        });

        communityRef.on('click', function (event) {
            event.preventDefault();

            loadPageWithoutReload(communityLinkPage);
        })

        communityRef.appendTo(tempCommunityCloned.children().first());

        if (subscripbes) {
            let subscripbe = subscripbes.find(subscripbe => community.id === subscripbe.communityId);
            let buttonsContainer = tempCommunityCloned.children().last();
            let subscripbeButton = buttonsContainer.children().eq(0);
            let unsubscripbeButton = buttonsContainer.children().eq(1);

            setSubscripbeListeners(subscripbeButton, unsubscripbeButton, community.id);

            if (!subscripbe) {
                subscripbeButton.removeClass('d-none');
            }
            else if (subscripbe.role === SUBSCRIBER) { 
                unsubscripbeButton.removeClass('d-none');
            } 
        }

        tempCommunityCloned.appendTo(container);
    });
}

saveInitFuncAndRun(init);