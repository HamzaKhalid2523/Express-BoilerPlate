const redis = require("redis");

const authRedis = redis.createClient();
const cacheRedis = redis.createClient({ db: 1 });

const { promisify } = require("util");

bindingClient(authRedis);
bindingClient(cacheRedis);

function bindingClient(client) {
  const getAsync = promisify(client.get).bind(client);
  const setAsync = promisify(client.set).bind(client);
  const delAsync = promisify(client.del).bind(client);
  const keysAsync = promisify(client.keys).bind(client);

  client.get = getAsync;
  client.set = setAsync;
  client.del = delAsync;
  client.keys = keysAsync;
}
module.exports = { cacheRedis, authRedis };
