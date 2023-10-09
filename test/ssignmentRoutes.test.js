const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Replace with the path to your Express app

chai.use(chaiHttp);
const expect = chai.expect;

describe('GET /healthz', () => {
  it('should return status code 200', (done) => {
    chai.request(app)
      .get('/healthz')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
        process.exit(0)
      });
  });
  afterEach(function() {
    if (this.currentTest.state === 'failed') {
      process.exit(1);
    }
  });
});







