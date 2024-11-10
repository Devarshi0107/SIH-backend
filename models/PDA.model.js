// models/PDA.js
const mongoose = require('mongoose');

const pdaSchema = new mongoose.Schema({
  account_number: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postal_circle: { type: mongoose.Schema.Types.ObjectId, ref: 'PostalCircle', required: true },
  balance: { type: Number, default: 0 },
  preferences: {
    item_types: [String],
    notification_preferences: {
      email: Boolean,
      sms: Boolean
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  philatelicInventory: {
    MintCommemorativeStamps: { type: Number, default: 0 },
    MintDefinitiveStamps: { type: Number, default: 0 },
    TopMarginalBlock: { type: Number, default: 0 },
    BottomMarginalBlock: { type: Number, default: 0 },
    FullSheet: { type: Number, default: 0 },
    FirstDayCoversAffixed: { type: Number, default: 0 },
    FirstDayCoversBlank: { type: Number, default: 0 },
    InformationBrochureAffixed: { type: Number, default: 0 },
    InformationBrochureBlank: { type: Number, default: 0 },
    AnnualStampPack: { type: Number, default: 0 },
    ChildrenSpecialAnnualStampPack: { type: Number, default: 0 },
    SpecialCollectorsStampPack: { type: Number, default: 0 },
    FirstDayCoverPack: { type: Number, default: 0 },
    MiniSheetSouvenirSheet: { type: Number, default: 0 },
    PostalStationery: { type: Number, default: 0 },
    OtherItems: { type: String }
  },
  lastUpdated: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PDA', pdaSchema);
