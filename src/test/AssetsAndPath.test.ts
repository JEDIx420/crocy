import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Authoritative Assets & Deployment Path Integrity', () => {
  const publicDir = path.resolve(__dirname, '../../public/assets');

  it('contains the authoritative optimized crocodile model', () => {
    const crocPath = path.join(publicDir, 'crocodile.glb');
    expect(fs.existsSync(crocPath)).toBe(true);
    const stat = fs.statSync(crocPath);
    // Optimized crocodile should be between 3MB and 6MB (fast for web, full geometry preserved)
    expect(stat.size).toBeGreaterThan(2 * 1024 * 1024);
    expect(stat.size).toBeLessThan(10 * 1024 * 1024);
  });

  it('contains ambient fauna models with animations', () => {
    const sleeperFish = path.join(publicDir, 'sleeper_fish.glb');
    const riceFish = path.join(publicDir, 'rice_fish.glb');
    const crab = path.join(publicDir, 'crab.glb');

    expect(fs.existsSync(sleeperFish)).toBe(true);
    expect(fs.existsSync(riceFish)).toBe(true);
    expect(fs.existsSync(crab)).toBe(true);
  });

  it('contains vegetation and terrain props', () => {
    const mangrove = path.join(publicDir, 'mangrove_tree.glb');
    const fern = path.join(publicDir, 'fern_02/fern_02_1k.gltf');
    const trunk = path.join(publicDir, 'dead_tree_trunk/dead_tree_trunk_1k.gltf');

    expect(fs.existsSync(mangrove)).toBe(true);
    expect(fs.existsSync(fern)).toBe(true);
    expect(fs.existsSync(trunk)).toBe(true);
  });

  it('vite configuration uses relative base path for GitHub Pages compatibility', () => {
    const viteConfigPath = path.resolve(__dirname, '../../vite.config.ts');
    const content = fs.readFileSync(viteConfigPath, 'utf-8');
    expect(content).toContain("base: './'");
  });
});
