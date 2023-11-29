import { saveInitFuncAndRun } from './tools/loadMainContent.js';
import { GAR_ADDRESS_LEVEL_ENUM } from './tools/constants.js';

let elementsArr;

function init() {
    elementsArr = [ { container: null, input: $('#search_level_input_id'), label: null, levelId: '#level_id' } ];
    
    creatNextAddressLevel($('#search_level_input_id'), '0');
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
                console.log('ajax', data);

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
        let data = event.params.data;

        deleteElementAfter(level);

        if (data.id !== '-1' && level > 0) {
            updateLable(elementsArr.at(-1).label, [data.type]);
        }

        if (data.id !== '-1' && data.type !== 'Building') { 
            let searchElements = creatSearchElements(level + 1);  

            searchElements.searchContainer.insertAfter($(elementsArr.at(-1).levelId));

            elementsArr.push({ 
                container: searchElements.searchContainer, 
                input: searchElements.select, 
                label: searchElements.selectLabel, 
                levelId: `#${level + 1}_level_id` 
            });

            creatNextAddressLevel(searchElements.select, data.id.split('_')[0], level + 1);
        }
    }

    element.on('select2:select', (event) => onSelect(event, elementLevel));
}

function updateLable (label, levelTypes) {
    console.log(label, levelTypes);

    let labelText = ''; 
    levelTypes.forEach((type, index) => {
        labelText += (index > 0 ? ', ' : '') + GAR_ADDRESS_LEVEL_ENUM[type];
    })

    label.text(labelText);
}

function creatSearchElements (level) {
    let selectLabel = $('<label>', {
        'class': 'form-label'
    })

    let select = $('<select>', {
        'class': 'form-select',
        html: $('<option>', {
            'class': 'form-label',
            value: '-1',
            text: 'Не выбрано'
        })
    })

    let searchContainer = $('<div>', {
        'class': 'col-12 mt-2',
        id: `${level}_level_id`,
        html: [
            selectLabel,
            select
        ]
    });

    return { selectLabel, select, searchContainer };
}

function deleteElementAfter (index) {
    for (let i = elementsArr.length - 1; i > index; i--) {
        let element = elementsArr.pop();
        element.container.remove();
    }
}

saveInitFuncAndRun(init);