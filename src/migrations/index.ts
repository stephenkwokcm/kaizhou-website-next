import * as migration_20261108_091832_baseline from './20261108_091832_baseline';
import * as migration_20261108_091921_president_sections from './20261108_091921_president_sections';

export const migrations = [
  {
    up: migration_20261108_091832_baseline.up,
    down: migration_20261108_091832_baseline.down,
    name: '20261108_091832_baseline',
  },
  {
    up: migration_20261108_091921_president_sections.up,
    down: migration_20261108_091921_president_sections.down,
    name: '20261108_091921_president_sections'
  },
];
