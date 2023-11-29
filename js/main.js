import { loadPageWithoutReload, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { buildPostPage } from './shared/posts.js';
import { CREAT_POST_PAGE } from './tools/constants.js';

function init() {
    if (window.myApp.tokenVerificationResult) {
        $('#write_post_button_id').removeClass('d-none'); 

        let parent = $(('#write_post_button_id')).parent();
        parent.addClass('mb-xxl-3');
    }

    $('#write_post_button_id').on('click', () => loadPageWithoutReload(CREAT_POST_PAGE))

    const filters = [
        { id: '#author_input_id', param: 'author' },
        { id: '#tag_input_id', param: 'tags' }, 
        { id: '#type_sort_input_id', param: 'sorting' }, 
        { id: '#reading_time_from_input_id', param: 'min' }, 
        { id: '#reading_time_to_input_id', param: 'max' }, 
        { id: '#only_my_groups_checkbox_id', param: 'onlyMyCommunities' },
    ];

   buildPostPage(filters, 'https://blog.kreosoft.space/api/post/');
}

saveInitFuncAndRun(init);