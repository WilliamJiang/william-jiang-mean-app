/**
 * Created by RobinTh on 1/30/2015.
 */

var chai = require('chai');
var expect = chai.expect;
var should = require('should');
var express = require('express');
var request = require('supertest');

var url = 'http://localhost:3000';

describe('GET CIs' , function(){

    it('should return all the CIs ', function(done){
        request(url)
            .get('/api/ci')
            .end(function(err,res) {
                //console.log(res.body);
                //console.log(JSON.stringify(res.body));
                expect(res.status).to.equal(200);
                expect(res.body[0]).to.contain.key('_id');
                done();
            });
    });
});

describe('Status Test', function() {

    var id;

    before(function(done) {

        request(url)
            .get('/api/ci')
            .end(function(err,res) {
                id = res.body[0]._id;
                //console.log(id);
                done();
            });
    });

    it('should return 200 on status change from delivered to progress', function(done) {

        //var id = ('54cbba8cae18c6850ca86fe5');

        request(url)
            .put('/api/ci/' + id + '/status')
            .send({value:'in_progress'})
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                expect(res.status).to.equal(200);
                done();
            });
    });

    it('reset the status', function(done) {

        request(url)
            .get('/api/ci/' + id + '/reset')
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                // this is should.js syntax, very clear
                expect(res.status).to.equal(200);
                done();
            });
    });

    it('should return 400 on status change from delivered to archived', function(done) {

        request(url)
            .put('/api/ci/' + id + '/status')
            .send({value:'archived'})
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                expect(res.status).to.equal(400);
                done();
            });
    });

});
