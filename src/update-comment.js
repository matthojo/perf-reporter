async function updateComment ({context, template, data, number, comment, after, before}) {
  const body = template({
    data,
    updated: {
      time: new Date().toString(),
      by: context.payload.comment.html_url
    },
    before,
    after
  })

  return context.github.issues.editComment(context.repo({ number, body, id: comment.id }))
}

module.exports = updateComment