const { createHash } = require('crypto')

const config = require('config')
const jwt = require('jsonwebtoken')
const fetch = require('node-fetch')

const Service = require('./service')
const Cluster = require('./cluster')

const sign = config.get('sign')
// const winbind = config.get('winbind')
const masterToken = config.get('masterToken')
const clusterIds = Object.keys(config.get('clusters'))

class User extends Service {
  /**
   * @param {import('koa').Context} context
   * @param {string} openId
   * @param {string} group
   */
  constructor(context, openId, group) {
    super(context)
    this.openId = openId
    this.group = group
  }

  /**
   * @param {import('koa').Context} context
   * @param {object} idToken
   * @return {User}
   */
  static fromIdToken(context, idToken) {
    const user = new User(context, idToken['email'], 'Microsoft')
    user.nickName = idToken['name']
    return user
  }

  /**
   * @param {import('koa').Context} context
   * @param {object} userinfo
   * @return {User}
   */
  static fromDingtalk(context, userinfo) {
    const user = new User(context, userinfo['openid'], 'DingTalk')
    user.nickName = userinfo['nick']
    return user
  }

  /**
   * @param {import('koa').Context} context
   * @param {String} openId
   * @return {User}
   */
  static fromZjlab(context, zjlabId) {
    const user = new User(context, `ZJ${zjlabId}`, 'Zjlab')
    user.nickName = `User ${zjlabId}`
    return user
  }

  /**
   * @param {import('koa').Context} context
   * @param {object} idToken
   * @return {User}
   */
  static fromToken(context, openId, group, token) {
    const user = new User(context, openId, group)
    const expectedToken = user.token
    const actualToken = Buffer.from(token, 'hex')
    context.assert(expectedToken.equals(actualToken), 403, 'Invalid token')

    return user
  }

  /**
   * @param {import('koa').Context} context
   * @param {string} token
   * @return {User}
   */
  static fromCookie(context, token) {
    const payload = jwt.verify(token, sign)
    const user = new User(context, payload['openId'], payload['group'])

    user.uid = payload['uid']
    user.nickName = payload['nickName']
    user.userName = payload['userName']
    user.password = payload['password']
    user.isAdmin = payload['isAdmin']
    return user
  }

  get token() {
    if (this._token == null) {
      const hash = createHash('md5')
      hash.update(`${this.userName}:${masterToken}`)
      this._token = hash.digest()
    }
    return this._token
  }

  async fillIdFromWinbind() {
    const params = new URLSearchParams({ userName: this.userName })
    const url = `${winbind}/domaininfo/GetUserId?${params}`
    this.context.log.info({ url }, 'Winbind request')
    const response = await fetch(url)
    const data = await response.json()
    this.context.log.info({ data }, 'Winbind response')

    this.uid = data['uid']
    this.gid = data['gid']
    return data
  }

  async addUserToCluster(data) {
    // Fix groups format
    if (Array.isArray(data['groups'])) {
      data['groups'] = JSON.stringify(data['groups'].map(e => String(e)))
    }
    const params = new URLSearchParams(Object.assign({ userName: this.userName }, data))
    for (const clusterId of clusterIds) {
      new Cluster(this.context, clusterId).fetch('/AddUser?' + params)
    }
  }

  async getAccountInfo() {
    const params = new URLSearchParams(Object.assign({
      openId: this.openId,
      group: this.group,
    }))

    const clusterId = clusterIds[0]
    const response = await new Cluster(this.context, clusterId).fetch('/getAccountInfo?' + params)
    const data = await response.json()
    this.context.log.warn(data, 'getAccountInfo')

    if (data) {
      this.uid = data['uid']
      this.nickName = data['nickName']
      this.userName = data['userName']
      this.password = data['password']
      this.isAdmin = data['isAdmin']
    }
    return data
  }

  async signup(nickName, userName, password) {
    const administrators = config.get('administrators') || []
    const isAdmin = this.group === 'Microsoft' && administrators.includes(this.openId)
    const params = new URLSearchParams(Object.assign({
      openId: this.openId,
      group: this.group,
      nickName: nickName,
      userName: userName,
      password: password,
      isAdmin: isAdmin
    }))
    const clusterId = clusterIds[0]
    const response = await new Cluster(this.context, clusterId).fetch('/SignUp?' + params)
    return await response.json()
  }

  /**
   * @return {string}
   */
  toCookie() {
    // console.log('token is ', this.token)
    return jwt.sign({
      openId: this.openId,
      group: this.group,
      uid: this.uid,
      nickName: this.nickName,
      userName: this.userName,
      password: this.password,
      isAdmin: this.isAdmin
    }, sign)
  }

}

module.exports = User
