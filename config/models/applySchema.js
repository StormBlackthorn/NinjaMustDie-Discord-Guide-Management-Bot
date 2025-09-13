const { NMDdb } = require('../../../index.js')
const mongoose = require('mongoose')

const applySchema = new mongoose.Schema({
   channelId: String,
   requiredRank: String,
   notes: String,
   active: Boolean,
   guildId: String,
   role: String,
})

module.exports = NMDdb.model('applySchema', applySchema, 'apply')