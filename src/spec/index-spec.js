var should = require('should'),
    Needle = require('../main');

describe('needle', function() {
    describe('Needle', function() {
        describe('Default values', function() {
            var needle = Needle.new(); 
            it('should have no entries', function() {
                needle.should.have.property('_entries')
                    .and.be.an.Object;
                Object.keys(needle._entries).should.have.length(0);
            });
        });
        describe('Adding an entry', function() {
            var needle = Needle.new();
            needle.register('a')
                .dependsOn('b');
            needle.register('b')
                .dependsOn('c');
            it('should have two entries', function() {
                needle.should.have.property('_entries')
                    .and.be.an.Object;
                Object.keys(needle._entries).should.have.length(2);
            });
            it('should have entry "a"', function() {
                needle._entries.should.have.property('a');
            });
            it('should have entry "b"', function() {
                needle._entries.should.have.property('b');
            });
        });
    });
});

