import { loadPageWithoutReload, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { userIsAuthorized, userIsNotAuthorized } from './index.js';
import { request } from './tools/request.js';

function init() {
    $('#registration_button_id').click(() => console.log("1111"));
}

saveInitFuncAndRun(init);