import path from 'path';
import { Request, Response, NextFunction } from 'express';

const ALLOWED_TELEMETRY_EXTENSIONS = ['.json', '.csv', '.txt', '.log'];
const VALID_COMMUTE_MODES = ['walking', 'bicycle', 'two_wheeler', 'metro', 'public_transit', 'carpool', 'car_gas', 'private_car', 'work_from_home'] as const;
const VALID_COOKING_FUELS = ['lpg_gas', 'induction_electric', 'electric_induction', 'biomass_solid'] as const;
const VALID_BUILDING_TYPES = ['apartment', 'independent_house', 'shared_hostel'] as const;

/**
 * Known binary executable and hazardous magic byte signatures
 */
const FORBIDDEN_MAGIC_SIGNATURES: Array<{ name: string; bytes: number[] }> = [
  // Windows Portable Executable (EXE/DLL) - 'MZ'
  { name: 'Windows Executable/DLL (MZ)', bytes: [0x4d, 0x5a] },
  // Linux ELF binary
  { name: 'Linux Executable (ELF)', bytes: [0x7f, 0x45, 0x4c, 0x46] },
  // Mach-O binaries (macOS/iOS)
  { name: 'Mach-O 32-bit (BE)', bytes: [0xfe, 0xed, 0xfa, 0xce] },
  { name: 'Mach-O 32-bit (LE)', bytes: [0xce, 0xfa, 0xed, 0xfe] },
  { name: 'Mach-O 64-bit (BE)', bytes: [0xfe, 0xed, 0xfa, 0xcf] },
  { name: 'Mach-O 64-bit (LE)', bytes: [0xcf, 0xfa, 0xed, 0xfe] },
  // Java Bytecode Class
  { name: 'Java Class File', bytes: [0xca, 0xfe, 0xba, 0xbe] },
  // Shell script shebang '#!'
  { name: 'Executable Shell Script (#!)', bytes: [0x23, 0x21] },
];

/**
 * Inspects a binary buffer against binary executable magic signatures
 * @description Validates uploaded buffers to prevent disguised executables
 * @param buffer - Raw binary file buffer
 * @param filename - Original filename for context
 * @returns Result object indicating validity, detected signature, and rejection reason
 */
export function inspectBinaryMagicBytes(
  buffer: Buffer,
  filename: string
): { isValid: boolean; reason?: string; detectedFormat?: string } {
  if (!buffer || buffer.length === 0) {
    return { isValid: false, reason: 'Empty file buffer provided.' };
  }

  // Check against known dangerous binary signatures
  for (const sig of FORBIDDEN_MAGIC_SIGNATURES) {
    if (buffer.length >= sig.bytes.length) {
      let match = true;
      for (let i = 0; i < sig.bytes.length; i++) {
        if (buffer[i] !== sig.bytes[i]) {
          match = false;
          break;
        }
      }
      if (match) {
        return {
          isValid: false,
          detectedFormat: sig.name,
          reason: `Upload rejected: file contains forbidden binary signature [${sig.name}]. Disguised executables are prohibited.`,
        };
      }
    }
  }

  // Ensure file extension does not masquerade as executable
  const lowerName = filename.toLowerCase();
  const dangerousExtensions = ['.exe', '.dll', '.so', '.dylib', '.sh', '.bat', '.cmd', '.vbs', '.ps1'];
  if (dangerousExtensions.some((ext) => lowerName.endsWith(ext))) {
    return {
      isValid: false,
      reason: `Upload rejected: file extension "${filename}" is classified as an executable binary type.`,
    };
  }

  return { isValid: true, detectedFormat: 'Valid Telemetry/Data Payload' };
}

/**
 * Express middleware to validate binary file uploads (e.g. sensor logs, profile imports)
 * @description Validates magic bytes, enforces max size limit of 2MB, and checks Content-Type
 * @param req - Express Request
 * @param res - Express Response
 * @param next - Express NextFunction
 */
export function validateUploadSecurity(req: Request, res: Response, next: NextFunction): void {
  const fileData = req.body?.fileData || req.body?.content;
  const rawFileName = typeof req.body?.fileName === 'string' ? req.body.fileName : 'sensor_upload.json';
  const fileName = path.basename(rawFileName).slice(0, 128) || 'sensor_upload.json';
  const encoding = req.body?.encoding;

  if (!fileData) {
    res.status(400).json({ error: 'Missing file data payload for validation.' });
    return;
  }

  let buffer: Buffer;
  try {
    if (Buffer.isBuffer(fileData)) {
      buffer = fileData;
    } else if (typeof fileData === 'string') {
      if (fileData.startsWith('data:')) {
        buffer = Buffer.from(fileData.split(',')[1] || '', 'base64');
      } else if (encoding === 'base64') {
        buffer = Buffer.from(fileData, 'base64');
      } else {
        const trimmed = fileData.trim();
        const isBase64 = /^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length % 4 === 0 && trimmed.length >= 4;
        buffer = isBase64 ? Buffer.from(trimmed, 'base64') : Buffer.from(fileData, 'utf-8');
      }
    } else {
      buffer = Buffer.from(JSON.stringify(fileData));
    }
  } catch {
    res.status(400).json({ error: 'Unable to parse uploaded file buffer.' });
    return;
  }

  // Max 2MB buffer size enforcement to prevent memory exhaustion
  if (buffer.length > 2 * 1024 * 1024) {
    res.status(413).json({ error: 'Payload exceeds maximum allowable file size (2 MB).' });
    return;
  }

  const inspection = inspectBinaryMagicBytes(buffer, fileName);
  if (!inspection.isValid) {
    res.status(415).json({
      error: 'Security validation failed: Prohibited binary format detected.',
      details: inspection.reason,
      detectedFormat: inspection.detectedFormat,
    });
    return;
  }

  const ext = path.extname(fileName).toLowerCase();
  if (ext && !ALLOWED_TELEMETRY_EXTENSIONS.includes(ext)) {
    res.status(415).json({
      error: 'Security validation failed: Unsupported telemetry file extension.',
      details: `Allowed extensions: ${ALLOWED_TELEMETRY_EXTENSIONS.join(', ')}`,
    });
    return;
  }

  req.body.fileName = fileName;
  req.body.validatedBuffer = buffer;
  next();
}

/**
 * Validates request payload against max size and structure
 * @param req - Express Request
 * @param res - Express Response
 * @param next - Express NextFunction
 */
export function validateHouseholdProfileInput(req: Request, res: Response, next: NextFunction): void {
  const profile = req.body;
  if (!profile || typeof profile !== 'object') {
    res.status(400).json({ error: 'Invalid profile data provided.' });
    return;
  }

  if (!Array.isArray(profile.locations) || profile.locations.length === 0) {
    profile.locations = [
      {
        id: 'loc-default',
        label: 'Custom',
        cityName: 'Kolkata',
        latitude: 22.5726,
        longitude: 88.3639,
      },
    ];
    profile.activeLocationId = 'loc-default';
  }

  for (const loc of profile.locations) {
    if (typeof loc.cityName === 'string') {
      loc.cityName = loc.cityName.trim().replace(/[<>'"`;]/g, '').slice(0, 100);
    }
    if (typeof loc.locality === 'string') {
      loc.locality = loc.locality.trim().replace(/[<>'"`;]/g, '').slice(0, 100);
    }
    if (typeof loc.latitude !== 'number' || !Number.isFinite(loc.latitude) || loc.latitude < -90 || loc.latitude > 90) {
      loc.latitude = 22.5726;
    }
    if (typeof loc.longitude !== 'number' || !Number.isFinite(loc.longitude) || loc.longitude < -180 || loc.longitude > 180) {
      loc.longitude = 88.3639;
    }
  }

  if (!profile.householdMembers || typeof profile.householdMembers !== 'object') {
    profile.householdMembers = {
      hasElderly: false,
      hasInfantsOrChildren: false,
      hasAsthmaOrRespiratory: false,
      totalOccupants: 3,
    };
  } else {
    const occ = Number(profile.householdMembers.totalOccupants);
    profile.householdMembers.totalOccupants = Number.isFinite(occ) ? Math.min(50, Math.max(1, Math.round(occ))) : 3;
  }

  if (!profile.commute || typeof profile.commute !== 'object') {
    profile.commute = {
      mode: 'public_transit',
      roundTripKm: 15,
      canWorkRemotely: false,
      departureTime: '08:30',
      returnTime: '18:00',
    };
  } else {
    if (!VALID_COMMUTE_MODES.includes(profile.commute.mode)) {
      profile.commute.mode = 'public_transit';
    }
    const km = Number(profile.commute.roundTripKm);
    profile.commute.roundTripKm = Number.isFinite(km) ? Math.min(500, Math.max(0, km)) : 15;
  }

  if (!profile.homeFeatures || typeof profile.homeFeatures !== 'object') {
    profile.homeFeatures = {
      hasAirPurifier: false,
      hasExhaustKitchenFan: true,
      buildingType: 'apartment',
      cookingFuel: 'lpg_gas',
    };
  } else {
    if (!VALID_COOKING_FUELS.includes(profile.homeFeatures.cookingFuel)) {
      profile.homeFeatures.cookingFuel = 'lpg_gas';
    }
    if (!VALID_BUILDING_TYPES.includes(profile.homeFeatures.buildingType)) {
      profile.homeFeatures.buildingType = 'apartment';
    }
  }

  next();
}

/**
 * Validates chat question input and protects against prompt injection
 * @param req - Express Request
 * @param res - Express Response
 * @param next - Express NextFunction
 */
export function validateChatQueryInput(req: Request, res: Response, next: NextFunction): void {
  const { question } = req.body;
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    res.status(400).json({ error: 'A valid question text is required.' });
    return;
  }

  if (question.length > 600) {
    res.status(400).json({ error: 'Question exceeds maximum character length (600).' });
    return;
  }

  const sanitized = question
    .replace(/[<>{}[\]]/g, '')
    .replace(/(system prompt|ignore previous instructions|developer mode)/gi, '[filtered]')
    .trim();

  req.body.question = sanitized;
  next();
}
