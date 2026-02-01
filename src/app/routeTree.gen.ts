// Manual route tree generation

import { Route as rootRoute } from "../routes/__root";
import { Route as IndexRoute } from "../routes/index";
import { Route as LoginRoute } from "../routes/login";
import { Route as SettingsRoute } from "../routes/settings";
import { Route as SongsIndexRoute } from "../routes/songs/index";
import { Route as SongsNewRoute } from "../routes/songs/new";
import { Route as SongDetailRoute } from "../routes/songs/$songId/index";
import { Route as VersionNewRoute } from "../routes/songs/$songId/versions/new";
import { Route as VersionDetailRoute } from "../routes/songs/$songId/versions/$versionId";

// Build the route tree
export const routeTree = rootRoute.addChildren([
  IndexRoute,
  LoginRoute,
  SettingsRoute,
  SongsIndexRoute,
  SongsNewRoute,
  SongDetailRoute,
  VersionNewRoute,
  VersionDetailRoute,
]);
