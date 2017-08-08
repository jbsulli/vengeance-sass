/* global describe:true, it:true */

const chai = require('chai');
const expect = chai.expect;

const pug = require('pug');
const withVengeance = require('vengeance');
const Sass = require('../index.js');

describe('VengeanceSass', () => {
    it("should comple sass and add it to the ast", () => {
        var sass = new Sass('/css/styles.css');
        var r = pug.render('block style\nm.test.sass\na(href="#") click me', withVengeance({ basedir: './test/pug' }, { styles:sass }));
        expect(r).to.equal('<link href="/css/styles.css" rel="stylesheet"/><a href="#">click me</a>');
        r = sass.compile();
        expect(r.css.toString()).to.equal('body{background:black}body a{color:red}\n\n/*# sourceMappingURL=styles.css.map */');
        expect(r.map.toString()).to.equal("{\n\t\"version\": 3,\n\t\"file\": \"styles.css\",\n\t\"sourceRoot\": \"../../pug/modules\",\n\t\"sources\": [\n\t\t\"vengeance\",\n\t\t\"test/sass.md\"\n\t],\n\t\"names\": [],\n\t\"mappings\": \"ACIA,AAAA,IAAI,AAAC,CACD,UAAU,CAAC,KAAK,CAKnB,AAND,AAGI,IAHA,CAGA,CAAC,AAAC,CACE,KAAK,CAAC,GAAG,CACZ\"\n}");
    });
    it("should only output sass once per module", () => {
        var sass = new Sass('/css/styles.css');
        var r = pug.render('block style\nm.test.sass\nm.test.sass\nm.test.sass\na(href="#") click me', withVengeance({ basedir: './test/pug' }, { styles:sass }));
        expect(r).to.equal('<link href="/css/styles.css" rel="stylesheet"/><a href="#">click me</a>');
        r = sass.compile();
        expect(r.css.toString()).to.equal('body{background:black}body a{color:red}\n\n/*# sourceMappingURL=styles.css.map */');
        expect(r.map.toString()).to.equal("{\n\t\"version\": 3,\n\t\"file\": \"styles.css\",\n\t\"sourceRoot\": \"../../pug/modules\",\n\t\"sources\": [\n\t\t\"vengeance\",\n\t\t\"test/sass.md\"\n\t],\n\t\"names\": [],\n\t\"mappings\": \"ACIA,AAAA,IAAI,AAAC,CACD,UAAU,CAAC,KAAK,CAKnB,AAND,AAGI,IAHA,CAGA,CAAC,AAAC,CACE,KAAK,CAAC,GAAG,CACZ\"\n}");
        
        // same sass instance for two documents
        r = pug.render('block style\nm.test.sass\nm.test.sass\nm.test.sass\na(href="#") different doc!', withVengeance({ basedir: './test/pug' }, { styles:sass }));
        r = sass.compile();
        expect(r.css.toString()).to.equal('body{background:black}body a{color:red}\n\n/*# sourceMappingURL=styles.css.map */');
        expect(r.map.toString()).to.equal("{\n\t\"version\": 3,\n\t\"file\": \"styles.css\",\n\t\"sourceRoot\": \"../../pug/modules\",\n\t\"sources\": [\n\t\t\"vengeance\",\n\t\t\"test/sass.md\"\n\t],\n\t\"names\": [],\n\t\"mappings\": \"ACIA,AAAA,IAAI,AAAC,CACD,UAAU,CAAC,KAAK,CAKnB,AAND,AAGI,IAHA,CAGA,CAAC,AAAC,CACE,KAAK,CAAC,GAAG,CACZ\"\n}");
    });
    it("should use relative source path if passed", () => {
        var sass = new Sass('/css/styles.css', '../modules');
        var r = pug.render('block style\nm.test.sass\nm.test.sass\nm.test.sass\na(href="#") click me', withVengeance({ basedir: './test/pug' }, { styles:sass }));
        expect(r).to.equal('<link href="/css/styles.css" rel="stylesheet"/><a href="#">click me</a>');
        r = sass.compile();
        expect(r.css.toString()).to.equal('body{background:black}body a{color:red}\n\n/*# sourceMappingURL=styles.css.map */');
        expect(r.map.toString()).to.equal("{\n\t\"version\": 3,\n\t\"file\": \"styles.css\",\n\t\"sourceRoot\": \"../modules\",\n\t\"sources\": [\n\t\t\"vengeance\",\n\t\t\"test/sass.md\"\n\t],\n\t\"names\": [],\n\t\"mappings\": \"ACIA,AAAA,IAAI,AAAC,CACD,UAAU,CAAC,KAAK,CAKnB,AAND,AAGI,IAHA,CAGA,CAAC,AAAC,CACE,KAAK,CAAC,GAAG,CACZ\"\n}");
    });
    it("should comple the sass from multiple modules together", () => {
        var sass = new Sass('/css/styles.css');
        var r = pug.render('block style\nm.test.sass\nm.test.sass-2\na(href="#") click me', withVengeance({ basedir: './test/pug' }, { styles:sass }));
        expect(r).to.equal('<link href="/css/styles.css" rel="stylesheet"/><a href="#">click me</a>');
        r = sass.compile();
        expect(r.css.toString()).to.equal('body{background:black}body a{color:red}body{margin:0 auto;width:1024px}\n\n/*# sourceMappingURL=styles.css.map */');
        expect(r.map.toString()).to.equal("{\n\t\"version\": 3,\n\t\"file\": \"styles.css\",\n\t\"sourceRoot\": \"../../pug/modules\",\n\t\"sources\": [\n\t\t\"vengeance\",\n\t\t\"test/sass.md\",\n\t\t\"test/sass-2.md\"\n\t],\n\t\"names\": [],\n\t\"mappings\": \"ACIA,AAAA,IAAI,AAAC,CACD,UAAU,CAAC,KAAK,CAKnB,AAND,AAGI,IAHA,CAGA,CAAC,AAAC,CACE,KAAK,CAAC,GAAG,CACZ,ACLL,AAAA,IAAI,AAAC,CACD,MAAM,CAAC,MAAM,CACb,KAAK,CAAE,MAAM,CAChB\"\n}");
    });
    it("should only use the filename for the output and not the full path", () => {
        // node-sass seems to go banannas if you give it a path for the outFile
        var sass = new Sass('styles.css');
        var r = pug.render('block style\nm.test.sass\nm.test.sass-2\na(href="#") click me', withVengeance({ basedir: './test/pug' }, { styles:sass }));
        expect(r).to.equal('<link href="styles.css" rel="stylesheet"/><a href="#">click me</a>');
        r = sass.compile();
        expect(r.css.toString()).to.equal('body{background:black}body a{color:red}body{margin:0 auto;width:1024px}\n\n/*# sourceMappingURL=styles.css.map */');
        expect(r.map.toString()).to.equal("{\n\t\"version\": 3,\n\t\"file\": \"styles.css\",\n\t\"sourceRoot\": \"../../pug/modules\",\n\t\"sources\": [\n\t\t\"vengeance\",\n\t\t\"test/sass.md\",\n\t\t\"test/sass-2.md\"\n\t],\n\t\"names\": [],\n\t\"mappings\": \"ACIA,AAAA,IAAI,AAAC,CACD,UAAU,CAAC,KAAK,CAKnB,AAND,AAGI,IAHA,CAGA,CAAC,AAAC,CACE,KAAK,CAAC,GAAG,CACZ,ACLL,AAAA,IAAI,AAAC,CACD,MAAM,CAAC,MAAM,CACb,KAAK,CAAE,MAAM,CAChB\"\n}");
    });
    it("should not interfere with other blocks", () => {
        var sass = new Sass('/css/styles.css');
        var r = pug.render('block style\nblock styles\nblock body\nm.test.sass\na(href="#") click me', withVengeance({ basedir: './test/pug' }, { styles:sass }));
        expect(r).to.equal('<link href="/css/styles.css" rel="stylesheet"/><a href="#">click me</a>');
        r = sass.compile();
        expect(r.css.toString()).to.equal('body{background:black}body a{color:red}\n\n/*# sourceMappingURL=styles.css.map */');
        expect(r.map.toString()).to.equal("{\n\t\"version\": 3,\n\t\"file\": \"styles.css\",\n\t\"sourceRoot\": \"../../pug/modules\",\n\t\"sources\": [\n\t\t\"vengeance\",\n\t\t\"test/sass.md\"\n\t],\n\t\"names\": [],\n\t\"mappings\": \"ACIA,AAAA,IAAI,AAAC,CACD,UAAU,CAAC,KAAK,CAKnB,AAND,AAGI,IAHA,CAGA,CAAC,AAAC,CACE,KAAK,CAAC,GAAG,CACZ\"\n}");
    });
    it('should apply the style to all blocks with the name style', () => {
        // needed for instances where the style block is duplicated with conditional/case statements determining which is displayed
        // probably for positioning the block in defferent locations
        var sass = new Sass('/css/styles.css');
        var r = pug.compile('if a\n  block style\nm.test.sass\na(href="#") click me\nif !a\n  block style', withVengeance({ basedir: './test/pug' }, { styles:sass }));
        expect(r({ a:true })).to.equal('<link href="/css/styles.css" rel="stylesheet"/><a href="#">click me</a>');
        expect(r({ a:false })).to.equal('<a href="#">click me</a><link href="/css/styles.css" rel="stylesheet"/>');
        r = sass.compile();
        expect(r.css.toString()).to.equal('body{background:black}body a{color:red}\n\n/*# sourceMappingURL=styles.css.map */');
        expect(r.map.toString()).to.equal("{\n\t\"version\": 3,\n\t\"file\": \"styles.css\",\n\t\"sourceRoot\": \"../../pug/modules\",\n\t\"sources\": [\n\t\t\"vengeance\",\n\t\t\"test/sass.md\"\n\t],\n\t\"names\": [],\n\t\"mappings\": \"ACIA,AAAA,IAAI,AAAC,CACD,UAAU,CAAC,KAAK,CAKnB,AAND,AAGI,IAHA,CAGA,CAAC,AAAC,CACE,KAAK,CAAC,GAAG,CACZ\"\n}");
    });
    it("should handle no sass found", () => {
        var sass = new Sass('/css/styles.css');
        var r = pug.render('m.test.no-sass\na(href="#") click me', withVengeance({ basedir: './test/pug' }, { styles:sass }));
        expect(r).to.equal('<h1>No Sass Here...</h1><a href="#">click me</a>');
        r = sass.compile();
        expect(r.css.toString()).to.equal('\n/*# sourceMappingURL=styles.css.map */');
        expect(r.map.toString()).to.equal('{\n\t"version": 3,\n\t"file": "styles.css",\n\t"sourceRoot": "../../pug/modules",\n\t"sources": [\n\t\t"vengeance"\n\t],\n\t"names": [],\n\t"mappings": ""\n}');
    });
});