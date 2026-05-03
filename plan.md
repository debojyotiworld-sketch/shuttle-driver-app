1. **Fix `TripsScreen.tsx` for multiple tabs (Today, Upcoming, Completed)**:
   - Add a custom tab bar inside `TripsScreen` with 3 tabs: 'Today', 'Upcoming', and 'Completed'.
   - Filter the `trips` state depending on the active tab based on their `status` and `created_at` (or `scheduled_for` if exists, assuming `created_at` or `status` map to today/upcoming/completed).
2. **Live location fetching setup**:
   - `react-native-geolocation-service` is used for location. `recordLocation` uses `Geolocation.getCurrentPosition`, but `setInterval` is not ideal for continuous foreground background location without screen turning off.
   - To keep the screen on, we need `react-native-keep-awake` (or similar package like `@sayem314/react-native-keep-awake`). Let's check `package.json` to see if we have one. If not, we will install `react-native-keep-awake` and use it.
3. **Prevent Crash during Live Location (Android)**:
   - Android location requires `try...catch` blocks over native geolocation calls, and we must handle the case where permission is not granted.
   - Use `watchPosition` instead of `setInterval(getCurrentPosition)` for more reliable live tracking, which allows us to set `distanceFilter` and get continuous updates without manual timers. We should save the `watchId`.
4. **Fix Linters and Styles**:
   - Fix all existing lint warnings (missing dependencies in `useEffect`, `inline-styles`, unused variables like `err`).
   - Reapply the UI color palette logic safely and format correctly to prevent parsing errors.
5. **Pre Commit Checks**: Ensure all changes are verified with `npx tsc --noEmit` and `npm run lint` or `eslint .`.
