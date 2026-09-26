import { LOSS_REASONS, RESPONSE_TYPES } from './data.js';

const isBlank = (v) => v == null || String(v).trim() === '';

export function validateRequirement(draft = {}) {
  const errors = [];
  if (isBlank(draft.agency)) errors.push('Agency or customer is required.');
  if (isBlank(draft.product)) errors.push('Product is required.');
  if (!(Number(draft.quantity) > 0)) errors.push('Quantity must be greater than zero.');
  if (isBlank(draft.submissionDeadline)) errors.push('Submission deadline is required.');
  if (isBlank(draft.requiredDeliveryDate)) errors.push('Required delivery date is required.');
  if (!isBlank(draft.submissionDeadline) && !isBlank(draft.requiredDeliveryDate)) {
    if (draft.requiredDeliveryDate < draft.submissionDeadline) {
      errors.push('Required delivery date cannot fall before the submission deadline.');
    }
  }
  return errors;
}

export function validateOemResponse(draft = {}) {
  const errors = [];
  if (isBlank(draft.requirementId)) errors.push('A requirement is required.');
  if (isBlank(draft.oemId)) errors.push('An OEM is required.');
  if (isBlank(draft.type)) errors.push('Response type is required.');
  else if (!RESPONSE_TYPES.includes(draft.type)) {
    errors.push(`Response type must be one of: ${RESPONSE_TYPES.join(', ')}.`);
  }
  if (!(Number(draft.qty) > 0)) errors.push('Quantity must be greater than zero.');
  if (draft.type === 'firm' && !(Number(draft.unitPrice) > 0)) {
    errors.push('A firm commitment needs a unit price greater than zero.');
  }
  if (Number(draft.leadTimeDays) < 0) errors.push('Lead time cannot be negative.');
  return errors;
}

export function validateLoss(draft = {}) {
  const errors = [];
  if (isBlank(draft.requirementId)) errors.push('A requirement is required.');
  if (isBlank(draft.reason)) errors.push('A structured loss reason is required.');
  else if (!LOSS_REASONS.includes(draft.reason)) {
    errors.push(`Loss reason must be one of: ${LOSS_REASONS.join(', ')}.`);
  }
  if (isBlank(draft.note)) errors.push('A short note is required, so the reason can be understood later.');
  else if (String(draft.note).trim().length < 8) errors.push('The note is too short to be useful (at least 8 characters).');
  return errors;
}

export function validatePayment(draft = {}, invoice = null, alreadyPaid = 0) {
  const errors = [];
  if (isBlank(draft.invoiceId)) errors.push('An invoice is required.');
  const amount = Number(draft.amount);
  if (!(amount > 0)) errors.push('Payment amount must be greater than zero.');
  if (isBlank(draft.paidAt)) errors.push('Payment date is required.');
  if (invoice && amount > 0) {
    const outstanding = Number(invoice.amount) - Number(alreadyPaid || 0);
    if (amount > outstanding) {
      errors.push(`Amount exceeds the outstanding balance of ${outstanding}.`);
    }
  }
  return errors;
}

export function validateDocument(draft = {}) {
  const errors = [];
  if (isBlank(draft.type)) errors.push('Document type is required.');
  if (isBlank(draft.title)) errors.push('Document title is required.');
  if (isBlank(draft.issueDate)) errors.push('Issue date is required.');
  if (isBlank(draft.expiryDate)) errors.push('Expiry date is required.');
  if (!isBlank(draft.issueDate) && !isBlank(draft.expiryDate) && draft.expiryDate <= draft.issueDate) {
    errors.push('Expiry date must be after the issue date.');
  }
  return errors;
}

// Every PO must map to an approved quote. This is the guard, not just a check.
export function validateOrder(draft = {}, state = null) {
  const errors = [];
  if (isBlank(draft.orderNumber)) errors.push('PO number is required.');
  if (isBlank(draft.oemId)) errors.push('An OEM is required.');
  if (!(Number(draft.quantity) > 0)) errors.push('Quantity must be greater than zero.');
  if (!(Number(draft.unitPrice) > 0)) errors.push('Unit price must be greater than zero.');
  if (isBlank(draft.deliveryDeadline)) errors.push('Delivery deadline is required.');

  if (isBlank(draft.quoteId)) {
    errors.push('A PO cannot be created without an approved quote.');
  } else if (state) {
    const quote = (state.quotes || []).find((q) => q.id === draft.quoteId);
    if (!quote) errors.push('The referenced quote does not exist.');
    else if (quote.state !== 'approved') errors.push(`The quote is "${quote.state}"; only an approved quote can become a PO.`);
    else if (draft.requirementId && quote.requirementId !== draft.requirementId) {
      errors.push('The approved quote belongs to a different requirement.');
    }
  }
  return errors;
}

export function validateQuote(draft = {}) {
  const errors = [];
  if (isBlank(draft.requirementId)) errors.push('Every quotation comes from an RFI: a requirement is required.');
  if (!(Number(draft.quotedTotal) >= 0)) errors.push('Quoted total must be zero or greater.');
  if (!(Number(draft.targetMarginPct) >= 0)) errors.push('Target margin must be zero or greater.');
  return errors;
}

// Acceptance closes the balance on a delivery, so it needs a real delivery and date.
export function validateAcceptance(draft = {}, state = null) {
  const errors = [];
  if (isBlank(draft.deliveryId)) errors.push('A delivery is required.');
  if (isBlank(draft.acceptedAt)) errors.push('An acceptance date is required.');
  if (state) {
    const delivery = (state.deliveries || []).find((d) => d.id === draft.deliveryId);
    if (!delivery) errors.push('The delivery does not exist.');
    else if (delivery.acceptedAt) errors.push('This delivery is already accepted.');
    else if (!isBlank(draft.acceptedAt) && delivery.deliveredAt && draft.acceptedAt < delivery.deliveredAt) {
      errors.push('Acceptance cannot fall before the delivery date.');
    }
  }
  return errors;
}
