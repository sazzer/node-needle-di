var should = require('should'),
    Container = require('../main/container'),
    Needle = require('../main');

require('mocha-as-promised')();

describe('needle', function() {
    describe('When dependencies are missing', function() {
        var needle = Needle.new();
        needle.register('a')
            .dependsOn('b');

        it('Should error', function() {
            return needle.done().then(function() {
                throw Error('Failed expected');
            }, function(e) {
                // Success
                console.log(e);
            });
        });
    });
    describe('When the configuration is valid', function() {
        var needle = Needle.new();
        needle.register('a')
            .staticValue(1);
        needle.register('b')
            .factoryFunction(function() { return 2; });
        needle.register('c')
            .factoryFunction(function(args) { console.log(args); return args.a + args.b; })
            .dependsOn('a')
            .dependsOn('b');
        needle.register('d')
            .requires("../spec_resources/d")
            .factoryFunction(function(d) { return d; });
        needle.register('e')
            .dependsOn('a')
            .dependsOn('b')
            .dependsOn('c')
            .dependsOn('d');

        it('Should not error', function() {
            return needle.done();
        });
        it('Should return a container', function() {
            return needle.done().then(function(container) {
                should.exist(container);
                Container.isPrototypeOf(container).should.be.true;
            }).done();
        });
        it('Should return the correct value for "a"', function() {
            return needle.done().then(function(container) {
                container.get('a').then(function(value) {
                    should.exist(value);
                    value.should.be.eql(1);
                }).done();
            }).done();
        });
        it('Should return the correct value for "b"', function() {
            return needle.done().then(function(container) {
                container.get('b').then(function(value) {
                    should.exist(value);
                    value.should.be.eql(2);
                }).done();
            }).done();
        });
        it('Should return the correct value for "c"', function() {
            return needle.done().then(function(container) {
                container.get('c').then(function(value) {
                    should.exist(value);
                    value.should.be.eql(3);
                }).done();
            }).done();
        });
        it('Should return the correct value for "d"', function() {
            return needle.done().then(function(container) {
                container.get('d').then(function(value) {
                    should.exist(value);
                    value.should.be.eql(1);
                }).done();
            }).done();
        });
        it('Should return the correct value for "e"', function() {
            return needle.done().then(function(container) {
                container.get('e').then(function(value) {
                    should.exist(value);
                    value.should.be.an.Object;
                    value.a.should.be.eql(1);
                    value.b.should.be.eql(2);
                    value.c.should.be.eql(3);
                    value.d.should.be.eql(1);
                }).done();
            }).done();
        });
    });
    describe('Prototype/Singleton beans', function() {
        var needle = Needle.new();
        var counterP = 0;
        var counterS = 0;
        needle.register('prototype')
            .prototype()
            .factoryFunction(function() { return ++counterP; });
        needle.register('singleton')
            .singleton()
            .factoryFunction(function() { return ++counterS; });
        it('Should create Singleton beans only once', function() {
                return needle.done().then(function(container) {
                    container.get('singleton').then(function(value) {
                        var val = counterS;
                        counterS.should.be.eql(val);
                        counterS.should.be.eql(value);
                        container.get('singleton').then(function(value) {
                            counterS.should.be.eql(val);
                            counterS.should.be.eql(value);
                        }).done();
                    }).done();
                }).done();
        });
        it('Should create Prototype beans every time', function() {
                return needle.done().then(function(container) {
                    container.get('prototype').then(function(value) {
                        var val = counterP;
                        counterP.should.be.eql(val);
                        counterP.should.be.eql(value);
                        container.get('prototype').then(function(value) {
                            counterP.should.be.eql(val + 1);
                            counterP.should.be.eql(value);
                        }).done();
                    }).done();
                }).done();
        });
    });
    describe('Eager/Lazy beans', function() {
        var needle = Needle.new();
        var counterE = 0;
        var counterL = 0;
        needle.register('eager')
            .eager()
            .singleton()
            .factoryFunction(function() { console.log("Factory function: Eager"); return ++counterE; });
        needle.register('lazy')
            .lazy()
            .singleton()
            .factoryFunction(function() { console.log("Factory function: Lazy"); return ++counterL; });
        it('Should create Lazy beans on demand', function() {
                console.log("Before needle.done()");
                counterL = 0;
                return needle.done().then(function(container) {
                    console.log("After needle.done()");
                    counterL.should.be.eql(0);
                    container.get('lazy').then(function(value) {
                        console.log("After container.get");
                        counterL.should.be.eql(value);
                        counterL.should.be.eql(1);
                    }).done();
                }).done();
        });
        it('Should create Eager beans on startup', function() {
                console.log("Before needle.done()");
                counterE = 0;
                return needle.done().then(function(container) {
                    console.log("After needle.done()");
                    counterE.should.be.eql(1);
                    container.get('eager').then(function(value) {
                        console.log("After container.get");
                        counterE.should.be.eql(value);
                        counterE.should.be.eql(1);
                    }).done();
                }).done();
        });
    });
});


