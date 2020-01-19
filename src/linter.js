
var jsonToAst = require('json-to-ast'),
    find = require('./find'),
    rules = require('./rules');

// var json = `{
//     "block": "warning",
//     "content": [
//         {
//             "block": "text",
//             "mods": { "type": "h2" }
//         },
//         {
//             "block": "text",
//             "mods": { "type": "h3" }
//         }
//     ]
// }`;

function lint(string){
    var string = string ? string : json;

    if( !string.length ){
        return logs;
    }

    function parse(item, parent){
        var content, mods,
            parent = parent ? parent : null;

        item.parent = parent;

        if( item.type != 'Object' ){
            return;
        }

        /**
         * Блок или элемент
         */
        if( item.children.find(find.chBlockOrElem) ){
            /**
             * Запоминаем важное
             */
            item.help = {
                block: find.block(item),
                elem: find.elem(item),
            }

            rules.textWarning(item);
            rules.buttonWarning(item);
            rules.positionWarning(item);
            rules.placeholderWarning(item);
            rules.h1Position(item);
            rules.h2Position(item);
            rules.h3Position(item);

            /**
             * Парсинг контента
             */
            content = item.children.find(find.chContent);
            if( content ){                    
                content.value.children.forEach(function(child){
                    parse(child, item);
                });
            }
        }
    }

    parse(jsonToAst(string))

    return rules.logs();
}

if (global) {
    global.lint = lint;
} else {
    window.lint = lint;
}

// lint(json);
// console.log(global.lint(json));