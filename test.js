var Query = require('./index');
var input, query;

console.log('///////////////////////////////////');

input = [
  {pathName: '/a/b', action: 'include'}
];

console.log('for input: ')
console.log(JSON.stringify(input, '  ', 2));

console.log('result is: ');
query = new Query(input);

query = new Query([
  {pathName: '/a/b', action: 'include'}
]);

console.log(query.explanation);

console.log(JSON.stringify(query.query, '  ', 2));


console.log('///////////////////////////////////');

input = [
  {pathName: '/a/b', action: 'include'},
  {pathName: '/a/c', action: 'include'}
];

console.log('for input: ')
console.log(JSON.stringify(input, '  ', 2));

console.log('result is: ');
query = new Query(input);


console.log(query.explanation);

console.log(JSON.stringify(query.query, '  ', 2));


console.log('///////////////////////////////////');

input = [
  {pathName: '/a/b', action: 'include'},
  {pathName: '/a/c', action: 'exclude'}
];

console.log('for input: ')
console.log(JSON.stringify(input, '  ', 2));

console.log('result is: ');
query = new Query(input);


console.log(query.explanation);

console.log(JSON.stringify(query.query, '  ', 2));


console.log('///////////////////////////////////');

input = [
  {pathName: '/a/b', action: 'include'},
  {pathName: '/a/b/c', action: 'exclude'}
];

console.log('for input: ')
console.log(JSON.stringify(input, '  ', 2));

console.log('result is: ');
query = new Query(input);


console.log(query.explanation);

console.log(JSON.stringify(query.query, '  ', 2));


console.log('///////////////////////////////////');

input = [
  {pathName: '/a/b', action: 'exclude'},
  {pathName: '/a/b/c', action: 'include'}
];

console.log('for input: ')
console.log(JSON.stringify(input, '  ', 2));

console.log('result is: ');
query = new Query(input);


console.log(query.explanation);

console.log(JSON.stringify(query.query, '  ', 2));


console.log('///////////////////////////////////');

input = [
  {pathName: '/a/b', action: 'include'},
  {pathName: '/a/b/c', action: 'exclude'},
  {pathName: '/a/b/c/d', action: 'include'}
];

console.log('for input: ')
console.log(JSON.stringify(input, '  ', 2));

console.log('result is: ');
query = new Query(input);


console.log(query.explanation);

console.log(JSON.stringify(query.query, '  ', 2));

