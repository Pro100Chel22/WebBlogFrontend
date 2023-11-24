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

    const filersId = ['#author_input_id', '#tag_input_id', '#type_sort_input_id', '#reading_time_from_input_id', '#reading_time_to_input_id', '#only_my_groups_checkbox_id'];

    getPosts();
    getTags(filersId);
}

function getPosts () {
    const loadPosts = (data) => {
        console.log("posts get", data);

        if (data.status === 200) {
            $('#post_placeholder_id').addClass('d-none');
            
            let tempPost = $('#templ_post_id');
            let tempPostCloned = tempPost.clone();
            tempPost.remove();
            tempPostCloned.removeClass('d-none');
            tempPostCloned.removeAttr('id');
            
            let postsContainer = $('#posts_container_id');

            // let tempImage = $('#temp_image_id');
            // let tempImageCloned = tempImage.clone();
            // tempImage.remove();
            // tempImageCloned.removeAttr('id');

            // // post_author_id post_time_id community_name_id 
            // // post_name_id
            // // text_post_id
            // tags_id
            // // read_time_id
            // // comments_count_id likes_count_id
            Array.from(data.body.posts).forEach(post => {
                let cloned = tempPostCloned.clone();

                insertText(cloned, '#post_author_id', post.author);
                insertText(cloned, '#post_time_id', post.createTime);

                if (post.communityName !== null) {
                    insertText(cloned, '#community_name_id', post.communityName);
                }
                else {
                    let postCommunity = cloned.find('#comments_text_id');
                    postCommunity.remove();
                }

                insertText(cloned, '#post_name_id', post.title);

                if (post.image !== null) {
                    let image = cloned.find('#image_id');
                    image.attr('src', post.image);

                    let imageContainer = cloned.find('#image_container_id');
                    imageContainer.removeAttr('id');
                }
                else {
                    let imageContainer = cloned.find('#image_container_id');
                    imageContainer.remove();
                }

                insertText(cloned, '#text_post_id', post.description);


                insertText(cloned, '#read_time_id', post.readingTime);

                insertText(cloned, '#comments_count_id', post.commentsCount);
                insertText(cloned, '#likes_count_id', post.likes);

                cloned.appendTo(postsContainer);
            });
        }
    }

    request('https://blog.kreosoft.space/api/post', 'GET', loadPosts);
}

function insertText (element, elementId, text) {
    let postContent = element.find(elementId);
    postContent.text(text);
    postContent.removeAttr('id');
}

// commentsCount
// : 
// 0
// createTime
// : 
// "2023-11-24T23:05:53.0825885"
// description
// : 
// "string"
// hasLike
// : 
// false
// id
// : 
// "059f1304-f16e-4377-6561-08dbed073c06"
// image
// : 
// "https://stryda.gg/_next/image?url=https%3A%2F%2Fwww.datocms-assets.com%2F92583%2F1688460399-valorant-agent-jett.png&w=1280&q=75"

function getTags (filersId) {
    const loadTags = (data) => {
        console.log("tags get", data);

        if (data.status === 200) {
            Array.from(data.body).forEach(tag => {
                $('#tag_input_id').append($('<option>', {
                    value: tag.id,
                    text: tag.name
                }));
            });
        }

        offInputPlaceholders(filersId); 
    }

    request('https://blog.kreosoft.space/api/tag', 'GET', loadTags);
}

function offInputPlaceholders (filersId) {
    $('.needs-off').addClass('d-none');;
    
    Array.from(filersId).forEach(inputs => {
        $(inputs).removeClass('d-none');
    });

    $(`#apply_button_id`).prop('disabled', false);
}

saveInitFuncAndRun(init);