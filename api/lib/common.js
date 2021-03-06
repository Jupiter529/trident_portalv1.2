/**
 * requestLog is used to add a custom message to the log statement
 * @param  {req} the request body
 * @param  {status} a custom resolve status
 * @param  {mes} a custom message to be displayed 
 * @return {log} returns a log statement that is appended to the logger
 */
exports.requestLog = function(req, status, mes){
  let url = req.url.slice(0, req.url.indexOf('?'))
  let method = req.method
  let date = new Date().toDateString()
  let message = mes ? mes : ''

  let log = url + ' ' + method + ' ' + status + ' ' + date + ' ' + message
  return log
}
 /**
  * compileLatAndLongArray takes coordinates from an elasticsearch query and
  * filters the longitude values with the corresponding latitude values. 
  * @param  {lat}  latitude 
  * @param  {longArray} an array of longitude values
  * @return {latAndLongArray} returns an array of latitude, 
  *   longitude, and count for each latitude
  */
exports.compileLatAndLongArray = (lat, longArray) => {
  let latAndLongArray = []
  longArray.map((long) => {
    latAndLongArray.push([lat,long.key,long.doc_count])
  })
  return latAndLongArray
}

/**
 * uniqDescOrderedList takes and array of items and filters all of the duplicate
 * items out of the array leaving a unique set.
 * @param  {array}  an array of items
 * @return {newOrder}  returns a new array with only unique values
 */
exports.uniqDescOrderedList = (array) => {
  let newSet = new Set(array.map(e => JSON.stringify(e)))
  let newOrder = Array.from(newSet).map(e => JSON.parse(e))
  newOrder.sort((a, b) => {
    let c
    let d 
    if (a.doc_count) {
      c = a.doc_count
      d = b.doc_count
    } else if (a.timestamp) {
      c = a.timestamp
      d = b.timestamp
    } 
    if(c > d){
      return -1
    }
    if(c < d){
      return 1
    }
    return 0
      
  })
  return newOrder
}

/**
 * validateMiddleware checks that the proper authorization headder
 * is attached to the reqest. If valid returns next()
 * @param  {req}
 * @param  {res}
 * @param  {next}
 */
exports.validateMiddleware = (req, res, next) => {
  var jwt = require('jsonwebtoken')
  if(req.body && req.body.headers){
    req.headers.authorization = req.body.headers.Authorization
  }
	// console.log('inside of validateMiddleware')
  if(!req.headers.authorization){
    console.log('no authorization headers')
    log.error(requestLog(req, 401, 'No Authorization header'))
    res.status(401).send('No Authorization')
  }else if(req.headers.authorization && req.headers.authorization.split(' ')[0] != 'Bearer'){
    console.log('no authorization Bearer')
    log.error(requestLog(req, 401, 'No Authorized Bearer'))
    res.status(401).send('Not Authorized')
  }else if(req.headers.authorization.split(' ')[1]){
    let token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
      if(err){
        console.log('Not Authorized Invalid token')
        log.error(requestLog(req, 401, 'Not Authorized Invalid token'))
        res.status(401).send('Not Authorized')
      } else if(decoded){
        next()
      }
    })
  }
}

/**
 * validateEmail checks for a valid email string
 * @param  {email}  email string
 * @return {boolean}  returns true if email syntax is correct
 */
exports.validateEmail = (email) => {
  var re = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
  return re.test(email);
}