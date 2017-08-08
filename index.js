"use strict";

const sass = require('node-sass');
const Dependencies = require('vengeance-dependencies');
const SourceMap = require('source-map');
const SourceNode = SourceMap.SourceNode;
const SourceMapConsumer = SourceMap.SourceMapConsumer;
const SourceMapGenerator = SourceMap.SourceMapGenerator;
const LINE_SPLIT = /(?:\r\n|\r|\n)/;

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
        var filepath, module, module_name;
        var modules = [];
        
        var deps = new Dependencies();
        
        for(module_name in this.modules){
            if(!(this.modules[module_name].style)){
                continue;
            }
            deps.add(module_name, this.modules[module_name].style.deps);
        }
        
        modules = deps.getOrder();
        
        var vars = new SourceNode(1, 1, null);
        var scss = new SourceNode(1, 1, null);
        var line, lines;
        
        for(var i = 0; i < modules.length; i++){
            module = this.modules[modules[i]];
            if(scss){
                scss += '\n';
            }
            
            filepath = module.namespace + '/' + module.name + '.md';
            
            if(module.style.vars){
                lines = module.style.vars.src.split(LINE_SPLIT);
                for(line = module.style.vars.loc.start.line; lines.length; line++){
                    vars.add(new SourceNode(line, 0, filepath, lines.shift() + '\n'));
                }
            }
            
            lines = module.style.src.split(LINE_SPLIT);
            for(line = module.style.loc.start.line; lines.length; line++){
                console.log(line);
                vars.add(new SourceNode(line, 0, filepath, lines.shift() + '\n'));
            }
        }
        
        filepath = this.filepath;
        i = filepath.lastIndexOf('/');
        
        if(~i){
            filepath = filepath.substr(i + 1);
        }
    
        scss = new SourceNode(1, 1, null, [vars, scss]).toStringWithSourceMap({ file:filepath });
        
        console.log(printEmbedded(scss.code.toString(), scss.map.toString()));
        
        var css = sass.renderSync({
            file: 'vengeance',
            data: scss.code,
            outputStyle: "compressed",
            outFile: filepath,
            sourceMap: filepath + ".map",
            sourceMapRoot: this.srcpath,
            sourceMapEmbed: false
        });
        
        var merged_maps = SourceMapGenerator
            .fromSourceMap(new SourceMapConsumer(css.map.toString()));
            
        merged_maps.applySourceMap(new SourceMapConsumer(scss.map.toString()));
        
        css.map = merged_maps;
        
        console.log(printEmbedded(css.css.toString(), css.map.toString()));
        
        return css;
    }
}

function printEmbedded(source, map){
    return source + '\n/*# sourceMappingURL=data:application/json;base64,' + Buffer.from(map).toString('base64') + ' */';
}

module.exports = VengeanceSass;