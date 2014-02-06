var should = require('should'),
    Entry = require('../main/entry');

describe('needle', function() {
    describe('entry', function() {
        describe('Default values', function() {
            var entry = Entry.new(); 
            it('should have no dependencies', function() {
                entry.should.have.property('dependencies')
                    .and.be.an.Array
                    .and.have.length(0);
            });
            it('should be lazy', function() {
                entry.should.have.property('isLazy', true);
            });
            it('should be a singleton', function() {
                entry.should.have.property('isPrototype', false);
            });
        });
        describe('Setting values', function() {
            var entry = Entry.new(); 
            entry.dependsOn('a')
                .dependsOn('b')
                .dependsOn('c')
                .eager()
                .prototype();
            it('should have no dependencies', function() {
                entry.should.have.property('dependencies')
                    .and.be.an.Array
                    .and.containEql('a')
                    .and.containEql('b')
                    .and.containEql('c')
                    .and.have.length(3);
            });
            it('should be lazy', function() {
                entry.should.have.property('isLazy', false);
            });
            it('should be a singleton', function() {
                entry.should.have.property('isPrototype', true);
            });
        });
    });
});
