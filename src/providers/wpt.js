const WebPageTest = require('webpagetest');
const async = require('async')

class WPT {
  constructor (context, config) {
    this.context = context
    this.config = config
  }
  
  validateResults(err, data) {
    const { log } = this.context
    return new Promise((resolve, reject) => {
      if (err) {
        /* istanbul ignore if */
        if (err.error && err.error.code === 'TIMEOUT') {
          log('Error: Test timed out.')
        } else {
          log(this.config)
          const isWptServer = this.config.server !== 'www.webpagetest.org' ? 'Please check server is a valid WebPageTest server' : ''
          log(`Error: Test request failed - ${isWptServer || err.statusText}`)
        }
        reject(err)
      }

      /* istanbul ignore if */
      if (data.statusCode !== 200) {
        log(`Error: ${data.statusText}`)
      }
      
      resolve(data.data)
    })
  }

  getLog (context) {
    return new Promise((resolve, reject) => {
      const {
        url,
        timeout,
        server
      } = context
      
      context.log('Firing up WPT')
      const requestTest = new WebPageTest(server, this.config.key)

      if (url) {
        let urls = []
        const validatedResults = []

        if (typeof(url) === 'string') {
          urls.push(url)
        } else {
          urls = url
        }

        async.eachSeries(urls,
          (site, done) => {
            if (!/^(http|https):\/\/[^ "]+$/.test(site)) return false
            context.log(`Initiating WPT test for ${site}`)
            requestTest.runTest(site,
              {
                pollResults: 5,
                timeout,
                breakDown: true,
                domains: true,
                requests: false,
                pageSpeed: true,
                lighthouse: true,
                firstViewOnly: this.config.view,
                location: this.config.location,
                connectivity: this.config.connectivity,
                private: this.config.private,
                label: this.config.label
              },
              (err, data) => {
                this.validateResults(err, data)
                  .catch(err => {
                    return false
                  })
                  .then(validated => {
                    validatedResults.push(validated)
                    done()
                  })
              }
            )
          },
          err => {
            if (err) {
              context.log(err)
            }
            return resolve(validatedResults)
          }
        )
      } else {
        reject('No URL specified')
      }
    })
  }

  async serialize () {
    const result = await this.getLog(this.context)
      
    this.context.log('Results obtained')
    
    if (result) {
      return {
        data: {
          provider: 'WebPageTest',
          data: result
        }
      }
    }
  }
}

module.exports = WPT