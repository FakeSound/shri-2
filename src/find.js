module.exports = {
    block: function(item) {
        return item.children.find(this.chBlock) ? item.children.find(this.chBlock).value.value : null;
    },

    elem: function(item) {
        return item.children.find(this.chElem) ? item.children.find(this.chElem).value.value : null;
    },

    mods: function(item) {
        return item.children.find(this.chMods) ? item.children.find(this.chMods) : null;
    },

    size: function(item) {
        return item.children.find(this.chSize) ? item.children.find(this.chSize) : null;
    },

    type: function(item) {
        return item.children.find(this.chType) ? item.children.find(this.chType) : null;
    },

    chBlock: function(item) {
        return item.key.value == 'block';
    },

    chElem: function(item){
        return item.key.value == 'elem';
    },

    chBlockOrElem: function(item){
        return item.key.value == 'elem' || item.key.value == 'block';
    },

    chContent: function(item){
        return item.key.value == 'content';
    },

    chMods: function(item){
        return item.key.value == 'mods';
    },

    chSize: function(item){
        return item.key.value == 'size';
    },

    chType: function(item){
        return item.key.value == 'type';
    },

    parent: function(item, type, name){
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
    },

    parentByHelp: function(item, key, value){
        if( !item.parent ){
            return false;
        }

        if( item.parent.help[key] == value ){
            return item.parent;
        }

        return this.parentByHelp(item.parent, key, value);
    }
}