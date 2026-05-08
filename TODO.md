# TODO

## Header/Sidebar alignment fix (Tailwind)
- [ ] Create a proper page shell layout (grid/flex) where:
  - Sidebar is fixed left and full viewport height.
  - Header is fixed top and has consistent height.
  - Main content has top padding equal to header height and left margin/offset equal to sidebar width.
  - Ensure no overlap via z-index.
- [ ] Refactor `client/src/layout/AppLayout.tsx` to implement the shell (likely using `lg:grid-cols-[w]` or a wrapper with left padding).
- [ ] Adjust `AppSidebar.tsx` so it starts below the header (or use container padding offset) rather than `pt-20` hacks.
- [ ] Adjust `AppHeader.tsx` so it has a known height (e.g. `h-16`) and dropdown/z-index does not cause stacking/overlap issues.
- [ ] Verify responsive behavior:
  - Desktop: sidebar visible, content offset correctly.
  - Mobile: sidebar slides, content no longer shifts/breaks.
- [ ] Run `npm test`/`npm run build` (or `npm run dev` smoke test) in `client/`.

