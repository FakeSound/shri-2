class Rules {
    constructor() {
        /**
         * Для первой
         */
        this.pos_h1 = false;

        /**
         * Для второй
         */
        this.pos2_h1 = false;
        this.pos2_h2 = false;
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

    buttonWarning(item){
        if( !this._isButton(item) ){ return; }

        var parent = find.parent(item, 'block', 'warning'),
            mods,
            size,
            sizeNeeded;
        
        if( !parent ){ return; }

        mods = find.mods(item);
        
        if( !mods ){ return; }

        size = find.size(mods.value);
        
        if( !size ){ return; }
        
        /**
         * Todo что делать, если кнопка до текста
         */
        if( !parent.help.size ){
            return;
        }

        sizeNeeded = parent.help.size == 'xs' ? 's' : sizeNeeded;
        sizeNeeded = parent.help.size == 's' ? 'm' : sizeNeeded;
        sizeNeeded = parent.help.size == 'm' ? 'l' : sizeNeeded;
        sizeNeeded = parent.help.size == 'l' ? 'xl' : sizeNeeded;
        sizeNeeded = parent.help.size == 'xl' ? 'xxl' : sizeNeeded;

        if( sizeNeeded == size.value.value ){
            return;
        }
        
        logs.push({
            code: "WARNING.INVALID_BUTTON_SIZE",
            error: "Размер кнопки должен быть выше эталонного на 1 пункт",
            location: size.loc
        });
    }

    placeholderWarning(item){
        if( !this._isPlaceholder(item) ){ return; }

        var parent = find.parent(item, 'block', 'warning'),
            mods,
            size;
        
        if( !parent ){ return; }

        mods = find.mods(item);
        
        if( !mods ){ return; }

        size = find.size(mods.value);
        
        if( !size ){ return; }

        if( size.value.value == 's' ||  size.value.value == 'm' ||  size.value.value == 'l' ){
            return;
        }
        
        logs.push({
            code: "WARNING.INVALID_PLACEHOLDER_SIZE",
            error: "Допустимые размеры для блока placeholder в блоке warning (значение модификатора size): s, m, l.",
            location: size.loc
        });
    }

    positionWarning(item){
        if( !this._isButton(item) && !this._isPlaceholder(item) ){ return; }

        var parent = find.parent(item, 'block', 'warning');
        
        if( !parent ){ return; }

        if( this._isPlaceholder(item) ){

            if( parent.help.placeholder ){
                return;
            }

            if( parent.help.button ){
                logs.push({
                    code: "WARNING.INVALID_BUTTON_POSITION",
                    error: "Блок button в блоке warning не может находиться перед блоком placeholder на том же или более глубоком уровне вложенности.",
                    location: parent.help.button_loc
                });
            }

            parent.help.placeholder = true;
        }
        
        if( this._isButton(item) ){

            if( parent.help.placeholder ){
                return;
            }

            if( parent.help.button ){
                return;
            }

            parent.help.button = true;
            parent.help.button_loc = item.loc;
        }
    }
    
    h1Position(item){
        if( !this._isText(item) ){ return; }

        var mods,
            type;
        
        mods = find.mods(item);
        
        if( !mods ){ return; }

        type = find.type(mods.value);
        
        if( !type ){ return; }

        if( type.value.value != 'h1' ){
            return;
        }

        if( !this.pos_h1 ){
            this.pos_h1 = true;
            
            return;
        }

        logs.push({
            code: "TEXT.SEVERAL_H1",
            error: "H1 только 1",
            location: type.loc
        });
    }

    h2Position(item){
        if( this.pos2_h1 ){ return; }
        if( !this._isText(item) ){ return; }

        var mods,
            type;
        
        mods = find.mods(item);
        
        if( !mods ){ return; }

        type = find.type(mods.value);
        
        if( !type ){ return; }

        if( type.value.value == 'h1' && this.pos2_h2 ){
            logs.push({
                code: "TEXT.INVALID_H2_POSITION",
                error: "Заголовок второго уровня (блок text с модификатором type h2) не может находиться перед заголовком первого уровня на том же или более глубоком уровне вложенности.",
                location: type.loc
            });

            return;
        }

        if( type.value.value == 'h1' ){
            this.pos2_h1 = true;
        }

        if( type.value.value == 'h2' ){
            this.pos2_h2 = true;
        }
    }

    h3Position(item){
        if( item.parent && item.parent.help.h2 ){ return; }
        if( !this._isText(item) ){ return; }

        var mods,
            type,
            parent;
        
        mods = find.mods(item);
        
        if( !mods ){ return; }

        type = find.type(mods.value);
        
        if( !type ){ return; }

        if( type.value.value != 'h2' && type.value.value != 'h3' ){
            return;
        }

        if( type.value.value == 'h3' ){
            item.parent.help.h3 = true;

            return;
        }

        if( type.value.value == 'h2' ){
            if( item.parent.help.h3 ){
                localErr();

                return;
            }

            parent = find.parentByHelp(item, 'h3', true)
            if( parent && parent.help.h3 ){
                localErr();

                return;
            }

            item.parent.help.h2 = true;
        }

        function localErr(){
            logs.push({
                code: "TEXT.INVALID_H3_POSITION",
                error: "Заголовок третьего уровня (блок text с модификатором type h3) не может находиться перед заголовком второго уровня на том же или более глубоком уровне вложенности.",
                location: type.loc
            });
        }
    }

    _isText(item){
        return item.help.block == 'text';
    }

    _isButton(item){
        return item.help.block == 'button';
    }

    _isPlaceholder(item){
        return item.help.block == 'placeholder';
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

    type(item) {
        return item.children.find(this.chType) ? item.children.find(this.chType) : null;
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

    chType(item){
        return item.key.value == 'type';
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

    parentByHelp(item, key, value){
        if( !item.parent ){
            return false;
        }

        if( item.parent.help[key] == value ){
            return item.parent;
        }

        return this.parentByHelp(item.parent, key, value);
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
            "mods": { "size": "s" } 
        },
        {
            "block": "text",
            "mods": { "size": "m", "type": "h2" }
        },
        {
            "elem": "content",
            "content": [
                {
                    "block": "text",
                    "mods": { "size": "m", "type": "h3" }
                },
                { 
                    "block": "button", 
                    "mods": { "size": "l" } 
                },
                { 
                    "block": "button", 
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

    return logs;
}

if (global) {
    global.lint = lint;
} else {
    window.lint = lint;
}

// lint(json);
console.log(global.lint(json));