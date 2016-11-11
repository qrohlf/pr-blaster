const request = require('request')

module.exports = ({owner, repo, pr, user, token, commentText}) => {
  const auth = {user, pass: token}

  // token-authenticated JSON request to github
  const hubRequest = (url, options) => {
    return new Promise((resolve, reject) => {
      const headers = {'User-Agent': 'ridebot'}
      try {
        request(url, Object.assign({}, {auth, headers, json: true}, options), (err, res, body) => {
          if (err) { reject(err) }
          if (res.statusCode < 200 || res.statusCode > 300) { reject(res) }
          resolve(body)
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  const commentsPath = `https://api.github.com/repos/${owner}/${repo}/issues/${pr}/comments`
  const body = {body: commentText}

  return hubRequest(commentsPath)
    .then(comments => {
      const firstComment = comments.find(c => c.user.login === user)
      if (firstComment) {
        return hubRequest(firstComment.url, {method: 'PATCH', body})
      } else {
        return hubRequest(commentsPath, {method: 'POST', body})
      }
    })
}
