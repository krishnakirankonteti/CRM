import { isoDaysFromNow } from './format.js';

const D = (n) => isoDaysFromNow(n);

export const LOSS_REASONS = [
  'Price',
  'Technical non-compliance',
  'Delivery timeline',
  'Competitor preference',
  'Quantity or capacity',
  'Cancelled',
  'Not pursued',
  'Other',
];

export const REQUIREMENT_STATUSES = ['received', 'qualifying', 'quoted', 'submitted', 'won', 'lost', 'cancelled'];

export const POST_SUBMISSION_STATES = [
  'submitted',
  'clarification requested',
  'technical clarification',
  'commercial negotiation',
  'awaiting approval',
  'won',
  'lost',
  'cancelled',
];

export const QUOTE_STATES = ['draft', 'pending approval', 'approved', 'rejected'];

export const FULFILMENT_STEPS = [
  'OEM PO placed',
  'Production started',
  'Production done',
  'PDI scheduled',
  'PDI passed',
  'Government inspection',
  'Dispatch',
  'Delivered',
  'Accepted',
];

export const RESPONSE_TYPES = ['firm', 'availability', 'quote'];

export function createSeed() {
  const oems = [
    {
      id: 'oem-01', name: 'Aureus Defence Systems', city: 'Pune', country: 'India', approved: true,
      products: ['MIL-DTL circular connectors', 'Cable harnesses', 'Backshells'],
      capabilities: ['MIL-DTL-38999', 'MIL-STD-1553 assemblies', 'In-house plating'],
      priceBand: 'Mid', leadTimeDays: 35,
      complianceDocs: ['DGAQA approval', 'ISO 9001:2015', 'MIL-STD test reports'],
      contacts: [{ name: 'S. Kulkarni', email: 'sales@aureus.example', phone: '+91 20 4000 1100' }],
      pastPerformance: [{ summary: 'Navy connector frames FY24', orders: 6, onTimePct: 92 }],
    },
    {
      id: 'oem-02', name: 'Northline Avionics', city: 'Bengaluru', country: 'India', approved: true,
      products: ['Avionics connectors', 'Rugged power modules', 'LRU housings'],
      capabilities: ['AS9100D', 'MIL-STD-704 power', 'Environmental qualification'],
      priceBand: 'Premium', leadTimeDays: 48,
      complianceDocs: ['AS9100D', 'DGQA clearance'],
      contacts: [{ name: 'R. Nair', email: 'contracts@northline.example', phone: '+91 80 4123 9000' }],
      pastPerformance: [{ summary: 'IAF avionics LRU programme', orders: 4, onTimePct: 85 }],
    },
    {
      id: 'oem-03', name: 'Sentinel Optics', city: 'Hyderabad', country: 'India', approved: true,
      products: ['Night vision modules', 'Thermal imaging sights', 'Optical benches'],
      capabilities: ['Image intensifier tubes', 'LWIR cores', 'Boresight calibration'],
      priceBand: 'Premium', leadTimeDays: 60,
      complianceDocs: ['DGQA clearance', 'ISO 9001:2015', 'RoHS'],
      contacts: [{ name: 'P. Reddy', email: 'defence@sentineloptics.example', phone: '+91 40 2988 4400' }],
      pastPerformance: [{ summary: 'DRDO thermal sight batches', orders: 9, onTimePct: 78 }],
    },
    {
      id: 'oem-04', name: 'Vajra Composites', city: 'Chennai', country: 'India', approved: false,
      products: ['Ballistic helmets', 'Composite panels', 'Armour inserts'],
      capabilities: ['NII Level IIIA', 'Autoclave curing'],
      priceBand: 'Mid', leadTimeDays: 42,
      complianceDocs: ['NII test reports (pending renewal)'],
      contacts: [{ name: 'M. Srinivasan', email: 'projects@vajra.example', phone: '+91 44 2255 7700' }],
      pastPerformance: [{ summary: 'Helmet prototypes for state police', orders: 2, onTimePct: 60 }],
    },
    {
      id: 'oem-05', name: 'Meridian Power', city: 'Noida', country: 'India', approved: true,
      products: ['Rugged tactical power supplies', 'DC-DC converters', 'Battery chargers'],
      capabilities: ['MIL-STD-1275', 'MIL-STD-461 EMC', 'Wide-temperature operation'],
      priceBand: 'Mid', leadTimeDays: 38,
      complianceDocs: ['MIL-STD-1275 report', 'ISO 9001:2015'],
      contacts: [{ name: 'A. Bhatia', email: 'sales@meridianpower.example', phone: '+91 120 455 2000' }],
      pastPerformance: [{ summary: 'Army power supply frames', orders: 7, onTimePct: 88 }],
    },
    {
      id: 'oem-06', name: 'Kestrel Communications', city: 'Pune', country: 'India', approved: true,
      products: ['Encrypted VHF radios', 'Tactical antennas', 'Software-defined radios'],
      capabilities: ['SDR waveform integration', 'Crypto module handling'],
      priceBand: 'Premium', leadTimeDays: 55,
      complianceDocs: ['DGQA clearance', 'ACS approval'],
      contacts: [{ name: 'V. Deshpande', email: 'gov@kestrelcomms.example', phone: '+91 20 6712 3300' }],
      pastPerformance: [{ summary: 'Coast Guard VHF sets', orders: 3, onTimePct: 90 }],
    },
    {
      id: 'oem-07', name: 'Orion Cable Works', city: 'Vadodara', country: 'India', approved: true,
      products: ['MIL-STD cable harnesses', 'Field communication cables', 'Cable assemblies'],
      capabilities: ['MIL-STD-681', 'High-volume extrusion', 'Overbraiding'],
      priceBand: 'Economy', leadTimeDays: 28,
      complianceDocs: ['ISO 9001:2015', 'MIL-STD test reports'],
      contacts: [{ name: 'H. Patel', email: 'orders@orioncable.example', phone: '+91 265 234 8800' }],
      pastPerformance: [{ summary: 'BSF cable frames FY24', orders: 11, onTimePct: 94 }],
    },
    {
      id: 'oem-08', name: 'Trident Rugged Systems', city: 'Ahmedabad', country: 'India', approved: true,
      products: ['Rugged tablets', 'Field displays', 'Rugged enclosures'],
      capabilities: ['IP65 sealing', 'Sunlight-readable bonding', 'MIL-STD-810G'],
      priceBand: 'Mid', leadTimeDays: 40,
      complianceDocs: ['MIL-STD-810G report', 'ISO 9001:2015'],
      contacts: [{ name: 'J. Shah', email: 'sales@tridentrugged.example', phone: '+91 79 4020 6600' }],
      pastPerformance: [{ summary: 'Rugged tablet pilots', orders: 2, onTimePct: 70 }],
    },
    {
      id: 'oem-09', name: 'Helios Drives', city: 'Coimbatore', country: 'India', approved: false,
      products: ['Drone flight controllers', 'ESC modules', 'Actuators'],
      capabilities: ['Small-batch electronics', 'Firmware integration'],
      priceBand: 'Economy', leadTimeDays: 32,
      complianceDocs: ['ISO 9001:2015 (submitted)'],
      contacts: [{ name: 'K. Raja', email: 'hello@heliosdrives.example', phone: '+91 422 300 4400' }],
      pastPerformance: [{ summary: 'Drone component trials', orders: 1, onTimePct: 50 }],
    },
    {
      id: 'oem-10', name: 'Bluewave Sonar', city: 'Kochi', country: 'India', approved: true,
      products: ['Sonar cable assemblies', 'Sonar transducer spares', 'Hydrophone arrays'],
      capabilities: ['Acoustic calibration', 'Marine-grade sealing'],
      priceBand: 'Premium', leadTimeDays: 58,
      complianceDocs: ['DGQA clearance', 'Navy test reports'],
      contacts: [{ name: 'T. George', email: 'projects@bluewavesonar.example', phone: '+91 484 266 1700' }],
      pastPerformance: [{ summary: 'Navy sonar refit FY24', orders: 5, onTimePct: 80 }],
    },
  ];

  const requirements = [
    {
      id: 'req-018', ref: 'REQ-2024-018', agency: 'Indian Army', product: 'Rugged tactical power supplies',
      category: 'Power', quantity: 500, unit: 'nos', status: 'submitted', owner: 'Neha Iyer',
      createdAt: D(-16), submissionDeadline: D(-5), quotedTotal: 2400000, targetMarginPct: 18,
      requiredDeliveryDate: D(21),
      specs: 'MIL-STD-1275E input, MIL-STD-461 EMC, -20 to +55 C, 28 V DC, 500 W continuous.',
      lineItems: [
        { id: 'li-018-1', partNo: 'MP-PS-500-28', description: '500 W rugged power supply, 28 V', qty: 250, unit: 'nos', unitPrice: 4800 },
        { id: 'li-018-2', partNo: 'MP-PS-500-28C', description: '500 W power supply with charger', qty: 150, unit: 'nos', unitPrice: 5200 },
        { id: 'li-018-3', partNo: 'MP-CBL-28', description: 'Mating cable set', qty: 100, unit: 'sets', unitPrice: 3000 },
      ],
    },
    {
      id: 'req-017', ref: 'REQ-2024-017', agency: 'Indian Navy', product: 'Sonar cable assemblies',
      category: 'Sonar', quantity: 1200, unit: 'nos', status: 'won', owner: 'Ram Prasad',
      createdAt: D(-58), submissionDeadline: D(-40), quotedTotal: 11040000, targetMarginPct: 22,
      requiredDeliveryDate: D(9), decisionAt: D(-33),
      specs: 'Marine-grade sonar cable assemblies, pressure-rated connectors, 30 m lengths.',
      lineItems: [
        { id: 'li-017-1', partNo: 'BW-SCA-30', description: 'Sonar cable assembly, 30 m', qty: 800, unit: 'nos', unitPrice: 9200 },
        { id: 'li-017-2', partNo: 'BW-SCA-50', description: 'Sonar cable assembly, 50 m', qty: 400, unit: 'nos', unitPrice: 9600 },
      ],
    },
    {
      id: 'req-016', ref: 'REQ-2024-016', agency: 'DRDO', product: 'Night vision modules',
      category: 'Optics', quantity: 300, unit: 'nos', status: 'won', owner: 'Ram Prasad',
      createdAt: D(-72), submissionDeadline: D(-55), quotedTotal: 23400000, targetMarginPct: 25,
      requiredDeliveryDate: D(30), decisionAt: D(-48),
      specs: 'Gen-III image intensifier modules, weapon-mountable, MIL-STD-810G.',
      lineItems: [
        { id: 'li-016-1', partNo: 'SO-NV-G3', description: 'Gen-III NV module, weapon mount', qty: 300, unit: 'nos', unitPrice: 78000 },
      ],
    },
    {
      id: 'req-015', ref: 'REQ-2024-015', agency: 'Indian Air Force', product: 'Ballistic helmets',
      category: 'Armour', quantity: 2000, unit: 'nos', status: 'lost', owner: 'Neha Iyer',
      createdAt: D(-64), submissionDeadline: D(-46), quotedTotal: 29000000, targetMarginPct: 15,
      requiredDeliveryDate: D(-2), decisionAt: D(-20),
      lossReason: 'Price', lossNote: 'Quoted 18% above the winning bid; agency took the lower national bid.',
      winningPrice: 23800000,
      specs: 'NII Level IIIA helmets with NVG mount and communication cut.',
      lineItems: [
        { id: 'li-015-1', partNo: 'VC-HLM-IIIA', description: 'Ballistic helmet, NII IIIA', qty: 2000, unit: 'nos', unitPrice: 14500 },
      ],
    },
    {
      id: 'req-014', ref: 'REQ-2024-014', agency: 'Indian Coast Guard', product: 'Encrypted VHF radios',
      category: 'Comms', quantity: 150, unit: 'nos', status: 'submitted', owner: 'Neha Iyer',
      createdAt: D(-22), submissionDeadline: D(-8), quotedTotal: 29250000, targetMarginPct: 20,
      requiredDeliveryDate: D(12),
      specs: 'Encrypted VHF tactical sets with ACS-approved crypto module, 30 km range.',
      lineItems: [
        { id: 'li-014-1', partNo: 'KC-VHF-ENC', description: 'Encrypted VHF radio set', qty: 150, unit: 'nos', unitPrice: 195000 },
      ],
    },
    {
      id: 'req-013', ref: 'REQ-2024-013', agency: 'BSF', product: 'Rugged tablets',
      category: 'Rugged compute', quantity: 400, unit: 'nos', status: 'lost', owner: 'Neha Iyer',
      createdAt: D(-50), submissionDeadline: D(-35), quotedTotal: 24800000, targetMarginPct: 16,
      requiredDeliveryDate: D(5), decisionAt: D(-12),
      lossReason: 'Technical non-compliance', lossNote: 'Offered unit failed the sunlight-readability clause of the spec.',
      winningPrice: 25200000,
      specs: 'IP65 rugged tablets, 1000-nit display, MIL-STD-810G, in-vehicle docking.',
      lineItems: [
        { id: 'li-013-1', partNo: 'TR-TAB-10', description: '10 in rugged tablet, 1000 nit', qty: 400, unit: 'nos', unitPrice: 62000 },
      ],
    },
    {
      id: 'req-012', ref: 'REQ-2024-012', agency: 'Indian Army', product: 'MIL-STD cable harnesses',
      category: 'Cables', quantity: 5000, unit: 'nos', status: 'won', owner: 'Arun Menon',
      createdAt: D(-88), submissionDeadline: D(-70), quotedTotal: 17000000, targetMarginPct: 18,
      requiredDeliveryDate: D(45), decisionAt: D(-62),
      specs: 'MIL-STD-681 cable harnesses for field shelters, overbraided, various lengths.',
      lineItems: [
        { id: 'li-012-1', partNo: 'OC-CH-2M', description: 'Cable harness, 2 m', qty: 3000, unit: 'nos', unitPrice: 3400 },
        { id: 'li-012-2', partNo: 'OC-CH-5M', description: 'Cable harness, 5 m', qty: 2000, unit: 'nos', unitPrice: 3500 },
      ],
    },
    {
      id: 'req-011', ref: 'REQ-2024-011', agency: 'Ministry of Defence', product: 'Drone flight controller components',
      category: 'Drone', quantity: 800, unit: 'nos', status: 'quoted', owner: 'Ram Prasad',
      createdAt: D(-20), submissionDeadline: D(4), quotedTotal: 16800000, targetMarginPct: 20,
      requiredDeliveryDate: D(40),
      specs: 'Flight controller and ESC module sets for loitering munition trials.',
      lineItems: [
        { id: 'li-011-1', partNo: 'HD-FC-01', description: 'Flight controller board', qty: 500, unit: 'nos', unitPrice: 21000 },
        { id: 'li-011-2', partNo: 'HD-ESC-40', description: '40 A ESC module', qty: 300, unit: 'nos', unitPrice: 21000 },
      ],
    },
    {
      id: 'req-010', ref: 'REQ-2024-010', agency: 'Indian Navy', product: 'Sonar transducer spares',
      category: 'Sonar', quantity: 1200, unit: 'nos', status: 'lost', owner: 'Ram Prasad',
      createdAt: D(-95), submissionDeadline: D(-78), quotedTotal: 11760000, targetMarginPct: 21,
      requiredDeliveryDate: D(-10), decisionAt: D(-30),
      lossReason: 'Delivery timeline', lossNote: 'Best lead time was 58 days against a 30-day requirement.',
      winningPrice: 12100000,
      specs: 'Transducer spares for hull-mounted sonar, direct OEM replacement.',
      lineItems: [
        { id: 'li-010-1', partNo: 'BW-TR-SP', description: 'Transducer spare element', qty: 1200, unit: 'nos', unitPrice: 9800 },
      ],
    },
    {
      id: 'req-009', ref: 'REQ-2024-009', agency: 'DRDO', product: 'Thermal imaging sights',
      category: 'Optics', quantity: 220, unit: 'nos', status: 'submitted', owner: 'Neha Iyer',
      createdAt: D(-18), submissionDeadline: D(-3), quotedTotal: 52800000, targetMarginPct: 24,
      requiredDeliveryDate: D(28),
      specs: 'LWIR thermal sights, 640x480 core, MIL-STD-810G, picatinny mount.',
      lineItems: [
        { id: 'li-009-1', partNo: 'SO-TI-640', description: 'LWIR thermal sight, 640 core', qty: 220, unit: 'nos', unitPrice: 240000 },
      ],
    },
    {
      id: 'req-008', ref: 'REQ-2024-008', agency: 'Indian Air Force', product: 'Avionics circular connectors',
      category: 'Connectors', quantity: 3000, unit: 'nos', status: 'won', owner: 'Arun Menon',
      createdAt: D(-120), submissionDeadline: D(-100), quotedTotal: 19200000, targetMarginPct: 19,
      requiredDeliveryDate: D(-6), decisionAt: D(-92),
      specs: 'MIL-DTL-38999 series III connectors for avionics bays.',
      lineItems: [
        { id: 'li-008-1', partNo: 'NL-38999-3', description: 'MIL-DTL-38999 connector', qty: 3000, unit: 'nos', unitPrice: 6400 },
      ],
    },
    {
      id: 'req-007', ref: 'REQ-2024-007', agency: 'Indian Army', product: 'Armoured vehicle spares',
      category: 'Vehicles', quantity: 120, unit: 'nos', status: 'lost', owner: 'Arun Menon',
      createdAt: D(-80), submissionDeadline: D(-62), quotedTotal: 6960000, targetMarginPct: 17,
      requiredDeliveryDate: D(10), decisionAt: D(-40),
      lossReason: 'Competitor preference', lossNote: 'Incumbent supplier retained on a repeat order.',
      winningPrice: 6800000,
      specs: 'Suspension and drive spares for armoured personnel carriers.',
      lineItems: [
        { id: 'li-007-1', partNo: 'AV-SUS-KIT', description: 'Suspension overhaul kit', qty: 120, unit: 'nos', unitPrice: 58000 },
      ],
    },
    {
      id: 'req-006', ref: 'REQ-2024-006', agency: 'BSF', product: 'Field communication cables',
      category: 'Cables', quantity: 2500, unit: 'nos', status: 'won', owner: 'Arun Menon',
      createdAt: D(-70), submissionDeadline: D(-54), quotedTotal: 7250000, targetMarginPct: 15,
      requiredDeliveryDate: D(26), decisionAt: D(-46),
      specs: 'Field-deployable communication cables, 100 m drums, waterproof.',
      lineItems: [
        { id: 'li-006-1', partNo: 'OC-FC-100', description: 'Field cable, 100 m drum', qty: 2500, unit: 'nos', unitPrice: 2900 },
      ],
    },
    {
      id: 'req-005', ref: 'REQ-2024-005', agency: 'Ministry of Defence', product: 'Software-defined tactical radios',
      category: 'Comms', quantity: 90, unit: 'nos', status: 'cancelled', owner: 'Ram Prasad',
      createdAt: D(-45), submissionDeadline: D(-30), quotedTotal: 18900000, targetMarginPct: 20,
      requiredDeliveryDate: D(20), decisionAt: D(-25),
      lossReason: 'Cancelled', lossNote: 'Requirement withdrawn by the agency before submission.',
      specs: 'SDR tactical radios with programmable waveforms.',
      lineItems: [
        { id: 'li-005-1', partNo: 'KC-SDR-01', description: 'SDR tactical radio', qty: 90, unit: 'nos', unitPrice: 210000 },
      ],
    },
    {
      id: 'req-004', ref: 'REQ-2024-004', agency: 'Indian Navy', product: 'MIL-DTL circular connectors',
      category: 'Connectors', quantity: 1000, unit: 'nos', status: 'won', owner: 'Arun Menon',
      createdAt: D(-40), submissionDeadline: D(-22), quotedTotal: 18500000, targetMarginPct: 20,
      requiredDeliveryDate: D(38), decisionAt: D(-14),
      specs: 'MIL-DTL-38999 series III connectors, mixed shell sizes, plating per spec.',
      lineItems: [
        { id: 'li-004-1', partNo: 'AD-38999-11', description: 'Connector shell size 11', qty: 400, unit: 'nos', unitPrice: 18500 },
        { id: 'li-004-2', partNo: 'AD-38999-13', description: 'Connector shell size 13', qty: 350, unit: 'nos', unitPrice: 18500 },
        { id: 'li-004-3', partNo: 'AD-38999-15', description: 'Connector shell size 15', qty: 250, unit: 'nos', unitPrice: 18800 },
      ],
    },
  ];

  const oemRequests = [
    { id: 'rq-001', requirementId: 'req-004', lineItemId: null, oemId: 'oem-01', type: 'firm', qty: 600, unitPrice: 18500, leadTimeDays: 35, status: 'responded', requestedAt: D(-20), respondedAt: D(-17), notes: 'Firm commitment for 600, balance in a second lot possible.' },
    { id: 'rq-002', requirementId: 'req-004', lineItemId: null, oemId: 'oem-07', type: 'firm', qty: 400, unitPrice: 18200, leadTimeDays: 28, status: 'responded', requestedAt: D(-20), respondedAt: D(-18), notes: 'Firm commitment for 400.' },
    { id: 'rq-003', requirementId: 'req-011', lineItemId: null, oemId: 'oem-09', type: 'firm', qty: 600, unitPrice: 20500, leadTimeDays: 32, status: 'responded', requestedAt: D(-12), respondedAt: D(-9), notes: 'Firm for 600 flight controller boards.' },
    { id: 'rq-004', requirementId: 'req-011', lineItemId: null, oemId: 'oem-09', type: 'availability', qty: 200, unitPrice: 21500, leadTimeDays: 40, status: 'responded', requestedAt: D(-12), respondedAt: D(-9), notes: 'Only an indication, not committed. Capacity subject to a parallel programme.' },
    { id: 'rq-005', requirementId: 'req-018', lineItemId: null, oemId: 'oem-05', type: 'firm', qty: 300, unitPrice: 4800, leadTimeDays: 38, status: 'responded', requestedAt: D(-11), respondedAt: D(-8), notes: 'Firm for 300 units.' },
    { id: 'rq-006', requirementId: 'req-018', lineItemId: null, oemId: 'oem-02', type: 'quote', qty: 200, unitPrice: 5100, leadTimeDays: 48, status: 'pending', requestedAt: D(-11), respondedAt: null, notes: '' },
    { id: 'rq-007', requirementId: 'req-014', lineItemId: null, oemId: 'oem-06', type: 'firm', qty: 150, unitPrice: 195000, leadTimeDays: 55, status: 'responded', requestedAt: D(-15), respondedAt: D(-13), notes: 'Firm for 150 sets.' },
    { id: 'rq-008', requirementId: 'req-009', lineItemId: null, oemId: 'oem-03', type: 'quote', qty: 220, unitPrice: 240000, leadTimeDays: 60, status: 'pending', requestedAt: D(-9), respondedAt: null, notes: '' },
    { id: 'rq-009', requirementId: 'req-009', lineItemId: null, oemId: 'oem-02', type: 'quote', qty: 0, unitPrice: 0, leadTimeDays: 0, status: 'pending', requestedAt: D(-4), respondedAt: null, notes: '' },
    { id: 'rq-010', requirementId: 'req-016', lineItemId: null, oemId: 'oem-03', type: 'firm', qty: 300, unitPrice: 78000, leadTimeDays: 60, status: 'responded', requestedAt: D(-60), respondedAt: D(-56), notes: 'Firm for 300 modules.' },
    { id: 'rq-011', requirementId: 'req-017', lineItemId: null, oemId: 'oem-10', type: 'firm', qty: 1200, unitPrice: 9200, leadTimeDays: 58, status: 'responded', requestedAt: D(-44), respondedAt: D(-40), notes: 'Firm for full quantity.' },
    { id: 'rq-012', requirementId: 'req-012', lineItemId: null, oemId: 'oem-07', type: 'firm', qty: 3000, unitPrice: 3400, leadTimeDays: 28, status: 'responded', requestedAt: D(-66), respondedAt: D(-62), notes: 'Firm for 3000 harnesses.' },
    { id: 'rq-013', requirementId: 'req-012', lineItemId: null, oemId: 'oem-01', type: 'firm', qty: 2000, unitPrice: 3500, leadTimeDays: 35, status: 'responded', requestedAt: D(-66), respondedAt: D(-63), notes: 'Firm for the 5 m harnesses.' },
    { id: 'rq-014', requirementId: 'req-008', lineItemId: null, oemId: 'oem-02', type: 'firm', qty: 3000, unitPrice: 6400, leadTimeDays: 48, status: 'responded', requestedAt: D(-104), respondedAt: D(-100), notes: 'Firm for 3000 connectors.' },
    { id: 'rq-015', requirementId: 'req-006', lineItemId: null, oemId: 'oem-07', type: 'firm', qty: 2500, unitPrice: 2900, leadTimeDays: 28, status: 'responded', requestedAt: D(-58), respondedAt: D(-54), notes: 'Firm for 2500 drums.' },
    { id: 'rq-016', requirementId: 'req-015', lineItemId: null, oemId: 'oem-04', type: 'quote', qty: 2000, unitPrice: 14500, leadTimeDays: 42, status: 'responded', requestedAt: D(-56), respondedAt: D(-52), notes: 'Indicative quote only; capacity not committed.' },
    { id: 'rq-017', requirementId: 'req-010', lineItemId: null, oemId: 'oem-10', type: 'firm', qty: 1200, unitPrice: 9800, leadTimeDays: 58, status: 'responded', requestedAt: D(-80), respondedAt: D(-76), notes: 'Firm, but 58-day lead time.' },
    { id: 'rq-018', requirementId: 'req-013', lineItemId: null, oemId: 'oem-08', type: 'quote', qty: 400, unitPrice: 62000, leadTimeDays: 40, status: 'responded', requestedAt: D(-42), respondedAt: D(-38), notes: 'Indicative; display brightness not confirmed.' },
    { id: 'rq-019', requirementId: 'req-011', lineItemId: null, oemId: 'oem-09', type: 'availability', qty: 0, unitPrice: 0, leadTimeDays: 0, status: 'pending', requestedAt: D(-6), respondedAt: null, notes: '' },
    { id: 'rq-020', requirementId: 'req-014', lineItemId: null, oemId: 'oem-02', type: 'availability', qty: 0, unitPrice: 0, leadTimeDays: 0, status: 'pending', requestedAt: D(-2), respondedAt: null, notes: '' },
  ];

  const quotes = [
    { id: 'qt-004', requirementId: 'req-004', version: 1, state: 'approved', createdAt: D(-16), sentAt: D(-14), approvedBy: 'Ram Prasad', approvedAt: D(-14), targetMarginPct: 20, quotedTotal: 18500000, lines: [{ lineItemId: 'li-004-1', oemId: 'oem-01', oemPrice: 18500, leadTimeDays: 35 }] },
    { id: 'qt-006', requirementId: 'req-006', version: 1, state: 'approved', createdAt: D(-49), sentAt: D(-46), approvedBy: 'Ram Prasad', approvedAt: D(-46), targetMarginPct: 15, quotedTotal: 7250000, lines: [{ lineItemId: 'li-006-1', oemId: 'oem-07', oemPrice: 2900, leadTimeDays: 28 }] },
    { id: 'qt-007', requirementId: 'req-007', version: 1, state: 'rejected', createdAt: D(-44), sentAt: D(-40), approvedBy: 'Ram Prasad', approvedAt: D(-42), targetMarginPct: 17, quotedTotal: 6960000, lines: [{ lineItemId: 'li-007-1', oemId: 'oem-01', oemPrice: 58000, leadTimeDays: 35 }] },
    { id: 'qt-008', requirementId: 'req-008', version: 1, state: 'approved', createdAt: D(-96), sentAt: D(-92), approvedBy: 'Ram Prasad', approvedAt: D(-92), targetMarginPct: 19, quotedTotal: 19200000, lines: [{ lineItemId: 'li-008-1', oemId: 'oem-02', oemPrice: 6400, leadTimeDays: 48 }] },
    { id: 'qt-009', requirementId: 'req-009', version: 1, state: 'draft', createdAt: D(-7), sentAt: null, approvedBy: null, approvedAt: null, targetMarginPct: 24, quotedTotal: 52800000, lines: [{ lineItemId: 'li-009-1', oemId: 'oem-03', oemPrice: 240000, leadTimeDays: 60 }] },
    { id: 'qt-010', requirementId: 'req-010', version: 2, state: 'rejected', createdAt: D(-34), sentAt: D(-30), approvedBy: 'Ram Prasad', approvedAt: D(-32), targetMarginPct: 21, quotedTotal: 11760000, lines: [{ lineItemId: 'li-010-1', oemId: 'oem-10', oemPrice: 9800, leadTimeDays: 58 }] },
    { id: 'qt-011', requirementId: 'req-011', version: 1, state: 'draft', createdAt: D(-6), sentAt: null, approvedBy: null, approvedAt: null, targetMarginPct: 20, quotedTotal: 16800000, lines: [{ lineItemId: 'li-011-1', oemId: 'oem-09', oemPrice: 20500, leadTimeDays: 32 }] },
    { id: 'qt-012', requirementId: 'req-012', version: 2, state: 'approved', createdAt: D(-64), sentAt: D(-62), approvedBy: 'Ram Prasad', approvedAt: D(-62), targetMarginPct: 18, quotedTotal: 17000000, lines: [{ lineItemId: 'li-012-1', oemId: 'oem-07', oemPrice: 3400, leadTimeDays: 28 }] },
    { id: 'qt-013', requirementId: 'req-013', version: 1, state: 'rejected', createdAt: D(-40), sentAt: D(-35), approvedBy: 'Ram Prasad', approvedAt: D(-37), targetMarginPct: 16, quotedTotal: 24800000, lines: [{ lineItemId: 'li-013-1', oemId: 'oem-08', oemPrice: 62000, leadTimeDays: 40 }] },
    { id: 'qt-014', requirementId: 'req-014', version: 2, state: 'pending approval', createdAt: D(-10), sentAt: null, approvedBy: null, approvedAt: null, targetMarginPct: 20, quotedTotal: 29250000, lines: [{ lineItemId: 'li-014-1', oemId: 'oem-06', oemPrice: 195000, leadTimeDays: 55 }] },
    { id: 'qt-015', requirementId: 'req-015', version: 2, state: 'rejected', createdAt: D(-50), sentAt: D(-46), approvedBy: 'Ram Prasad', approvedAt: D(-48), targetMarginPct: 15, quotedTotal: 29000000, lines: [{ lineItemId: 'li-015-1', oemId: 'oem-04', oemPrice: 14500, leadTimeDays: 42 }] },
    { id: 'qt-016', requirementId: 'req-016', version: 1, state: 'approved', createdAt: D(-56), sentAt: D(-52), approvedBy: 'Ram Prasad', approvedAt: D(-48), targetMarginPct: 25, quotedTotal: 23400000, lines: [{ lineItemId: 'li-016-1', oemId: 'oem-03', oemPrice: 78000, leadTimeDays: 60 }] },
    { id: 'qt-017', requirementId: 'req-017', version: 2, state: 'approved', createdAt: D(-44), sentAt: D(-40), approvedBy: 'Ram Prasad', approvedAt: D(-33), targetMarginPct: 22, quotedTotal: 11040000, lines: [{ lineItemId: 'li-017-1', oemId: 'oem-10', oemPrice: 9200, leadTimeDays: 58 }] },
    { id: 'qt-018', requirementId: 'req-018', version: 3, state: 'pending approval', createdAt: D(-6), sentAt: null, approvedBy: null, approvedAt: null, targetMarginPct: 18, quotedTotal: 2400000, lines: [{ lineItemId: 'li-018-1', oemId: 'oem-05', oemPrice: 4800, leadTimeDays: 38 }] },
  ];

  const orders = [
    { id: 'po-3001', orderId: 'po-3001', poNumber: 'PO-3001', requirementId: 'req-017', quoteId: 'qt-017', product: 'Sonar cable assemblies', quantity: 1200, unitPrice: 9200, price: 11040000, poDate: D(-30), deliveryDeadline: D(9), oemId: 'oem-10', supplierPo: 'BW/PO/2291', compliance: 'Navy test report', inspectionRequired: true, pdiRequired: true, status: 'part delivered' },
    { id: 'po-3002', orderId: 'po-3002', poNumber: 'PO-3002', requirementId: 'req-016', quoteId: 'qt-016', product: 'Night vision modules', quantity: 300, unitPrice: 78000, price: 23400000, poDate: D(-46), deliveryDeadline: D(30), oemId: 'oem-03', supplierPo: 'SO/PO/1180', compliance: 'DGQA clearance', inspectionRequired: true, pdiRequired: true, status: 'PDI failed' },
    { id: 'po-3003', orderId: 'po-3003', poNumber: 'PO-3003', requirementId: 'req-012', quoteId: 'qt-012', product: 'MIL-STD cable harnesses', quantity: 5000, unitPrice: 3400, price: 17000000, poDate: D(-60), deliveryDeadline: D(45), oemId: 'oem-07', supplierPo: 'OC/PO/8814', compliance: 'MIL-STD test reports', inspectionRequired: false, pdiRequired: true, status: 'in production' },
    { id: 'po-3004', orderId: 'po-3004', poNumber: 'PO-3004', requirementId: 'req-008', quoteId: 'qt-008', product: 'Avionics circular connectors', quantity: 3000, unitPrice: 6400, price: 19200000, poDate: D(-88), deliveryDeadline: D(-6), oemId: 'oem-02', supplierPo: 'NL/PO/4407', compliance: 'AS9100D', inspectionRequired: true, pdiRequired: true, status: 'delivered' },
    { id: 'po-3005', orderId: 'po-3005', poNumber: 'PO-3005', requirementId: 'req-006', quoteId: 'qt-006', product: 'Field communication cables', quantity: 2500, unitPrice: 2900, price: 7250000, poDate: D(-42), deliveryDeadline: D(26), oemId: 'oem-07', supplierPo: 'OC/PO/8902', compliance: 'ISO 9001:2015', inspectionRequired: false, pdiRequired: true, status: 'in production' },
    { id: 'po-3006', orderId: 'po-3006', poNumber: 'PO-3006', requirementId: 'req-004', quoteId: 'qt-004', product: 'MIL-DTL circular connectors', quantity: 1000, unitPrice: 18500, price: 18500000, poDate: D(-12), deliveryDeadline: D(38), oemId: 'oem-01', supplierPo: 'AD/PO/9920', compliance: 'DGAQA approval', inspectionRequired: true, pdiRequired: true, status: 'in production' },
  ];

  const fulfilmentSteps = [
    { id: 'fs-3001-1', orderId: 'po-3001', step: 'OEM PO placed', owner: 'Arun Menon', expectedDate: D(-30), actualDate: D(-30), status: 'done' },
    { id: 'fs-3001-2', orderId: 'po-3001', step: 'Production started', owner: 'Arun Menon', expectedDate: D(-22), actualDate: D(-21), status: 'done' },
    { id: 'fs-3001-3', orderId: 'po-3001', step: 'Production done', owner: 'Arun Menon', expectedDate: D(-10), actualDate: D(-9), status: 'done' },
    { id: 'fs-3001-4', orderId: 'po-3001', step: 'PDI scheduled', owner: 'Arun Menon', expectedDate: D(-7), actualDate: D(-7), status: 'done' },
    { id: 'fs-3001-5', orderId: 'po-3001', step: 'PDI passed', owner: 'Arun Menon', expectedDate: D(-5), actualDate: D(-5), status: 'done' },
    { id: 'fs-3001-6', orderId: 'po-3001', step: 'Government inspection', owner: 'Ram Prasad', expectedDate: D(-2), actualDate: D(-1), status: 'done' },
    { id: 'fs-3001-7', orderId: 'po-3001', step: 'Dispatch', owner: 'Arun Menon', expectedDate: D(2), actualDate: null, status: 'active' },
    { id: 'fs-3001-8', orderId: 'po-3001', step: 'Delivered', owner: 'Arun Menon', expectedDate: D(6), actualDate: null, status: 'pending' },
    { id: 'fs-3001-9', orderId: 'po-3001', step: 'Accepted', owner: 'Ram Prasad', expectedDate: D(14), actualDate: null, status: 'pending' },

    { id: 'fs-3002-1', orderId: 'po-3002', step: 'OEM PO placed', owner: 'Arun Menon', expectedDate: D(-46), actualDate: D(-46), status: 'done' },
    { id: 'fs-3002-2', orderId: 'po-3002', step: 'Production started', owner: 'Arun Menon', expectedDate: D(-36), actualDate: D(-35), status: 'done' },
    { id: 'fs-3002-3', orderId: 'po-3002', step: 'Production done', owner: 'Arun Menon', expectedDate: D(-12), actualDate: D(-11), status: 'done' },
    { id: 'fs-3002-4', orderId: 'po-3002', step: 'PDI scheduled', owner: 'Arun Menon', expectedDate: D(-5), actualDate: D(-5), status: 'done' },
    { id: 'fs-3002-5', orderId: 'po-3002', step: 'PDI passed', owner: 'Arun Menon', expectedDate: D(-4), actualDate: null, status: 'blocked' },
    { id: 'fs-3002-6', orderId: 'po-3002', step: 'Government inspection', owner: 'Ram Prasad', expectedDate: D(4), actualDate: null, status: 'pending' },
    { id: 'fs-3002-7', orderId: 'po-3002', step: 'Dispatch', owner: 'Arun Menon', expectedDate: D(10), actualDate: null, status: 'pending' },
    { id: 'fs-3002-8', orderId: 'po-3002', step: 'Delivered', owner: 'Arun Menon', expectedDate: D(16), actualDate: null, status: 'pending' },
    { id: 'fs-3002-9', orderId: 'po-3002', step: 'Accepted', owner: 'Ram Prasad', expectedDate: D(24), actualDate: null, status: 'pending' },

    { id: 'fs-3003-1', orderId: 'po-3003', step: 'OEM PO placed', owner: 'Arun Menon', expectedDate: D(-60), actualDate: D(-60), status: 'done' },
    { id: 'fs-3003-2', orderId: 'po-3003', step: 'Production started', owner: 'Arun Menon', expectedDate: D(-50), actualDate: D(-48), status: 'done' },
    { id: 'fs-3003-3', orderId: 'po-3003', step: 'Production done', owner: 'Arun Menon', expectedDate: D(-4), actualDate: null, status: 'active' },
    { id: 'fs-3003-4', orderId: 'po-3003', step: 'PDI scheduled', owner: 'Arun Menon', expectedDate: D(2), actualDate: null, status: 'pending' },
    { id: 'fs-3003-5', orderId: 'po-3003', step: 'PDI passed', owner: 'Arun Menon', expectedDate: D(6), actualDate: null, status: 'pending' },
    { id: 'fs-3003-6', orderId: 'po-3003', step: 'Government inspection', owner: 'Ram Prasad', expectedDate: D(14), actualDate: null, status: 'pending' },
    { id: 'fs-3003-7', orderId: 'po-3003', step: 'Dispatch', owner: 'Arun Menon', expectedDate: D(20), actualDate: null, status: 'pending' },
    { id: 'fs-3003-8', orderId: 'po-3003', step: 'Delivered', owner: 'Arun Menon', expectedDate: D(28), actualDate: null, status: 'pending' },
    { id: 'fs-3003-9', orderId: 'po-3003', step: 'Accepted', owner: 'Ram Prasad', expectedDate: D(38), actualDate: null, status: 'pending' },

    { id: 'fs-3004-1', orderId: 'po-3004', step: 'OEM PO placed', owner: 'Arun Menon', expectedDate: D(-88), actualDate: D(-88), status: 'done' },
    { id: 'fs-3004-2', orderId: 'po-3004', step: 'Production started', owner: 'Arun Menon', expectedDate: D(-76), actualDate: D(-75), status: 'done' },
    { id: 'fs-3004-3', orderId: 'po-3004', step: 'Production done', owner: 'Arun Menon', expectedDate: D(-30), actualDate: D(-29), status: 'done' },
    { id: 'fs-3004-4', orderId: 'po-3004', step: 'PDI scheduled', owner: 'Arun Menon', expectedDate: D(-22), actualDate: D(-22), status: 'done' },
    { id: 'fs-3004-5', orderId: 'po-3004', step: 'PDI passed', owner: 'Arun Menon', expectedDate: D(-20), actualDate: D(-20), status: 'done' },
    { id: 'fs-3004-6', orderId: 'po-3004', step: 'Government inspection', owner: 'Ram Prasad', expectedDate: D(-14), actualDate: D(-13), status: 'done' },
    { id: 'fs-3004-7', orderId: 'po-3004', step: 'Dispatch', owner: 'Arun Menon', expectedDate: D(-10), actualDate: D(-10), status: 'done' },
    { id: 'fs-3004-8', orderId: 'po-3004', step: 'Delivered', owner: 'Arun Menon', expectedDate: D(-6), actualDate: D(-6), status: 'done' },
    { id: 'fs-3004-9', orderId: 'po-3004', step: 'Accepted', owner: 'Ram Prasad', expectedDate: D(1), actualDate: null, status: 'active' },

    { id: 'fs-3005-1', orderId: 'po-3005', step: 'OEM PO placed', owner: 'Arun Menon', expectedDate: D(-42), actualDate: D(-42), status: 'done' },
    { id: 'fs-3005-2', orderId: 'po-3005', step: 'Production started', owner: 'Arun Menon', expectedDate: D(-30), actualDate: D(-29), status: 'done' },
    { id: 'fs-3005-3', orderId: 'po-3005', step: 'Production done', owner: 'Arun Menon', expectedDate: D(8), actualDate: null, status: 'active' },
    { id: 'fs-3005-4', orderId: 'po-3005', step: 'PDI scheduled', owner: 'Arun Menon', expectedDate: D(12), actualDate: null, status: 'pending' },
    { id: 'fs-3005-5', orderId: 'po-3005', step: 'PDI passed', owner: 'Arun Menon', expectedDate: D(15), actualDate: null, status: 'pending' },
    { id: 'fs-3005-6', orderId: 'po-3005', step: 'Government inspection', owner: 'Ram Prasad', expectedDate: D(20), actualDate: null, status: 'pending' },
    { id: 'fs-3005-7', orderId: 'po-3005', step: 'Dispatch', owner: 'Arun Menon', expectedDate: D(24), actualDate: null, status: 'pending' },
    { id: 'fs-3005-8', orderId: 'po-3005', step: 'Delivered', owner: 'Arun Menon', expectedDate: D(30), actualDate: null, status: 'pending' },
    { id: 'fs-3005-9', orderId: 'po-3005', step: 'Accepted', owner: 'Ram Prasad', expectedDate: D(38), actualDate: null, status: 'pending' },

    { id: 'fs-3006-1', orderId: 'po-3006', step: 'OEM PO placed', owner: 'Arun Menon', expectedDate: D(-12), actualDate: D(-12), status: 'done' },
    { id: 'fs-3006-2', orderId: 'po-3006', step: 'Production started', owner: 'Arun Menon', expectedDate: D(-5), actualDate: D(-4), status: 'done' },
    { id: 'fs-3006-3', orderId: 'po-3006', step: 'Production done', owner: 'Arun Menon', expectedDate: D(18), actualDate: null, status: 'active' },
    { id: 'fs-3006-4', orderId: 'po-3006', step: 'PDI scheduled', owner: 'Arun Menon', expectedDate: D(22), actualDate: null, status: 'pending' },
    { id: 'fs-3006-5', orderId: 'po-3006', step: 'PDI passed', owner: 'Arun Menon', expectedDate: D(26), actualDate: null, status: 'pending' },
    { id: 'fs-3006-6', orderId: 'po-3006', step: 'Government inspection', owner: 'Ram Prasad', expectedDate: D(30), actualDate: null, status: 'pending' },
    { id: 'fs-3006-7', orderId: 'po-3006', step: 'Dispatch', owner: 'Arun Menon', expectedDate: D(33), actualDate: null, status: 'pending' },
    { id: 'fs-3006-8', orderId: 'po-3006', step: 'Delivered', owner: 'Arun Menon', expectedDate: D(36), actualDate: null, status: 'pending' },
    { id: 'fs-3006-9', orderId: 'po-3006', step: 'Accepted', owner: 'Ram Prasad', expectedDate: D(44), actualDate: null, status: 'pending' },
  ];

  const pdiEvents = [
    { id: 'pdi-3001-1', orderId: 'po-3001', offered: 700, cleared: 700, rejected: 0, scheduledDate: D(-5), status: 'passed', notes: 'First lot cleared by Navy inspection.' },
    { id: 'pdi-3002-1', orderId: 'po-3002', offered: 300, cleared: 0, rejected: 300, scheduledDate: D(-4), status: 'failed', notes: 'Image intensifier gain below spec; full lot rejected. Dispatch blocked.' },
    { id: 'pdi-3003-1', orderId: 'po-3003', offered: 0, cleared: 0, rejected: 0, scheduledDate: D(2), status: 'scheduled', notes: 'PDI slot requested with OEM.' },
    { id: 'pdi-3004-1', orderId: 'po-3004', offered: 3000, cleared: 3000, rejected: 0, scheduledDate: D(-20), status: 'passed', notes: 'Cleared and dispatched.' },
  ];

  const deliveries = [
    { id: 'dlv-3001-1', orderId: 'po-3001', invoiceId: 'inv-5001', qty: 700, deliveredAt: D(-1), acceptedAt: null, status: 'delivered' },
    { id: 'dlv-3004-1', orderId: 'po-3004', invoiceId: 'inv-5002', qty: 3000, deliveredAt: D(-6), acceptedAt: null, status: 'delivered' },
  ];

  const invoices = [
    { id: 'inv-5001', orderId: 'po-3001', number: 'INV-5001', amount: 6624000, issuedAt: D(-2), dueDate: D(28), status: 'part paid' },
    { id: 'inv-5002', orderId: 'po-3004', number: 'INV-5002', amount: 19200000, issuedAt: D(-5), dueDate: D(25), status: 'unpaid' },
    { id: 'inv-5003', orderId: 'po-3003', number: 'INV-5003', amount: 6800000, issuedAt: D(-8), dueDate: D(22), status: 'part paid' },
    { id: 'inv-5004', orderId: 'po-3006', number: 'INV-5004', amount: 5550000, issuedAt: D(-3), dueDate: D(27), status: 'unpaid' },
  ];

  const payments = [
    { id: 'pay-001', invoiceId: 'inv-5001', amount: 3312000, paidAt: D(-1), method: 'RTGS' },
    { id: 'pay-002', invoiceId: 'inv-5003', amount: 2720000, paidAt: D(-4), method: 'RTGS' },
  ];

  const commissions = [
    { id: 'com-001', orderId: 'po-3004', milestone: 'OEM payment received', amount: 1440000, status: 'earned', earnedAt: D(-4) },
    { id: 'com-002', orderId: 'po-3003', milestone: 'OEM payment received', amount: 1020000, status: 'earned', earnedAt: D(-3) },
    { id: 'com-003', orderId: 'po-3001', milestone: 'OEM payment received', amount: 1104000, status: 'pending', earnedAt: null },
    { id: 'com-004', orderId: 'po-3002', milestone: 'OEM payment received', amount: 2340000, status: 'pending', earnedAt: null },
  ];

  const documents = [
    { id: 'doc-001', type: 'Approved item list', title: 'MIL-DTL-38999 approved item list', oemId: 'oem-01', requirementId: null, issueDate: D(-400), expiryDate: D(1460), status: 'valid' },
    { id: 'doc-002', type: 'Compliance certificate', title: 'DGAQA approval - Aureus', oemId: 'oem-01', requirementId: null, issueDate: D(-700), expiryDate: D(18), status: 'expiring' },
    { id: 'doc-003', type: 'ISO certificate', title: 'ISO 9001:2015 - Bluewave Sonar', oemId: 'oem-10', requirementId: null, issueDate: D(-1000), expiryDate: D(-12), status: 'expired' },
    { id: 'doc-004', type: 'NII test report', title: 'NII Level IIIA helmet test report', oemId: 'oem-04', requirementId: 'req-015', issueDate: D(-500), expiryDate: D(365), status: 'valid' },
    { id: 'doc-005', type: 'PDI report', title: 'PDI report - PO-3002 (failed)', oemId: 'oem-03', requirementId: 'req-016', issueDate: D(-4), expiryDate: D(700), status: 'valid' },
    { id: 'doc-006', type: 'PDI report', title: 'PDI report - PO-3001 lot 1', oemId: 'oem-10', requirementId: 'req-017', issueDate: D(-5), expiryDate: D(700), status: 'valid' },
    { id: 'doc-007', type: 'MIL-STD test report', title: 'MIL-STD-1275 report - Meridian', oemId: 'oem-05', requirementId: 'req-018', issueDate: D(-600), expiryDate: D(75), status: 'valid' },
    { id: 'doc-008', type: 'Approved item list', title: 'Sonar spares approved item list', oemId: 'oem-10', requirementId: null, issueDate: D(-1500), expiryDate: D(820), status: 'valid' },
    { id: 'doc-009', type: 'Insurance', title: 'Transit insurance - FY25', oemId: null, requirementId: null, issueDate: D(-200), expiryDate: D(55), status: 'valid' },
    { id: 'doc-010', type: 'DGQA clearance', title: 'DGQA clearance - Kestrel', oemId: 'oem-06', requirementId: null, issueDate: D(-900), expiryDate: D(-40), status: 'expired' },
  ];

  const audit = [
    { id: 'aud-001', at: D(-33), actor: 'Ram Prasad', entity: 'Requirement', entityId: 'req-017', field: 'status', from: 'submitted', to: 'won' },
    { id: 'aud-002', at: D(-14), actor: 'Ram Prasad', entity: 'Quote', entityId: 'qt-004', field: 'state', from: 'pending approval', to: 'approved' },
    { id: 'aud-003', at: D(-12), actor: 'Arun Menon', entity: 'Order', entityId: 'po-3006', field: 'status', from: 'created', to: 'in production' },
    { id: 'aud-004', at: D(-12), actor: 'Neha Iyer', entity: 'OEM response', entityId: 'rq-003', field: 'type', from: 'availability', to: 'firm' },
    { id: 'aud-005', at: D(-8), actor: 'Kavita Rao', entity: 'Invoice', entityId: 'inv-5003', field: 'status', from: 'unpaid', to: 'part paid' },
    { id: 'aud-006', at: D(-4), actor: 'Arun Menon', entity: 'PDI', entityId: 'pdi-3002-1', field: 'status', from: 'scheduled', to: 'failed' },
    { id: 'aud-007', at: D(-4), actor: 'Kavita Rao', entity: 'Commission', entityId: 'com-001', field: 'status', from: 'pending', to: 'earned' },
    { id: 'aud-008', at: D(-2), actor: 'Ram Prasad', entity: 'Requirement', entityId: 'req-005', field: 'status', from: 'qualifying', to: 'cancelled' },
  ];

  return {
    meta: { currency: 'INR', actor: 'Ram Prasad', seededAt: D(0) },
    oems,
    requirements,
    oemRequests,
    quotes,
    orders,
    fulfilmentSteps,
    pdiEvents,
    deliveries,
    invoices,
    payments,
    commissions,
    documents,
    audit,
  };
}
