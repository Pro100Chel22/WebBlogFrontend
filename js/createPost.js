import { includeHTML, loadPageFromCurrentUrl, loadPageWithoutReload, saveInitFuncAndRun } from './tools/loadMainContent.js';
import { RequestInfo, request, multipleRequest } from './tools/request.js';
import { ADMINISTRATOR, GAR_ADDRESS_LEVEL_ENUM, INTERNAL_SERVER_ERROR } from './tools/constants.js';
import { userIsNotAuthorized } from './index.js';
import { getTemplate, parseQeuryParams } from './tools/helpers.js';

let elementsArr;
let tempSearchElement;

async function init() {
    tempSearchElement = await getTemplate('searchTemplate');

    elementsArr = [ { container: null, input: $('#search_level_input_id'), label: null, levelId: '#level_id' } ];

    getGroupsAndTags();
}

function getGroupsAndTags () {
    const loadGroupsAndTags = (data) => {
        window.myApp.showLogs ? console.log("communities and tags get", data) : '';

        if (data.status[0] === 200 && data.status[1] === 200) {
            buildCreatPostPage (data.body[0], data.body[1])
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
        new RequestInfo('https://blog.kreosoft.space/api/tag', 'GET'), 
        new RequestInfo('https://blog.kreosoft.space/api/community/my', 'GET', null, localStorage.getItem('JWTToken')), 
        loadGroupsAndTags
    );
}

async function buildCreatPostPage (tags, groups) {
    const inputsId = [ 
        { id: '#name_input_id', attrName: 'title' },
        { id: '#read_time_input_id', attrName: 'readingTime' },
        { id: '#community_input_id', attrName: null },
        { id: '#tag_input_id', attrName: 'tags' },
        { id: '#img_link_input_id', attrName: 'image' },
        { id: '#text_input_id', attrName: 'description' },
        { id: '#search_level_input_id', attrName: 'addressId' },
    ];

    tags.forEach(tag => {
        $('#tag_input_id').append($('<option>', {
            value: tag.id,
            text: tag.name
        }));
    })

    let qeuryParams = parseQeuryParams(window.location.href);
    const communityId = qeuryParams.params.find(param => param.key === 'communityId');

    await groups.forEach(async group => {
        if (group.role === ADMINISTRATOR) {
            let loadCommunityName = (data) => {
                window.myApp.showLogs ? console.log('community info get', data) : '';

                $('#community_input_id').append($('<option>', {
                    value: data.body.id,
                    text: data.body.name,
                    'selected': ((communityId && communityId.values[0] === data.body.id) ? true : false)
                }));
            };

           await request('https://blog.kreosoft.space/api/community/' + group.communityId, 'GET', loadCommunityName); 
        }
    });

    $('#read_time_input_id').on('input', function() {
        if ($(this).val() < 0) {
            $(this).val(0);
        }
        else if ($(this).val() > 600) {
            $(this).val(600);
        }
    });

    $('.needs-off').addClass('d-none');
    inputsId.forEach(inputId => {
        $(inputId.id).removeClass('d-none');
    });
    $('#creat_post_button_id').prop('disabled', false);

    setCreatPostListener(inputsId);

    creatNextAddressLevel($('#search_level_input_id'), '0');

    $('#image_id').on('error', function() {
        $('#image_error_mess_id').removeClass('d-none');
        $('#image_container_id').addClass('d-none');
    }).on('load', function () {
        $('#image_container_id').removeClass('d-none');
        $('#image_error_mess_id').addClass('d-none');
    });

    $('#img_link_input_id').on('focus', function () {
        $('#image_error_mess_id').addClass('d-none');
    });

    $('#img_link_input_id').on('input', function () {
        if ($('#img_link_input_id').val().length > 0) {
            $('#image_id').attr('src', $('#img_link_input_id').val());
        }
        else {
            $('#image_id').removeAttr('src');
            $('#image_error_mess_id').addClass('d-none');
            $('#image_container_id').addClass('d-none');
        }
    });
}

function setCreatPostListener (inputsId) {
    inputsId.forEach(inputId => {
        $(inputId.id).on('focus', function() {
            $(this).removeClass('is-invalid');
            $('#server_error_mess_id').addClass('d-none');
        });
    })

    $('.needs-validation').on('submit', (event) => {
        event.preventDefault();

        let body = {};

        inputsId.forEach(inputId => {
            if (inputId.id === '#search_level_input_id') {
                let value = getAddressGuid();
                if (value) {
                    body[inputId.attrName] = value;
                }
            }
            else if (inputId.id !== '#community_input_id') {
                let value = $(inputId.id).val()
                if (value.length > 0) {
                    body[inputId.attrName] = value;
                }
            }
        })

        if (!checkData(body)) {
            return;
        }

        let communityId = $('#community_input_id').val() !== '-1' ? $('#community_input_id').val() : '-1';

        const createPost = (data) => {
            window.myApp.showLogs ? console.log("post create post", communityId, data) : '';

            if (data.status === 200) {
                loadPageWithoutReload('/post/' + data.body);
            }
            else if (data.status === 400) {
                if (data.body?.errors?.Image ?? false) {
                    $('#img_link_input_id').addClass('is-invalid');
                }
            }
            else {
                $('#server_error_mess_id').removeClass('d-none');
            }
        }
    
        if (communityId === '-1') {
            request('https://blog.kreosoft.space/api/post', 'POST', createPost, body, localStorage.getItem('JWTToken'));
        }
        else {
            request('https://blog.kreosoft.space/api/community/' + communityId + '/post', 'POST', createPost, body, localStorage.getItem('JWTToken'));
        }
    });
}

function checkData(body) {
    let isCorrect = true;

    if (body.title.length < 5) {
        $('#name_input_id').addClass('is-invalid');
        isCorrect = false;
    }

    if (body.description.length < 5) {
        $('#text_input_id').addClass('is-invalid');
        isCorrect = false;
    }

    return isCorrect;
}

function getAddressGuid () {
    let addressGuid = null;

    for (let i = elementsArr.length - 1; i >= 0; i--) {
        if (elementsArr[i].input.val() !== '-1') {
            addressGuid = elementsArr[i].input.val().split('_')[1];
            break;
        }
    }
    
    return addressGuid;
}

function creatNextAddressLevel(element, parentId, elementLevel = 0) {
    let dynamicUrl = 'https://blog.kreosoft.space/api/address/search';

    element.select2({
        ajax: {
            url: function(params) {
                const selectedValue = params.term ?? '';
                return dynamicUrl + `?query=${selectedValue}&&parentObjectId=${parentId}`;
            },
            dataType: 'json',
            delay: 500,
            processResults: function(data) {
                window.myApp.showLogs ? console.log('ajax', data) : '';

                const formattedResults = data.map(item => {
                    return ({
                        id: `${item.objectId}_${item.objectGuid}`,
                        type: item.objectLevel,
                        text: item.text
                    });
                });

                formattedResults.unshift({
                    id: `-1`,
                    text: 'Не выбрано'
                });

                return { results: formattedResults };
            },
            cache: true
        },
        width: '100%'
    });

    const onSelect = (event, level) => {
        let search = event.params.data;

        deleteElementAfter(level);

        if (level > 0) {
            updateLable(elementsArr.at(-1).label, search.id !== '-1' ? [search.type] : []);
        }

        if (search.id !== '-1' && search.type !== 'Building') { 
            const getAddress = (data) => {
                window.myApp.showLogs ? console.log("address get", data, search) : '';
        
                if (data.status === 200 && data.body.length > 0) {
                    let searchElements = creatSearchElements(level + 1);  

                    searchElements.searchContainer.insertAfter($(elementsArr.at(-1).levelId));

                    elementsArr.push({ 
                        container: searchElements.searchContainer, 
                        input: searchElements.select, 
                        label: searchElements.selectLabel, 
                        levelId: `#${level + 1}_level_id` 
                    });

                    creatNextAddressLevel(searchElements.select, search.id.split('_')[0], level + 1);
                }
            }
            
            request('https://blog.kreosoft.space/api/address/search?parentObjectId=' +  search.id.split('_')[0], 'GET', getAddress);
        }
    }

    element.on('select2:select', (event) => onSelect(event, elementLevel));
}

function updateLable (label, levelTypes) {
    let labelText = ''; 
    levelTypes.forEach((type, index) => {
        labelText += (index > 0 ? ', ' : '') + GAR_ADDRESS_LEVEL_ENUM[type];
    })

    label.text(labelText.length > 0 ? labelText : 'Следующий элемент адреса');
}

function creatSearchElements (level) {
    let searchContainer = tempSearchElement.clone();

    let selectLabel = searchContainer.children().first();
    let select = searchContainer.children().last();

    searchContainer.prop('id', `${level}_level_id`);

    return { selectLabel, select, searchContainer };
}

function deleteElementAfter (index) {
    for (let i = elementsArr.length - 1; i > index; i--) {
        let element = elementsArr.pop();
        element.container.remove();
    }
}

saveInitFuncAndRun(init);