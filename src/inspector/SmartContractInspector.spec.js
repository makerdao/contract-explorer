import Maker from '@makerdao/dai';
import SmartContractInspector from './SmartContractInspector';
import { contracts, tokens } from './constants';
import ContractWatcher from './ContractWatcher';
import PropertyWatcher from './PropertyWatcher';
import MethodWatcher from './MethodWatcher';
import { numberToBytes32 } from '../utils';

let inspector;

beforeEach(async () => {
  const maker = Maker.create('test', {
    smartContract: true,
    log: false
  });
  await maker.authenticate();
  const service = await maker.service('smartContract');
  inspector = new SmartContractInspector(service);
});

test('should register contract watchers', async () => {
  inspector.watch(contracts.SAI_TUB);
  expect(inspector._watchers._contracts[contracts.SAI_TUB]).toBeInstanceOf(
    ContractWatcher
  );
  expect(inspector._watchers._contracts[contracts.SAI_TUB].id()).toBe(
    contracts.SAI_TUB
  );

  inspector.watch(contracts.SAI_PIP.toLowerCase());
  expect(inspector._watchers._contracts[contracts.SAI_PIP]).toBeInstanceOf(
    ContractWatcher
  );
  expect(inspector._watchers._contracts[contracts.SAI_PIP].id()).toBe(
    contracts.SAI_PIP
  );

  expect(() => inspector.watch('NOT_A_CONTRACT')).toThrow(
    "Cannot find contract: 'NOT_A_CONTRACT'"
  );

  expect(() => inspector.watch(['NOT_A_CONTRACT'])).toThrow(
    "Expected contract name string, got 'object'"
  );
});

test('should register property watchers', async () => {
  inspector.watch(contracts.SAI_TUB, '_chi');
  expect(inspector._watchers[contracts.SAI_TUB]['SAI_TUB._chi']).toBeInstanceOf(
    PropertyWatcher
  );

  expect(() =>
    inspector.watch(contracts.SAI_TUB, '123InvalidPropertyName')
  ).toThrow("Illegal watch expression for SAI_TUB: '123InvalidPropertyName'");
});

test('should register method watchers', async () => {
  inspector.watch(contracts.SAI_TUB, ['tap']);
  expect(
    inspector._watchers[contracts.SAI_TUB]['SAI_TUB.tap()']
  ).toBeInstanceOf(MethodWatcher);

  inspector.watch(contracts.SAI_TUB, ['cup', 1]);
  expect(
    inspector._watchers[contracts.SAI_TUB]['SAI_TUB.cup(1)']
  ).toBeInstanceOf(MethodWatcher);

  inspector.watch(contracts.SAI_TUB, ['cup', 1, 'test']);
  expect(
    inspector._watchers[contracts.SAI_TUB]['SAI_TUB.cup(1,test)']
  ).toBeInstanceOf(MethodWatcher);
});

test('should generate nodes for watched contracts and their properties', async () => {
  inspector.watch(contracts.SAI_TUB);
  inspector.watch(contracts.SAI_TUB, ['cups', numberToBytes32(1)]);
  inspector.watch(tokens.MKR);

  const map = await inspector.inspect();
  expect(map[contracts.SAI_TUB].getInfo()).toEqual({
    type: 'contract',
    name: 'SAI_TUB',
    address: '0XE82CE3D6BF40F2F9414C8D01A35E3D9EB16A1761',
    signer: '0X16FB96A5FA0427AF0C8F7CF1EB4870231C8154B6',
    info: 'CDP record store contract.'
  });

  expect(map[contracts.SAI_TUB + '.axe']).toBeDefined();

  expect(map[tokens.MKR].getInfo()).toEqual({
    type: 'contract',
    name: 'MKR',
    address: '0X1C3AC7216250EDC5B9DAA5598DA0579688B9DBD5',
    signer: '0X16FB96A5FA0427AF0C8F7CF1EB4870231C8154B6',
    info:
      'Maker governance token contract. Used for voting and payment of fees. Implements DSToken.'
  });

  expect(map[tokens.MKR + '.totalSupply']).toBeDefined();

  expect(map[contracts.SAI_TUB + '.axe'].getInfo()).toEqual({
    type: 'property',
    name: 'axe',
    contract: 'SAI_TUB',
    value: '1130000000000000000000000000',
    isError: false,
    info: 'Liquidation penalty'
  });

  //console.log(Object.keys(map).map(k => [map[k].getInfo(), map[k].children]));
});
