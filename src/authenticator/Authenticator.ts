import { CheBrowserOptionsCredentials, CheBrowser } from "../browser";

export interface Authenticator {
    authenticate: (browser: CheBrowser, credentials: CheBrowserOptionsCredentials) => Promise<void>;
}
