import { loadPageWithoutReload, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { buildPostPage } from './shared/posts.js';
import { CREAT_POST_PAGE } from './tools/constants.js';
import { setLink } from './tools/helpers.js';

function init() {
    if (window.myApp.tokenVerificationResult) {
        $('#write_post_button_id').removeClass('d-none'); 

        let parent = $(('#write_post_button_id')).parent();
        parent.addClass('mb-xxl-3');
    }

    setLink($('#write_post_button_id'), CREAT_POST_PAGE);

    const filters = [
        { id: '#author_input_id', param: 'author' },
        { id: '#tag_input_id', param: 'tags' }, 
        { id: '#type_sort_input_id', param: 'sorting' }, 
        { id: '#reading_time_from_input_id', param: 'min' }, 
        { id: '#reading_time_to_input_id', param: 'max' }, 
        { id: '#only_my_groups_checkbox_id', param: 'onlyMyCommunities' },
    ];

    let inputMin = $('#reading_time_from_input_id');
    let inputMax = $('#reading_time_to_input_id');

    inputMin.on('input', function () {
        setValue(inputMin, inputMax);
    });

    inputMax.on('input', function () {
        setValue(inputMax, inputMin, true);
    });

    buildPostPage(filters, 'https://blog.kreosoft.space/api/post/');
}

function setValue (inputFirst, inputSecond, isRevers) {
    if (inputFirst.val() < 0) {
        inputFirst.val(0);
    }

    if (inputSecond.val() && inputFirst.val()) {
        if (!isRevers &&  Number(inputFirst.val()) > Number(inputSecond.val())) {
            inputFirst.val(inputSecond.val());
        }
        else if (isRevers && Number(inputSecond.val()) > Number(inputFirst.val())) {
            inputFirst.val(inputSecond.val());
        }
    }

    if (inputFirst.val()) {
        inputFirst.val(Math.round(inputFirst.val()));
    }
}

saveInitFuncAndRun(init);