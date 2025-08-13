const mongoose = require('mongoose');

const productPriceSchema = new mongoose.Schema({
  product: {
    id: { type: String, required: true, unique: true },
    object: { type: String, default: 'product' },
    active: { type: Boolean, default: true },
    attributes: { type: [String], default: [] },
    created: { type: Number, required: true },
    default_price: { type: String, default: null },
    description: { type: String },
    images: { type: [String], default: [] },
    livemode: { type: Boolean, default: false },
    marketing_features: { type: [String], default: [] },
    metadata: {
      assignment: { type: String },
      events: { type: String },
      exams: { type: String },
      quizzes: { type: String }
    },
    name: { type: String, required: true },
    package_dimensions: { type: mongoose.Schema.Types.Mixed, default: null },
    shippable: { type: Boolean, default: null },
    statement_descriptor: { type: String, default: null },
    tax_code: { type: String, default: null },
    type: { type: String, default: 'service' },
    unit_label: { type: String, default: null },
    updated: { type: Number, required: true },
    url: { type: String, default: null }
  },
  priceData: {
    id: { type: String, required: true, unique: true },
    object: { type: String, default: 'price' },
    active: { type: Boolean, default: true },
    billing_scheme: { type: String, default: 'per_unit' },
    created: { type: Number, required: true },
    currency: { type: String, required: true },
    custom_unit_amount: { type: mongoose.Schema.Types.Mixed, default: null },
    livemode: { type: Boolean, default: false },
    lookup_key: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    nickname: { type: String, default: null },
    product: { type: String, required: true },
    recurring: { type: mongoose.Schema.Types.Mixed, default: null },
    tax_behavior: { type: String, default: 'unspecified' },
    tiers_mode: { type: String, default: null },
    transform_quantity: { type: mongoose.Schema.Types.Mixed, default: null },
    type: { type: String, default: 'one_time' },
    unit_amount: { type: Number, required: true },
    unit_amount_decimal: { type: String, required: true }
  }
});

const ProductPrice = mongoose.model('ProductPrice', productPriceSchema);

module.exports = ProductPrice;