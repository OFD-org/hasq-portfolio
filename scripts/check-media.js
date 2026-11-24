import assert from 'node:assert/strict';
import { stat, open } from 'node:fs/promises';
import { works } from '../js/data/works.js';
import { workTitles } from '../js/data/work-titles.js';

assert.equal(new Set(works.map(work => work.id)).size, works.length, 'Project IDs must be unique');
for (const id of Object.keys(workTitles)) assert.ok(works.some(work => work.id === id), `Unknown display-title ID: ${id}`);
for (const work of works) {
  assert.ok(work.width > 0 && work.height > 0, `Missing dimensions: ${work.id}`);
  assert.ok(Boolean(work.image) !== Boolean(work.video), `Expected one media type: ${work.id}`);
  if (work.video) assert.ok(work.preview && work.duration > 0, `Missing preview metadata: ${work.id}`);
  for (const key of ['poster', 'preview', 'video', 'image']) {
    if (!work[key]) continue;
    const size = (await stat(work[key])).size;
    assert.ok(size > 0, `Empty ${key}: ${work.id}`);
    assert.ok(size < 25 * 1024 * 1024, `Media exceeds the 25 MiB upload budget: ${work[key]}`);
    assert.ok(work[key].startsWith('assets/works/media/'), `Media must use a deployable optimized asset: ${work[key]}`);
  }
  if (work.preview) {
    const file = await open(work.preview);
    try {
      const header = Buffer.alloc(12);
      await file.read(header, 0, 12, 0);
      assert.equal(header.toString('ascii', 4, 8), 'ftyp', `Invalid preview MP4: ${work.id}`);
    } finally { await file.close(); }
  }
}
console.log(`Verified ${works.length} works: unique IDs, media paths, dimensions, display titles, and preview MP4 headers.`);
