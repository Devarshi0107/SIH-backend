const mongoose = require('mongoose');

const philatelicItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Stamps', 'Covers', 'Brochures', 'Packs', 'Souvenirs', 'PostalStationery']
  },
  subitem: {
    type: String,
    enum: [
      'MintCommemorativeStamps', 'MintDefinitiveStamps', 'TopMarginalBlock', 'BottomMarginalBlock', 'FullSheet', // Stamps
      'FirstDayCoversAffixed', 'FirstDayCoversBlank', 'FirstDayCoverPack', // Covers
      'InformationBrochureAffixed', 'InformationBrochureBlank', // Brochures
      'AnnualStampPack', 'ChildrenSpecialAnnualStampPack', 'SpecialCollectorsStampPack', // Packs
      'MiniSheet/SouvenirSheet' // Souvenirs
    ],
    validate: {
      validator: function(value) {
        const categoryToSubitems = {
          Stamps: ['MintCommemorativeStamps', 'MintDefinitiveStamps', 'TopMarginalBlock', 'BottomMarginalBlock', 'FullSheet'],
          Covers: ['FirstDayCoversAffixed', 'FirstDayCoversBlank', 'FirstDayCoverPack'],
          Brochures: ['InformationBrochureAffixed', 'InformationBrochureBlank'],
          Packs: ['AnnualStampPack', 'ChildrenSpecialAnnualStampPack', 'SpecialCollectorsStampPack'],
          Souvenirs: ['MiniSheet/SouvenirSheet']
        };
        
        // Check if the current category allows the given subitem
        if (!value) return true; // Allow subitem to be empty for PostalStationery
        return categoryToSubitems[this.category]?.includes(value);
      },
      message: props => `${props.value} is not a valid subitem for the selected category`
    }
  },
  postal_circle: { type: mongoose.Schema.Types.ObjectId, ref: 'PostalCircle', required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  images: [String],
  specifications: {
    year: Number,
    condition: String,
    dimensions: String,
    rarity: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active'
  },
  featured: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PhilatelicItem', philatelicItemSchema);
