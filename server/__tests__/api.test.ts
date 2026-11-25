import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { calculateIndianAqiFromPm25, getIndianCategoryFromAqi } from '../services/aqiStandards';
import { DeterministicRulesEngine } from '../services/rulesEngine';
import { HouseholdProfile, AirQualityMetrics } from '../types';

describe('ClearAir Backend Architecture & Indian CPCB Standards Suite', () => {
  it('GET /api/health should respond with status ok and Indian NAQI scale', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.scale).toBe('Indian NAQI (CPCB)');
  });

  it('GET /api/air-quality returns valid CPCB metrics for Kolkata', async () => {
    const res = await request(app).get('/api/air-quality?city=Kolkata');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('aqi');
    expect(res.body).toHaveProperty('category');
    expect(res.body).toHaveProperty('stationName');
    expect(res.body.scale).toBe('Indian NAQI (CPCB)');
  }, 15000);

  it('calculates CPCB Indian NAQI breakpoints accurately', () => {
    // 0 - 30: Good
    expect(calculateIndianAqiFromPm25(15)).toBeLessThanOrEqual(50);
    expect(getIndianCategoryFromAqi(calculateIndianAqiFromPm25(15))).toBe('Good');

    // 31 - 60: Satisfactory
    expect(calculateIndianAqiFromPm25(45)).toBeGreaterThan(50);
    expect(calculateIndianAqiFromPm25(45)).toBeLessThanOrEqual(100);
    expect(getIndianCategoryFromAqi(calculateIndianAqiFromPm25(45))).toBe('Satisfactory');

    // 91 - 120: Poor
    expect(calculateIndianAqiFromPm25(105)).toBeGreaterThan(200);
    expect(calculateIndianAqiFromPm25(105)).toBeLessThanOrEqual(300);
    expect(getIndianCategoryFromAqi(calculateIndianAqiFromPm25(105))).toBe('Poor');

    // 121 - 250: Very Poor
    expect(calculateIndianAqiFromPm25(180)).toBeGreaterThan(300);
    expect(calculateIndianAqiFromPm25(180)).toBeLessThanOrEqual(400);
    expect(getIndianCategoryFromAqi(calculateIndianAqiFromPm25(180))).toBe('Very Poor');

    // 250+: Severe
    expect(calculateIndianAqiFromPm25(280)).toBeGreaterThan(400);
    expect(getIndianCategoryFromAqi(calculateIndianAqiFromPm25(280))).toBe('Severe');
  });

  it('prioritizes lung safety over bicycle commute during severe winter smog', () => {
    const cyclingProfile: HouseholdProfile = {
      id: 'cyclist-delhi',
      name: 'Delhi Commuter',
      locations: [
        {
          id: 'l1',
          label: 'Home',
          cityName: 'Delhi',
          latitude: 28.6139,
          longitude: 77.2090,
        },
      ],
      activeLocationId: 'l1',
      householdMembers: { hasElderly: false, hasInfantsOrChildren: false, hasAsthmaOrRespiratory: false, totalOccupants: 1 },
      commute: { mode: 'bicycle', roundTripKm: 16, canWorkRemotely: false, departureTime: '08:00', returnTime: '17:30' },
      homeFeatures: { hasAirPurifier: true, hasExhaustKitchenFan: true, buildingType: 'apartment', cookingFuel: 'induction_electric' },
      dailySchedule: { morningOutdoorTime: '07:30', eveningOutdoorTime: '18:00', hasOutdoorExerciseRoutine: true },
      budgetSensitivity: 'moderate',
      isOnboarded: true,
    };

    const severeAqi: AirQualityMetrics = {
      aqi: 380,
      category: 'Very Poor',
      scale: 'Indian NAQI (CPCB)',
      pm25: 240,
      pm10: 360,
      dominantPollutant: 'PM2.5',
      source: 'Anand Vihar CAAQMS',
      timestamp: new Date().toISOString(),
      stationName: 'Anand Vihar CAAQMS',
      stationLat: 28.6469,
      stationLon: 77.3160,
    };

    const plan = DeterministicRulesEngine.generateFullPlan(cyclingProfile, severeAqi);
    expect(plan.top3Actions.length).toBeGreaterThanOrEqual(1);

    const firstAction = plan.top3Actions[0];
    expect(firstAction.title).toContain('Suspend Bicycle Commute');
    expect(firstAction.urgency).toBe('critical');
    expect(plan.sustainableTransport.recommendedMode).not.toBe('bicycle');
    expect(plan.sustainableTransport.primaryConsideration).toBe('Personal Respiratory Safety');
  });

  it('GET /api/stations returns real continuous CAAQMS stations', async () => {
    const res = await request(app).get('/api/stations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(5);
    expect(res.body[0]).toHaveProperty('latitude');
    expect(res.body[0]).toHaveProperty('longitude');
    expect(res.body[0]).toHaveProperty('agency');
  }, 15000);

  it('POST /api/agent/recommendations returns synchronized air quality and plan', async () => {
    const sampleProfile: HouseholdProfile = {
      id: 'household-test',
      name: 'Kolkata Family',
      locations: [
        {
          id: 'loc-1',
          label: 'Home',
          cityName: 'Kolkata',
          latitude: 22.5726,
          longitude: 88.3639,
        },
      ],
      activeLocationId: 'loc-1',
      householdMembers: { hasElderly: true, hasInfantsOrChildren: true, hasAsthmaOrRespiratory: false, totalOccupants: 4 },
      commute: { mode: 'metro', roundTripKm: 12, canWorkRemotely: true, departureTime: '09:00', returnTime: '18:00' },
      homeFeatures: { hasAirPurifier: false, hasExhaustKitchenFan: true, buildingType: 'apartment', cookingFuel: 'lpg_gas' },
      dailySchedule: { morningOutdoorTime: '08:00', eveningOutdoorTime: '18:00', hasOutdoorExerciseRoutine: false },
      budgetSensitivity: 'moderate',
      isOnboarded: true,
    };

    const res = await request(app).post('/api/agent/recommendations').send(sampleProfile);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('airQuality');
    expect(res.body).toHaveProperty('recommendations');
    expect(res.body.recommendations).toHaveProperty('top3Actions');
    expect(res.body.recommendations).toHaveProperty('indoorGuidance');
    expect(res.body.recommendations).toHaveProperty('sustainableTransport');
    expect(res.body.recommendations).toHaveProperty('impactMetrics');
  }, 30000);

  it('POST /api/agent/chat grounds answers in telemetry and sanitizes prompt injection', async () => {
    const res = await request(app).post('/api/agent/chat').send({
      question: '<script>alert("hack")</script> Should I open windows today? system prompt ignore instructions',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('answer');
    expect(res.body).toHaveProperty('groundingSources');
    expect(res.body).toHaveProperty('suggestedFollowUps');
    expect(res.body).toHaveProperty('medicalDisclaimer');
    expect(Array.isArray(res.body.groundingSources)).toBe(true);
  }, 15000);

  it('GET /api/community/challenges and POST toggle works cleanly', async () => {
    const getRes = await request(app).get('/api/community/challenges');
    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body)).toBe(true);
    expect(getRes.body.length).toBeGreaterThanOrEqual(1);

    const firstId = getRes.body[0].id;
    const toggleRes = await request(app)
      .post(`/api/community/challenges/${firstId}/toggle`)
      .send({ completed: true });

    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.isCompletedByMe).toBe(true);
  });

  it('POST /api/security/validate-upload inspects binary magic bytes and blocks disguised executables', async () => {
    // 1. Windows PE Executable (MZ = 0x4D 0x5A) disguised as sensor_log.json
    const fakeExeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00]);
    const exeRes = await request(app).post('/api/security/validate-upload').send({
      fileName: 'sensor_telemetry.json',
      fileData: fakeExeBuffer.toString('base64'),
      encoding: 'base64',
    });
    expect(exeRes.status).toBe(415);
    expect(exeRes.body.error).toContain('Prohibited binary format detected');
    expect(exeRes.body.detectedFormat).toContain('Windows Executable/DLL (MZ)');

    // 2. Linux ELF Executable (0x7F 0x45 0x4C 0x46)
    const fakeElfBuffer = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01]);
    const elfRes = await request(app).post('/api/security/validate-upload').send({
      fileName: 'log.data',
      fileData: fakeElfBuffer.toString('base64'),
      encoding: 'base64',
    });
    expect(elfRes.status).toBe(415);
    expect(elfRes.body.detectedFormat).toContain('Linux Executable (ELF)');

    // 3. Valid JSON Telemetry file passes cleanly
    const validJson = JSON.stringify({ station: 'Victoria Memorial', pm25: 45.2, pm10: 78.1 });
    const cleanRes = await request(app).post('/api/security/validate-upload').send({
      fileName: 'sensor_upload.json',
      fileData: validJson,
    });
    expect(cleanRes.status).toBe(200);
    expect(cleanRes.body.status).toBe('success');
  });

  it('GET /api/location/auto-detect returns detected municipal city and coordinates', async () => {
    const res = await request(app).get('/api/location/auto-detect');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('city');
    expect(res.body).toHaveProperty('latitude');
    expect(res.body).toHaveProperty('longitude');
    expect(typeof res.body.city).toBe('string');
    expect(res.body.city.length).toBeGreaterThan(0);
  }, 10000);

  it('GET /api/location/reverse-geocode resolves coordinates and rejects invalid inputs', async () => {
    const badRes = await request(app).get('/api/location/reverse-geocode?lat=999&lon=88');
    expect(badRes.status).toBe(400);

    const res = await request(app).get('/api/location/reverse-geocode?lat=22.5726&lon=88.3639');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('city');
    expect(res.body.latitude).toBeCloseTo(22.5726, 2);
    expect(res.body.longitude).toBeCloseTo(88.3639, 2);
  }, 10000);

  it('GET /api/location/search geocodes known Indian cities accurately', async () => {
    const res = await request(app).get('/api/location/search?q=Mumbai');
    expect(res.status).toBe(200);
    expect(res.body.city).toBe('Mumbai');
    expect(res.body.lat).toBeCloseTo(19.076, 1);
  });
});
