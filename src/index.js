const defaultConfig = require('./default-config.json')
const commands = require('probot-commands')

const newComment = require('./new-comment')
const updateComment = require('./update-comment')

const WPT = require('./providers/wpt')

// We already have an instance of handlebars from Probot's hbs dependency
const { handlebars } = require('hbs')
const template = handlebars.compile(require('./template'))

async function run(context, url) {  
  const config = await context.config('perf-reporter.yml', defaultConfig)
  
  context.log(`Creating WebPageTest instance for ${context.id}`)
  const serializer = new WPT({...context, url}, { ...config.wpt, key: process.env.WPT_KEY })
    
  // Will return false if something borks
  const serialized = await serializer.serialize()
  context.log('Render comment')
  if (serialized) {
    const { data } = serialized
    const { number, owner, repo } = context.issue()
    
    const opts = {
      context,
      template,
      ...data,
      number,
      after: config.after && handlebars.compile(config.after)({...data}),
      before: config.before && handlebars.compile(config.before)({...data})
    }

    if (config.updateComment) {
      // Determine if there is already a comment on this PR from perf-reporter
      const comments = await context.github.issues.getComments(context.issue())
      context.log(process.env.APP_NAME)
      const comment = comments.data.find(comment => comment.user.login === process.env.APP_NAME + '[bot]')

      // If there is, edit that one
      if (comment) {
        opts.comment = comment
        context.log(`Updating comment on: ${owner}/${repo} #${number}`)
        return updateComment(opts)
      }
    }
    
    context.log(`Creating comment on: ${owner}/${repo} #${number}`)
    return newComment(opts)
  }
}

function init(robot) {  
  // Your code here
  robot.log('Yay! The app was loaded!')
  
  commands(robot, 'perf', (context, command) => {
    const url = command.arguments.split(/, */);
    run(context, url)
    return 'OK';
  });  
}

module.exports = init