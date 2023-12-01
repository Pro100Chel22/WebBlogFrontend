import { loadPageWithoutReload, loadPageFromCurrentUrl, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { userIsAuthorized, userIsNotAuthorized } from './index.js';
import { RequestInfo, request, multipleRequest } from './tools/request.js';
import { ADMINISTRATOR, SUBSCRIBER } from './tools/constants.js';
import { setSubscripbeListeners } from './shared/SubscripbeButtonListeners.js';
import { getTemplate } from './tools/helpers.js';

let tempCommunity;

async function init() {
    tempCommunity = await getTemplate('communityTemplate');

    getCommunities();
}

function getCommunities () {
    let container = $('#communities_container_id');

    if (window.myApp.tokenVerificationResult) {
        const loadCommunities = (data) => {
            console.log("communities get auth", data);
    
            container.empty();
            if (data.status[0] === 200 && data.status[1] === 200) {
                insertCommunities(container, data.body[0], data.body[1]);
            }
            else if (data.status[1] === 401) {
                userIsNotAuthorized();
                loadPageFromCurrentUrl();
                return;
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
            console.log("communities get", data);
            
            container.empty();
            if (data.status === 200) {
                insertCommunities(container, data.body);
            }
            else {
                container.text("Произошла ошибка"); ////////////////////////////
            }
        }
    
        request('https://blog.kreosoft.space/api/community', 'GET', loadCommunities);
    }
}

function insertCommunities (container, communities, subscripbes = null) {
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

function getTemp (element) {
    let cloned = element.clone();
    cloned.removeClass('d-none');
    cloned.removeAttr('id');
    element.remove();

    return cloned;
}

saveInitFuncAndRun(init);