process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.APP_URL = 'http://localhost:5173';

// no real emails in tests, the invite link is read from the mock instead
jest.mock('../utils/mailer', () => ({ sendInvite: jest.fn(), sendReset: jest.fn() }));

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = require('../app');
const mailer = require('../utils/mailer');
const User = require('../models/User');
const Dealer = require('../models/Dealer');
const Master = require('../models/Master');

// a separate database, wiped before and after, so real data is never touched
const TEST_DB = 'mongodb://127.0.0.1:27017/dealer_portal_test';

let admin, approver, creator, creator2;
let n = 0;

const as = (user) => ({
  Authorization: `Bearer ${jwt.sign({ id: user._id }, process.env.JWT_SECRET)}`,
});

async function makeUser(role) {
  const user = new User({ name: `Test ${role}`, email: `${role.toLowerCase()}${++n}@test.in`, role });
  await user.setPassword('Passw0rd1');
  return user.save();
}

const dealerBody = () => ({
  name: `Dealer ${++n}`,
  gstin: `29AAGCM${4000 + n}P1Z3`,
  type: 'Retailer',
  contactPerson: 'Ravi',
  mobile: '9876501234',
  email: 'ravi@test.in',
  state: 'Karnataka',
  city: 'Mysuru',
});

async function createDealer(user) {
  const res = await request(app).post('/api/dealers').set(as(user)).send(dealerBody());
  return res.body;
}

const lastInviteToken = () => mailer.sendInvite.mock.calls.at(-1)[1].split('token=')[1];
const lastResetToken = () => mailer.sendReset.mock.calls.at(-1)[1].split('token=')[1];

beforeAll(async () => {
  await mongoose.connect(TEST_DB);
  await mongoose.connection.dropDatabase();
  await Promise.all([User.init(), Dealer.init(), Master.init()]);

  await Master.create({ type: 'STATE', value: 'Karnataka' });
  await Master.create({ type: 'DEALER_TYPE', value: 'Retailer' });

  admin = await makeUser('ADMIN');
  approver = await makeUser('APPROVER');
  creator = await makeUser('CREATOR');
  creator2 = await makeUser('CREATOR');
}, 30000);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('login required', () => {
  test('a request without a token gets 401', async () => {
    const res = await request(app).get('/api/dealers');
    expect(res.status).toBe(401);
  });
});

describe('role permissions', () => {
  test('a creator cannot approve a dealer', async () => {
    const dealer = await createDealer(creator);
    const res = await request(app).patch(`/api/dealers/${dealer._id}/approve`).set(as(creator));
    expect(res.status).toBe(403);
  });

  test('a creator cannot reach the admin routes', async () => {
    expect((await request(app).get('/api/users').set(as(creator))).status).toBe(403);
    expect((await request(app).get('/api/dashboard/summary').set(as(creator))).status).toBe(403);
    const master = await request(app).post('/api/masters').set(as(creator)).send({ type: 'STATE', value: 'Goa' });
    expect(master.status).toBe(403);
  });

  test('an approver cannot create users or register dealers', async () => {
    const user = await request(app)
      .post('/api/users').set(as(approver))
      .send({ name: 'X Person', email: 'x@test.in', role: 'CREATOR' });
    expect(user.status).toBe(403);

    const dealer = await request(app).post('/api/dealers').set(as(approver)).send(dealerBody());
    expect(dealer.status).toBe(403);
  });

  test('a creator only sees their own dealers', async () => {
    await createDealer(creator);
    await createDealer(creator2);

    const res = await request(app).get('/api/dealers').set(as(creator));
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((d) => d.createdBy._id === String(creator._id))).toBe(true);
  });

  test("a creator cannot open another creator's dealer", async () => {
    const other = await createDealer(creator2);
    const res = await request(app).get(`/api/dealers/${other._id}`).set(as(creator));
    expect(res.status).toBe(403);
  });
});

describe('dealer rules', () => {
  test('an approver can approve, and a second decision gets 409', async () => {
    const dealer = await createDealer(creator);
    const first = await request(app).patch(`/api/dealers/${dealer._id}/approve`).set(as(approver));
    expect(first.status).toBe(200);
    expect(first.body.status).toBe('APPROVED');

    const again = await request(app)
      .patch(`/api/dealers/${dealer._id}/reject`).set(as(admin))
      .send({ reason: 'Changed my mind later' });
    expect(again.status).toBe(409);
  });

  test('a rejection reason under 10 characters gets 400', async () => {
    const dealer = await createDealer(creator);
    const res = await request(app)
      .patch(`/api/dealers/${dealer._id}/reject`).set(as(approver))
      .send({ reason: 'too short' });
    expect(res.status).toBe(400);
  });

  test('a rejection with a proper reason is saved', async () => {
    const dealer = await createDealer(creator);
    const res = await request(app)
      .patch(`/api/dealers/${dealer._id}/reject`).set(as(approver))
      .send({ reason: 'GST certificate does not match' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('REJECTED');
    expect(res.body.rejectionReason).toBe('GST certificate does not match');
  });

  test('an admin can decide a dealer they registered', async () => {
    const dealer = await createDealer(admin);
    const res = await request(app).patch(`/api/dealers/${dealer._id}/approve`).set(as(admin));
    expect(res.status).toBe(200);
  });

  test('a duplicate GSTIN gets 409', async () => {
    const body = dealerBody();
    await request(app).post('/api/dealers').set(as(creator)).send(body);
    const res = await request(app).post('/api/dealers').set(as(creator)).send(body);
    expect(res.status).toBe(409);
  });

  test('status and createdBy sent in the body are ignored', async () => {
    const res = await request(app)
      .post('/api/dealers').set(as(creator))
      .send({ ...dealerBody(), status: 'APPROVED', createdBy: String(admin._id) });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('PENDING');
    expect(res.body.createdBy).toBe(String(creator._id));
  });

  test('a state outside the masters is refused', async () => {
    const res = await request(app)
      .post('/api/dealers').set(as(creator))
      .send({ ...dealerBody(), state: 'Atlantis' });
    expect(res.status).toBe(400);
  });
});

describe('invite, reset and accounts', () => {
  test('an invited user cannot log in until the password is set', async () => {
    const created = await request(app)
      .post('/api/users').set(as(admin))
      .send({ name: 'Nisha New', email: 'nisha@test.in', role: 'CREATOR' });
    expect(created.status).toBe(201);

    const early = await request(app).post('/api/auth/login').send({ email: 'nisha@test.in', password: 'Passw0rd1' });
    expect(early.status).toBe(403);

    const token = lastInviteToken();
    const weak = await request(app).post('/api/auth/set-password').send({ token, password: 'abc' });
    expect(weak.status).toBe(400);

    const ok = await request(app).post('/api/auth/set-password').send({ token, password: 'Passw0rd1' });
    expect(ok.status).toBe(200);

    const login = await request(app).post('/api/auth/login').send({ email: 'nisha@test.in', password: 'Passw0rd1' });
    expect(login.status).toBe(200);
    expect(login.body.user.passwordHash).toBeUndefined();
  });

  test('a link works once only', async () => {
    await request(app).post('/api/users').set(as(admin)).send({ name: 'Once Only', email: 'once@test.in', role: 'CREATOR' });
    const token = lastInviteToken();

    expect((await request(app).post('/api/auth/set-password').send({ token, password: 'Passw0rd1' })).status).toBe(200);
    expect((await request(app).post('/api/auth/set-password').send({ token, password: 'Passw0rd2' })).status).toBe(400);
  });

  test('an expired link gets 400', async () => {
    await request(app).post('/api/users').set(as(admin)).send({ name: 'Late User', email: 'late@test.in', role: 'CREATOR' });
    const token = lastInviteToken();
    await User.updateOne({ email: 'late@test.in' }, { tokenExpires: new Date(Date.now() - 1000) });

    const res = await request(app).get(`/api/auth/token/${token}`);
    expect(res.status).toBe(400);
  });

  test('forgot-password answers the same for known and unknown emails', async () => {
    const known = await request(app).post('/api/auth/forgot-password').send({ email: creator.email });
    const unknown = await request(app).post('/api/auth/forgot-password').send({ email: 'nobody@test.in' });
    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(known.body).toEqual(unknown.body);
  });

  test('a reset cannot reuse the previous password, and older logins end', async () => {
    const user = await makeUser('CREATOR');

    // a login issued a minute before the password change
    const oldLogin = {
      Authorization: `Bearer ${jwt.sign(
        { id: user._id, iat: Math.floor(Date.now() / 1000) - 60 },
        process.env.JWT_SECRET
      )}`,
    };
    expect((await request(app).get('/api/dealers').set(oldLogin)).status).toBe(200);

    await request(app).post('/api/auth/forgot-password').send({ email: user.email });
    const token = lastResetToken();

    const same = await request(app).post('/api/auth/set-password').send({ token, password: 'Passw0rd1' });
    expect(same.status).toBe(400);

    const changed = await request(app).post('/api/auth/set-password').send({ token, password: 'NewPassw0rd2' });
    expect(changed.status).toBe(200);

    expect((await request(app).get('/api/dealers').set(oldLogin)).status).toBe(401);

    const oldPassword = await request(app).post('/api/auth/login').send({ email: user.email, password: 'Passw0rd1' });
    expect(oldPassword.status).toBe(401);
    const newPassword = await request(app).post('/api/auth/login').send({ email: user.email, password: 'NewPassw0rd2' });
    expect(newPassword.status).toBe(200);
  });

  test('signing in with the wrong role gives the same answer as a wrong password', async () => {
    const user = await makeUser('CREATOR');

    const wrongRole = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'Passw0rd1', role: 'ADMIN' });
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'WrongPass9', role: 'CREATOR' });
    expect(wrongRole.status).toBe(401);
    expect(wrongRole.body).toEqual(wrongPassword.body);

    const right = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'Passw0rd1', role: 'CREATOR' });
    expect(right.status).toBe(200);
  });

  test('a deactivated user is locked out at once', async () => {
    const temp = await makeUser('CREATOR');
    expect((await request(app).get('/api/dealers').set(as(temp))).status).toBe(200);

    await request(app).patch(`/api/users/${temp._id}`).set(as(admin)).send({ isActive: false });
    expect((await request(app).get('/api/dealers').set(as(temp))).status).toBe(401);
  });

  test('an admin cannot deactivate their own account', async () => {
    const res = await request(app).patch(`/api/users/${admin._id}`).set(as(admin)).send({ isActive: false });
    expect(res.status).toBe(409);
  });
});