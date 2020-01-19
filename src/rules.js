var find = require('./find'),
    logs = [];

module.exports = {
    logs: function(){
        return logs;
    },

    /**
     * Для первой
     */
    pos_h1: false,

    /**
     * Для второй
     */
    pos2_h1: false,
    pos2_h2: false,

    textWarning: function(item){
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
    },

    buttonWarning: function(item){
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
    },

    placeholderWarning: function(item){
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
    },

    positionWarning: function(item){
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
    },
    
    h1Position: function(item){
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
    },

    h2Position: function(item){
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
    },

    h3Position: function(item){
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
    },

    _isText: function(item){
        return item.help.block == 'text';
    },

    _isButton: function(item){
        return item.help.block == 'button';
    },

    _isPlaceholder: function(item){
        return item.help.block == 'placeholder';
    }
}