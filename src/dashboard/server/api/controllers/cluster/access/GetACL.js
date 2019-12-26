/**
 * @typedef {Object} State
 * @property {import('../../services/cluster')} cluster
 */

/** @type {import('koa').Middleware<State>} */
module.exports = async context => {
  const { cluster } = context.state
  const { identityName } = context.params
  const data = await cluster.GetACL()
  const ret = data.result.filter(ace => ace.identityName === identityName)
  context.body = ret
}
