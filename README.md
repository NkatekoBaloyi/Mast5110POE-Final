# Chef's Menu Manager (Part 3 / Final PoE)

A mobile-style app for managing a restaurant menu: sign in, browse the menu, add, edit and delete dishes, search and filter, and view menu statistics.

## Change log (changes since Part 2)

### 1. Manage menu items
- Edit and update an existing dish from the Dish Details screen. The form is pre-filled and changes show immediately on the menu list and home statistics.
- Delete a dish, now behind a confirmation dialog so dishes are not removed by accident.
- Fixed a bug where saving an edit added a stray `course` field to the dish object. Only the real dish fields are saved now.

### 2. Search and filter
- Search by dish name (case-insensitive, ignores leading and trailing spaces).
- Filter by course using the All / Starters / Mains / Desserts chips.
- Added a "Clear search and filter" button that appears when a search or filter is active.
- Added a "Showing X of Y dishes" counter and clearer empty-state messages.

### 3. Menu statistics
- Home screen now shows total dishes, average price, and the number of dishes in each course.
- All numbers come from one `calculateStats` function and update whenever a dish is added, edited or deleted.

### 4. Enhancements and refactoring
- Added reusable components: `ScreenFrame`, `Button`, `Field`, `ConfirmDialog`, `StatsPanel`. These replace the status bar, header and button code that was repeated on every screen.
- Replaced duplicated style objects with `inputStyle()` and a button variant map.
- Moved helpers (`formatRand`, `isValidEmail`, `calculateStats`) into pure functions.
- Removed unused props, redundant `useMemo` calls in the receipt screen, and the unused `placeholder`/`fieldWrapperStyle` constants.
- Menu data changes now live in one place (`App`), with `handleSaveDish` and `handleDeleteDish`.
- Fixed the loading screen timer restarting on re-render by using a stable `useCallback`.

### 5. User experience
- Success messages after adding, updating and deleting a dish. Messages clear themselves after 3 seconds.
- Improved validation: proper email format check, price must be greater than 0, duplicate dish names are rejected, and input length limits.
- Clearer error text that says how to fix the problem.
- Back links on every screen for consistent navigation, and the same header and spacing across all screens.

### 6. Receipt built from the menu selection
- Each dish on the menu list now has an Add button that becomes a − / + quantity control. The same control is on the Dish Details screen.
- A "View order" bar shows the item count and running total while the menu is open.
- The receipt lists every selected dish with its quantity, line total, subtotal, VAT and total. Quantities can be changed on the receipt, and setting one to 0 removes the dish.
- The receipt reads from the live menu: edited names and prices update, and deleted dishes are removed from the order.
- "Done" completes the order and clears it, "Add More Dishes" returns to the menu keeping the order, and "Start New Order" clears it.
- Replaced the hardcoded sample receipt from Part 2.

### 7. Dish images
- Every dish shows an image on the menu list, the Dish Details screen (large) and the receipt (small).
- Built-in illustrations (inline SVG) were drawn for each dish: garlic bread, caprese salad, bruschetta, soup, chicken, beef fillet, seafood linguine, pizza, curry, chocolate fondant, cheesecake and crème brûlée.
- New dishes get the best matching illustration from their name, or a default one for their course, so every dish always has an image that fits.
- The chef can still upload their own photo when adding or editing a dish, with a preview and a Remove photo button. Only images under 2 MB are accepted, with a clear error message otherwise.
- Removed the dependency on an external image website, so images load instantly and work offline.
- One reusable `DishImage` component is used on all three screens.
- Real photos: put a `.jpg` named after the dish in `public/dishes/` (for example `garlic-bread.jpg`, `creme-brulee.jpg`) and it is used automatically. If the file is missing, the illustration is shown instead.

## Requirements checklist (final PoE)

| Requirement | Where it is in the app |
|---|---|
| Edit, update and delete menu items (changes shown immediately) | Dish Details: Edit and Delete (with confirmation). The form is pre-filled and the list, statistics and receipt update straight away. |
| Search by name, filter by course, clear both | Menu list: search box, All / Starters / Mains / Desserts chips, "Clear search and filter" button. |
| Statistics: total, average price, items per course | Home screen statistics panel, calculated by `calculateStats`. |
| Enhance the application | Reusable components and functions, clearer names, stronger validation, consistent layout (see change log items 4 and 5). |
| User experience | Success and error messages, input validation, Back links on every screen, one consistent look. |
| Receipt of selected dishes | Menu list Add buttons, "View order" bar, Receipt screen (change log item 6). |
| Dish images | Photos or illustrations on the list, details and receipt (change log item 7). |
| Demo video, GitHub repo, change log | Links below, and the change log above. |

The Part 2 courses are kept as Starter, Main and Dessert. The row of buttons at the top of the app is a demo screen switcher for reviewing screens, and is not part of the normal flow.

## Running the app
1. Copy `App.tsx` into your project's `src` folder.
2. Run `npm install` then `npm start` (or `npm run dev`).


## Links
- GitHub repository: _add link here_
- Demo video (YouTube, unlisted): https://youtu.be/rM_RHptqcSU?si=uCXRc18jQbFhJ73s

## AI use declaration
Claude (Anthropic) was used as an assistant to help draft this README. The code was reviewed and tested with Claude for errors.

## References
Anthropic (2026) *Claude* . Available at: https://claude.ai (Accessed: 6 November 2026).

MDN Web Docs (2026a) *FileReader*. Available at: https://developer.mozilla.org/en-US/docs/Web/API/FileReader (Accessed: 6 November 2026).

MDN Web Docs (2026b) *<input type="file">*. Available at: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file (Accessed: 6 November 2026).

MDN Web Docs (2026c) *SVG: Scalable Vector Graphics*. Available at: https://developer.mozilla.org/en-US/docs/Web/SVG (Accessed: 6 November 2026).

Meta Platforms (2026a) *React documentation*. Available at: https://react.dev (Accessed: 6 November 2026).

Meta Platforms (2026b) *Thinking in React*. Available at: https://react.dev/learn/thinking-in-react (Accessed: 6 November 2026).

Microsoft (2026) *TypeScript documentation*. Available at: https://www.typescriptlang.org/docs/ (Accessed: 6 November 2026).

The Independent Institute of Education (2026) *Portfolio of Evidence: Enhancing and Completing the Mobile Application*. Unpublished assessment brief. The Independent Institute of Education (Pty) Ltd.

Unsplash (2026) *Unsplash License*. Available at: https://unsplash.com/license (Accessed: 6 November 2026).

Pexels (2026) *Pexels License*. Available at: https://www.pexels.com/license/ (Accessed: 6 November 2026).

Add one reference for every photo you download (photographer, title, site, URL, date accessed).
