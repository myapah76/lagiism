import test from 'node:test';
import assert from 'node:assert/strict';
import { CUSTOMIZE_ARTIFACTS, PRODUCTS } from '../data/catalog';
import {
  addItemToBag,
  addSetSelectionToBag,
  artifactToProduct,
  calculateBagCount,
  calculateBagSubtotal,
  calculateSetTotal,
  deriveInclusionMode,
  filterAndSortCatalog,
  filterDropProducts,
  formatVND,
  normalizeAzimuth,
  removeBagItem,
  toggleArtifactBinding,
  updateBagItemQuantity,
} from './storeLogic';

test('formatVND formats VND currency with dot separators and trailing ₫', () => {
  assert.equal(formatVND(450000), '450.000₫');
  assert.equal(formatVND(850000), '850.000₫');
  assert.equal(formatVND(1300000), '1.300.000₫');
  assert.equal(formatVND(0), '0₫');
});

test('filterDropProducts filters by ALL, TEES, DENIM, OUTERWEAR accurately', () => {
  const all = filterDropProducts(PRODUCTS, 'ALL');
  assert.equal(all.length, PRODUCTS.length);

  const denim = filterDropProducts(PRODUCTS, 'DENIM');
  assert.equal(denim.length, 2);
  assert.ok(denim.every((p) => p.category === 'DENIM'));

  const outerwear = filterDropProducts(PRODUCTS, 'OUTERWEAR');
  assert.equal(outerwear.length, 2);
  assert.ok(outerwear.every((p) => p.category === 'OUTERWEAR'));
});

test('filterAndSortCatalog filters by search query and sorts by price', () => {
  const searchDenim = filterAndSortCatalog(PRODUCTS, {
    category: 'ALL',
    query: 'carpenter',
    sort: 'FEATURED',
  });
  assert.equal(searchDenim.length, 1);
  assert.equal(searchDenim[0].id, 'lg-denim-02');

  const asc = filterAndSortCatalog(PRODUCTS, {
    category: 'ALL',
    query: '',
    sort: 'PRICE_ASC',
  });
  assert.ok(asc[0].priceVnd <= asc[asc.length - 1].priceVnd);

  const desc = filterAndSortCatalog(PRODUCTS, {
    category: 'ALL',
    query: '',
    sort: 'PRICE_DESC',
  });
  assert.ok(desc[0].priceVnd >= desc[desc.length - 1].priceVnd);
});

test('calculateSetTotal computes BOTH, TOP_ONLY, and BOTTOM_ONLY totals', () => {
  const top = PRODUCTS.find((p) => p.id === 'lg-tee-01')!; // 450,000
  const bottom = PRODUCTS.find((p) => p.id === 'lg-denim-01')!; // 850,000

  assert.equal(
    calculateSetTotal({
      topProduct: top,
      bottomProduct: bottom,
      inclusionMode: 'BOTH',
    }),
    1300000
  );
  assert.equal(
    calculateSetTotal({
      topProduct: top,
      bottomProduct: bottom,
      inclusionMode: 'TOP_ONLY',
    }),
    450000
  );
  assert.equal(
    calculateSetTotal({
      topProduct: top,
      bottomProduct: bottom,
      inclusionMode: 'BOTTOM_ONLY',
    }),
    850000
  );
});

test('bag operations add items, merge duplicates, update quantities, and remove items', () => {
  const tee = PRODUCTS[0];
  const denim = PRODUCTS[3];

  let bag = addItemToBag([], tee, 'M');
  assert.equal(calculateBagCount(bag), 1);
  assert.equal(calculateBagSubtotal(bag), tee.priceVnd);

  // Adding same product + size increments quantity
  bag = addItemToBag(bag, tee, 'M');
  assert.equal(bag.length, 1);
  assert.equal(calculateBagCount(bag), 2);
  assert.equal(calculateBagSubtotal(bag), tee.priceVnd * 2);

  // Adding a set selection (BOTH) adds both pieces with set tag
  bag = addSetSelectionToBag(bag, {
    topProduct: tee,
    bottomProduct: denim,
    topSize: 'L',
    bottomSize: 'L',
    inclusionMode: 'BOTH',
    setCode: 'SET 01 / 03',
  });
  assert.equal(calculateBagCount(bag), 4);
  assert.equal(
    calculateBagSubtotal(bag),
    tee.priceVnd * 2 + tee.priceVnd + denim.priceVnd
  );

  // Quantity decrement to 0 removes item
  const firstKey = bag[0].key;
  bag = updateBagItemQuantity(bag, firstKey, -2);
  assert.equal(calculateBagCount(bag), 2);

  // Explicit remove
  bag = removeBagItem(bag, bag[0].key);
  assert.equal(calculateBagCount(bag), 1);
});

test('normalizeAzimuth wraps degrees cleanly into 0..359', () => {
  assert.equal(normalizeAzimuth(0), 0);
  assert.equal(normalizeAzimuth(360), 0);
  assert.equal(normalizeAzimuth(-45), 315);
  assert.equal(normalizeAzimuth(405), 45);
});

test('CUSTOMIZE LOOK contains 8 artifacts and toggles Top/Bottom/Both/None cleanly', () => {
  assert.equal(CUSTOMIZE_ARTIFACTS.length, 8);
  const top1 = CUSTOMIZE_ARTIFACTS.find((a) => a.id === 'cust-top-01')!;
  const top2 = CUSTOMIZE_ARTIFACTS.find((a) => a.id === 'cust-top-02')!;
  const bot1 = CUSTOMIZE_ARTIFACTS.find((a) => a.id === 'cust-bot-01')!;

  let state = { activeTopId: top1.id as string | null, activeBottomId: bot1.id as string | null };
  assert.equal(deriveInclusionMode(state.activeTopId, state.activeBottomId), 'BOTH');

  // Clicking already selected top unbinds top -> BOTTOM_ONLY
  state = toggleArtifactBinding(state, top1);
  assert.equal(state.activeTopId, null);
  assert.equal(deriveInclusionMode(state.activeTopId, state.activeBottomId), 'BOTTOM_ONLY');

  // Clicking a different top binds it -> BOTH
  state = toggleArtifactBinding(state, top2);
  assert.equal(state.activeTopId, top2.id);
  assert.equal(deriveInclusionMode(state.activeTopId, state.activeBottomId), 'BOTH');

  // Unbinding bottom leaves TOP_ONLY
  state = toggleArtifactBinding(state, bot1);
  assert.equal(state.activeBottomId, null);
  assert.equal(deriveInclusionMode(state.activeTopId, state.activeBottomId), 'TOP_ONLY');

  // Converting artifact to Product keeps exact VND price and name
  const converted = artifactToProduct(top2);
  assert.equal(converted.name, 'HULL WORK JACKET');
  assert.equal(converted.priceVnd, 900000);
});

