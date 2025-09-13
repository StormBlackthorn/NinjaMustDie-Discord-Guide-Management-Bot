const { NMDdb } = require('../../../index.js')
const mongoose = require('mongoose')

const whitelistData = new mongoose.Schema({
   roles: Array,
   users: Array,
   guildId: String
})

module.exports = NMDdb.model('whitelistData', whitelistData, 'whitelist')