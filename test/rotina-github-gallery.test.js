import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseGhFotosTree } from '../js/rotina-matheus.js';

test('parseGhFotosTree lista só as fotos de fotos/<categoria>/ e ordena da mais nova', () => {
  const tree = [
    { path: 'README.md', type: 'blob', sha: 'a' },
    { path: 'fotos', type: 'tree', sha: 'b' },
    { path: 'fotos/pele-perfumes/1795400000000-000-abcd.jpg', type: 'blob', sha: 'c', size: 1200 },
    { path: 'fotos/cremes-cabelo/1795500000000-001-efgh.jpg', type: 'blob', sha: 'd', size: 900 },
    { path: 'fotos/cremes-cabelo/sub/x.jpg', type: 'blob', sha: 'e' },
    { path: 'outros/y.jpg', type: 'blob', sha: 'f' }
  ];
  const list = parseGhFotosTree(tree);
  assert.equal(list.length, 2);
  assert.deepEqual(list.map(f => f.cat), ['cremes-cabelo', 'pele-perfumes']);
  assert.equal(list[0].id, '1795500000000-001-efgh');
  assert.equal(list[0].sha, 'd');
  assert.deepEqual(parseGhFotosTree(undefined), []);
});
