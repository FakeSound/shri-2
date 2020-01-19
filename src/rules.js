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
    pos2_loc: null,

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
            location: this._pos(parent.loc)
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
            location: this._pos(item.loc)
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
            location: this._pos(item.loc)
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
                    location: this._pos(parent.help.button_loc)
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
            location: this._pos(item.loc)
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
                location: this._pos(this.pos2_loc)
            });

            return;
        }

        if( type.value.value == 'h1' ){
            this.pos2_h1 = true;
        }

        if( type.value.value == 'h2' ){
            this.pos2_h2 = true;
            this.pos2_loc = item.loc;
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
            item.parent.help.h3_loc = item.loc;

            return;
        }

        if( type.value.value == 'h2' ){
            if( item.parent.help.h3 ){
                localErr(this._pos(item.parent.help.h3_loc));

                return;
            }

            parent = find.parentByHelp(item, 'h3', true)
            if( parent && parent.help.h3 ){
                localErr(this._pos(parent.help.h3_loc));

                return;
            }

            item.parent.help.h2 = true;
        }

        
        function localErr(loc){
            logs.push({
                code: "TEXT.INVALID_H3_POSITION",
                error: "Заголовок третьего уровня (блок text с модификатором type h3) не может находиться перед заголовком второго уровня на том же или более глубоком уровне вложенности.",
                location: loc
            });
        }
    },

    marketing: function(item){
        if( !this._isGrid(item) && !this._isFraction(item) ){
            if( this._isMarketing(item) ){
                var grid = item.parent.parent,
                    fraction = item.parent;

                if( !grid ){
                    return;
                }

                if( !grid.help.marketing ){
                    grid.help.marketing = 0;
                }

                grid.help.marketing += fraction.help.elemColumns ? parseInt(fraction.help.elemColumns) : 0;

                if( grid.help.marketing < parseInt(grid.help.columns) / 2 ){
                    return;
                }

                logs.push({
                    code: "GRID.TOO_MUCH_MARKETING_BLOCKS",
                    error: "Нужно проверить, что маркетинговые блоки занимают не больше половины от всех колонок блока grid",
                    location: this._pos(grid.loc)
                });
            }

            return;
        }

        var mods,
            columns,
            elemMods,
            elemColumns;

        if( item.help.elem != 'fraction' ){
            mods = find.mods(item);
        
            if( !mods ){ return; }

            columns = find.columns(mods.value);

            if( !columns ){ return; }

            item.help.columns = columns.value.value;
        }else{
            elemMods = find.elemMods(item);
        
            if( !elemMods ){ return; }

            elemColumns = find.elemColumns(elemMods.value);

            if( !elemColumns ){ return; }

            item.help.elemColumns = elemColumns.value.value;
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
    },

    _isGrid: function(item){
        return item.help.block == 'grid';
    },

    _isFraction: function(item){
        return item.help.elem == 'fraction';
    },
    
    _isMarketing: function(item){
        return item.help.block == 'commercial' || item.help.block == 'offer';
    },

    _pos: function(pos){
        return {
            start: {
                column: pos.start.column,
                line: pos.start.line
            },
            end: {
                column: pos.end.column,
                line: pos.end.line
            }
        };
    }
}