async function newComment ({context, template, data, number, after, before}) {
  // If there is not, create one
  const body = template({data, after, before})
  const issue = { number, body }
  return context.github.issues.createComment(context.repo(issue))
}

module.exports = newComment