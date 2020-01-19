class Rules {
    constructor() {

    }

    textWarning(item){
        if( !this._isText(item) ){ return; }

        var parent = find.parent(item, 'block', 'warning'),
            mods,
            size;
        
        if( !parent ){ return; }

        mods = find.mods(item);
        
        if( !mods ){ return; }

        size = find.size(mods.value);
        
        if( !size ){ return; }
        
        if( !parent.help.size ){
            parent.help.size = size.value.value;

            return;
        }

        if( parent.help.size == size.value.value ){
            return;
        }

        logs.push({
            code: "WARNING.TEXT_SIZES_SHOULD_BE_EQUAL",
            error: "Тексты в блоке warning должны быть одного размера",
            location: size.loc
        });
    }

    _isText(item){
        return item.help.block == 'text';
    }
}

class Find {
    constructor() {
        
    }

    block(item) {
        return item.children.find(this.chBlock) ? item.children.find(this.chBlock).value.value : null;
    };

    elem(item) {
        return item.children.find(this.chElem) ? item.children.find(this.chElem).value.value : null;
    };

    mods(item) {
        return item.children.find(this.chMods) ? item.children.find(this.chMods) : null;
    };

    size(item) {
        return item.children.find(this.chSize) ? item.children.find(this.chSize) : null;
    }

    chBlock(item) {
        return item.key.value == 'block';
    };

    chElem(item){
        return item.key.value == 'elem';
    };

    chBlockOrElem(item){
        return item.key.value == 'elem' || item.key.value == 'block';
    };

    chContent(item){
        return item.key.value == 'content';
    };

    chMods(item){
        return item.key.value == 'mods';
    }

    chSize(item){
        return item.key.value == 'size';
    }

    parent(item, type, name){
        if( !item.parent ){
            return false;
        }

        if( type == 'elem' ){
            if( item.parent.help.elem == name ){
                return item.parent;
            }
        }else if( type == 'block' ){
            if( item.parent.help.block == name ){
                return item.parent;
            }
        }

        return this.parent(item.parent, type, name);
    };
}

var jsonToAst = require('json-to-ast'),
    find = new Find,
    rules = new Rules,
    logs = [];

var json = `{
    "block": "warning",
    "content": [
        {
            "block": "placeholder",
            "mods": { "size": "m" }
        },
        {
            "elem": "content",
            "content": [
                {
                    "block": "text",
                    "mods": { "size": "m" }
                },
                {
                    "block": "text",
                    "mods": { "size": "l" }
                }
            ]
        }
    ]
}`;

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

    return logs;
}

if (global) {
    global.lint = lint
} else {
    window.lint = lint
}

// console.log(lint());