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

    elemMods: function(item) {
        return item.children.find(this.chElemMods) ? item.children.find(this.chElemMods) : null;
    },

    size: function(item) {
        return item.children.find(this.chSize) ? item.children.find(this.chSize) : null;
    },

    type: function(item) {
        return item.children.find(this.chType) ? item.children.find(this.chType) : null;
    },

    columns: function(item) {
        return item.children.find(this.chColumns) ? item.children.find(this.chColumns) : null;
    },

    elemColumns: function(item) {
        return item.children.find(this.chElemColumns) ? item.children.find(this.chElemColumns) : null;
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

    chElemMods: function(item){
        return item.key.value == 'elemMods';
    },

    chSize: function(item){
        return item.key.value == 'size';
    },

    chType: function(item){
        return item.key.value == 'type';
    },

    chColumns: function(item){
        return item.key.value == 'm-columns';
    },

    chElemColumns: function(item){
        return item.key.value == 'm-col';
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