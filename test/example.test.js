const { expect } = require('chai');

describe('Example Test Suite', () => {
  it('should demonstrate basic testing', () => {
    const result = 2 + 2;
    expect(result).to.equal(4);
  });

  it('should test string operations', () => {
    const str = 'Hello World';
    expect(str).to.include('World');
    expect(str).to.have.length(11);
  });

  it('should test array operations', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr).to.be.an('array');
    expect(arr).to.have.length(5);
    expect(arr).to.include(3);
  });
});
