
var jsonToAst = require('json-to-ast'),
    find = require('./find'),
    rules = require('./rules');

function lint(string){
    var string = string ? string : json;

    if( !string.length ){
        return logs;
    }

    function parse(item, parent){
        var content,
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
             * Используется для поиска по родителям и вспомогательным моментам
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
            rules.marketing(item);

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
