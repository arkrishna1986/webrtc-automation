const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const assert = chai.assert;
const expect = chai.expect;

chai.Should();
chai.use(chaiAsPromised);

chaiAsPromised.transferPromiseness = browser.transferPromiseness
const should = require('should');


describe('Test WebRTC App', function(){
  describe('#1 Launch App', function(){
    it('Should be able to launch app', function(){
    //  console.info(browser.desiredCapabilities);

      var browserA = browser.select('browserA');
      //var constraints = browser.select('window.constraints');
    //  constraints.fake = true;
      browserA.url('file:///C:/Users/srajsriv/Desktop/webRTC/app/html/test.html')
      .pause(3000);
      browserA.click('#startBtn')
      .pause(2000);
      browserA.click('#callBtn')

      browserA.startAnalyzing(function () {
            return remotepc;
        })

        var connectionType = browserA.getConnectionInformation()
        console.log(connectionType)

        /**
         * record data for 5s
         */
        browser.pause(5000)

        /**
         * print data
         */
        stats = browserA.getStats(5000)
        console.log('mean:', stats.mean)
        console.log('median:', stats.median)
        console.log('max:', stats.max)
        console.log('min:', stats.min)

      browser.pause(15000);

    })
  })
})
