import { loadPageWithoutReload, saveInitFuncAndRun } from './loadMainContent.js';

function init() {
    $('#registration_page_button_id').click(() => loadPageWithoutReload("/registration"));
}

saveInitFuncAndRun(init);