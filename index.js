"use strict";

var sass = require('node-sass');
var Dependencies = require('vengeance-dependencies');

/*** vengeance extension *****************************************************/

class VengeanceSass {
    constructor(dest_path, relative_src_path){
        this.modules = {};
        this.filepath = dest_path;
        this.srcpath = (relative_src_path === undefined ? '../../pug/modules' : relative_src_path);
    }

    addModules(modules){
        for(var key in modules){
            if(!(key in this.modules)){
                this.modules[key] = modules[key];
            }
        }
    }
    
    compile(){
        var src = '';
        var filepath, module, module_name;
        var modules = [];
        var sources = {};
        
        var deps = new Dependencies();
        
        for(module_name in this.modules){
            if(!(this.modules[module_name].style)){
                continue;
            }
            deps.add(module_name, this.modules[module_name].style.deps);
        }
        
        modules = deps.getOrder();
        
        for(var i = 0; i < modules.length; i++){
            module = this.modules[modules[i]];
            if(src){
                src += '\n';
            }
            filepath = module.namespace + '/' + module.name + '.md';
            src += '@import ' + JSON.stringify(filepath) + ';';
            sources[filepath] = module.style.prepend + module.style.src;
        }
        
        filepath = this.filepath;
        i = filepath.lastIndexOf('/');
        
        if(~i){
            filepath = filepath.substr(i + 1);
        }
        
        src = sass.renderSync({
            file: 'vengeance',
            data: src || '/* no sass found */',
            outputStyle: "compressed",
            outFile: filepath,
            sourceMap: filepath + ".map",
            sourceMapRoot: this.srcpath,
            importer: function(url, prev, done){
                return { contents:sources[url] };
            }
        });
        
        return src;
    }
}

module.exports = VengeanceSass;