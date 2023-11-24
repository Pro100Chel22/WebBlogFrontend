import { loadPageWithoutReload, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { userIsAuthorized, userIsNotAuthorized } from './index.js';
import { request } from './tools/request.js';
import { disableForm, undisableForm } from './tools/helpers.js';

function init() {
    if (window.myApp.tokenVerificationResult) {
        $('#write_post_button_id').removeClass('d-none'); 

        let parent = $(('#write_post_button_id')).parent();
        parent.addClass('mb-xxl-3');
    }
}

saveInitFuncAndRun(init);