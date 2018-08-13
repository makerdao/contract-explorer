import SmartContractInspector from './SmartContractInspector';

export default function inspect(service) {
  const contractNames = ['SAI_TUB'];
  const inspector = new SmartContractInspector(service);
  contractNames.forEach(n => inspector.watch(n));
  return inspector.inspect();
}
